import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/color";
import { saveRoutineFromAI, AiRoutineJSON } from "../services/Routines";
import { generateOfflineRoutineFromCatalog } from "../services/offlineGenerator";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../services/AuthContext";

function isRoutineIntent(prompt: string) {
  const t = prompt.toLowerCase();
  return /rutina|entren(amiento|ar)|gym|fuerza|pierna|pecho|espalda|brazos|hombros|full body/.test(t);
}

async function pickAvailableModel(preferred: string, apiKey: string) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    const data = await res.json();
    const names: string[] = (data?.models || []).map((m: any) => String(m?.name || ""));
    const ids = names.map(n => n.replace(/^models\//, "")); // quita "models/"

    // 1) si existe el preferido, úsalo
    if (ids.includes(preferred)) return preferred;

    // 2) fallback por preferencia
    const wanted = [
      "gemini-1.5-flash-002",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
    ];
    for (const w of wanted) if (ids.includes(w)) return w;

    // 3) cualquier "flash" disponible
    const anyFlash = ids.find(x => /flash/i.test(x));
    return anyFlash || ids[0] || preferred;
  } catch {
    return preferred; // si falla el listado, intenta con el preferido
  }
}


/** Llamada directa a Gemini usando la API key desde .env (para prototipo académico). */
async function generateViaGeminiDirect(prompt: string) {
  const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;
  const preferred = process.env.EXPO_PUBLIC_GEMINI_MODEL || "gemini-1.5-flash-002";
  if (!API_KEY) return { error: "Falta EXPO_PUBLIC_GEMINI_API_KEY en .env" };

  // 1) Prompt con instrucción dura de JSON-ONLY
  const SYSTEM = `
Eres un generador de rutinas. Devuelve **ÚNICAMENTE** un JSON VÁLIDO (sin texto extra, sin backticks) con este esquema:

{
  "rutina": {
    "nombre": string,
    "cantidadDias": number,
    "tiempoAproximado": string,
    "nivelDificultad": "Beginner" | "Intermediate" | "Advanced",
    "descripcion": string,
    "notas": string | null
  },
  "dias": [
    { "id": number, "nombre": string,
      "ejercicios": [ { "id": string, "nombre": string, "series": number } ]
    }
  ]
}

Reglas:
- Si no hay contexto: principiante, 2–3 días/sem, 35–50 min.
- Si "cantidadDias" es 4, define SOLO 2 días (1=Upper, 2=Lower). La app repetirá.
- Compuestos 3–4 series; accesorios 2–3.
- No agregues campos extra ni texto fuera del JSON.
- Si piden algo que NO sea rutina: {"error":"Lo siento, solo puedo generar rutinas de entrenamiento."}
`.trim();

  const MODEL = await pickAvailableModel(preferred, API_KEY);

  // ... (resto de tu función se queda igual, usando MODEL en la URL v1)
  const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`;

  
  const payload = {
    generationConfig: { temperature: 0.3 },
    contents: [
      { role: "user", parts: [{ text: SYSTEM + "\n\nUsuario: " + prompt }] }
    ]
  };

  const extractJson = (text: string) => {
    // intenta parsear directo
    try { return JSON.parse(text); } catch {}
    // si vino con texto extra, extrae el primer bloque {...}
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try { return JSON.parse(m[0]); } catch {}
    }
    return null;
  };

  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await r.json().catch(() => ({}));
    console.log("Gemini status:", r.status, "model:", MODEL, "api:v1");

    if (!r.ok) {
      console.log("Gemini error body:", data);
      // Fallback a versión fija si -latest no está disponible
      if (r.status === 404 && MODEL.endsWith("-latest")) {
        const altUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-002:generateContent?key=${API_KEY}`;
        const r2 = await fetch(altUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const d2 = await r2.json().catch(() => ({}));
        console.log("Gemini alt status:", r2.status, "model: gemini-1.5-flash-002", "api:v1");
        if (!r2.ok) return { error: "Gemini falló: " + (d2?.error?.message || `HTTP ${r2.status}`) };
        const t2 = d2?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const parsed2 = extractJson(t2);
        return parsed2 ?? { error: "Respuesta no parseable." };
      }
      return { error: "Gemini falló: " + (data?.error?.message || `HTTP ${r.status}`) };
    }

    // OK (200)
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = extractJson(text);
    return parsed ?? { error: "Respuesta no parseable." };
  } catch (e) {
    console.log("Network error:", e);
    return { error: "Error de red hacia Gemini." };
  }
}


export default function AiRoutineGenerator({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (newId: string) => void;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ who: "user" | "ai"; text: string }>>([]);
  const [preview, setPreview] = useState<AiRoutineJSON | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const { user } = useAuth();

  const scrollToEnd = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 10);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((m) => [...m, { who: "user", text }]);
    setInput("");
    setPreview(null);
    setLoading(true);
    scrollToEnd();

    // 1) Guard de intención
    if (!isRoutineIntent(text)) {
      setMessages((m) => [
        ...m,
        { who: "ai", text: "Lo siento, solo puedo generar rutinas de entrenamiento." },
      ]);
      setLoading(false);
      scrollToEnd();
      return;
    }

    // 2) Intentar con Gemini
    let result = await generateViaGeminiDirect(text);

    // 3) Fallback offline si falla/limita/agotada cuota
    if (!result || ("error" in result)) {
      setMessages((m) => [
        ...m,
        { who: "ai", text: "Sin respuesta del proveedor. Generé una versión offline 😉" },
      ]);
      // Simula latencia breve
      await new Promise((r) => setTimeout(r, 400));
      result = generateOfflineRoutineFromCatalog(text);
    } else {
      setMessages((m) => [...m, { who: "ai", text: "Tengo una propuesta de rutina. Revísala abajo 👇" }]);
    }

    setPreview(result as AiRoutineJSON);
    setLoading(false);
    scrollToEnd();
  };

  const regenerate = async () => {
    const lastUser =
      [...messages].reverse().find((m) => m.who === "user")?.text ||
      "Quiero una rutina para empezar en el gym";
    setInput(lastUser);
    await send();
  };

  const save = async () => {
    if (!preview || loading) return;
    setLoading(true);
    try {
      //quitar despues 
      console.log("Guardando rutina con userId:", user?.id);
      const id = await saveRoutineFromAI(preview, user?.id);
      setMessages((m) => [...m, { who: "ai", text: "¡Rutina guardada!" }]);
      onSaved(id);
    } catch (e) {
      console.error(e);
      setMessages((m) => [...m, { who: "ai", text: "No pude guardar la rutina." }]);
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header mini */}
      <View style={s.header}>
        <TouchableOpacity onPress={onClose} style={{ padding: 6 }}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={s.title}>AI Routine Builder</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Chat */}
      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {messages.map((m, i) => (
          <View key={i} style={[s.bubble, m.who === "user" ? s.me : s.ai]}>
            <Text style={s.bubbleText}>{m.text}</Text>
          </View>
        ))}

        {loading && (
          <View style={[s.bubble, s.ai, { flexDirection: "row", alignItems: "center", gap: 8 }]}>
            <ActivityIndicator color={colors.primary} />
            <Text style={s.bubbleText}>Generando rutina…</Text>
          </View>
        )}

        {/* Preview de rutina */}
        {preview && (
          <View style={s.previewCard}>
            <Text style={s.previewTitle}>{preview.rutina.nombre}</Text>
            <Text style={s.previewSub}>
              {preview.rutina.cantidadDias} días • {preview.rutina.tiempoAproximado} •{" "}
              {preview.rutina.nivelDificultad}
            </Text>
            <Text style={s.previewDesc}>{preview.rutina.descripcion}</Text>
            {preview.rutina.notas ? <Text style={s.previewNotes}>💡 {preview.rutina.notas}</Text> : null}

            {preview.dias.map((d) => (
              <View key={d.id} style={{ marginTop: 12 }}>
                <Text style={s.dayTitle}>
                  {d.id}. {d.nombre}
                </Text>
                {d.ejercicios.map((e) => (
                  <Text key={e.id} style={s.exerciseLine}>
                    • {e.nombre} — {e.series} sets
                  </Text>
                ))}
              </View>
            ))}

            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <TouchableOpacity
                onPress={regenerate}
                style={[s.actionBtn, { backgroundColor: "#1f2530", borderColor: colors.border }]}
              >
                <Text style={s.actionText}>Generate again</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={save} style={[s.actionBtn, { backgroundColor: colors.primary }]}>
                <Text style={[s.actionText, { color: "#0b0f0a" }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={s.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ej: Quiero una rutina para crecer brazos 3 días…"
          placeholderTextColor={colors.textMuted}
          style={s.input}
          multiline
        />
        <TouchableOpacity onPress={send} disabled={loading} style={s.sendBtn}>
          <Ionicons name="send" size={18} color="#0b0f0a" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1f1f1f",
  },
  title: { color: "#fff", fontWeight: "800", fontSize: 16 },
  bubble: { maxWidth: "85%", padding: 10, borderRadius: 12, marginVertical: 6 },
  me: { alignSelf: "flex-end", backgroundColor: "#1f2530", borderWidth: 1, borderColor: "#273044" },
  ai: { alignSelf: "flex-start", backgroundColor: "#11141b", borderWidth: 1, borderColor: "#252a38" },
  bubbleText: { color: "#e5e7eb" },

  inputRow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    padding: 10,
    gap: 8,
    backgroundColor: "#0f1116",
    borderTopWidth: 1,
    borderTopColor: "#1f1f1f",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
    backgroundColor: "#121620",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  previewCard: {
    backgroundColor: "#0f1118",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginTop: 8,
  },
  previewTitle: { color: "#fff", fontWeight: "800", fontSize: 16 },
  previewSub: { color: "#b9c0cb", marginTop: 2 },
  previewDesc: { color: "#c7ccd6", marginTop: 8, lineHeight: 20 },
  previewNotes: { color: colors.primary, marginTop: 6 },
  dayTitle: { color: colors.primary, marginTop: 8, fontWeight: "700" },
  exerciseLine: { color: "#e5e7eb", marginTop: 2 },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { color: "#fff", fontWeight: "700" },
});
