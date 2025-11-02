import { AiRoutineJSON } from "./Routines";
import { EXERCISES } from "../data/exercises";

type Level = "Beginner" | "Intermediate" | "Advanced";

function normPrompt(p: string) {
  const t = p.toLowerCase();
  return {
    brazos: /brazo|bíceps|tr[ií]ceps/.test(t),
    piernas: /pierna|cu[aá]driceps|gl[úu]teo|femoral/.test(t),
    pecho: /pecho|banca/.test(t),
    espalda: /espalda|remo|dominada/.test(t),
    hombros: /hombro|deltoide/.test(t),

    principiante: /principi|beginner|empezar/.test(t),
    intermedio: /interme/.test(t),
    avanzado: /avanza/.test(t),

    dias4: /\b4\s*d[ií]as\b/.test(t),
    dias3: /\b3\s*d[ií]as\b/.test(t),
    dias2: /\b2\s*d[ií]as\b/.test(t),
  };
}

function pick<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (copy.length && out.length < n) {
    const i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}

function seriesFor(level: Level, kind: "compound"|"accessory") {
  if (kind === "compound") return level === "Advanced" ? 4 : 3;
  // accesorios
  return level === "Advanced" ? 3 : 2;
}

export function generateOfflineRoutineFromCatalog(userPrompt: string): AiRoutineJSON {
  const k = normPrompt(userPrompt);
  const level: Level = k.avanzado ? "Advanced" : k.intermedio ? "Intermediate" : "Beginner";
  const days = k.dias2 ? 2 : k.dias3 ? 3 : k.dias4 ? 4 : (level === "Beginner" ? 3 : 4);
  const time = level === "Advanced" ? "60-75 min" : "40-55 min";

  // Foco para nombrar días
  const upperName = k.brazos ? "Upper (Arms Focus)"
                   : k.pecho ? "Upper (Chest Focus)"
                   : k.espalda ? "Upper (Back Focus)"
                   : k.hombros ? "Upper (Shoulders Focus)"
                   : "Upper Body Workout";
  const lowerName = k.piernas ? "Lower (Legs Focus)" : "Lower Body Workout";

  // ——— Día Upper ———
  const upperComp = pick(EXERCISES.upper_compounds, 2).map(e => ({
    id: e.id, nombre: e.name, series: seriesFor(level,"compound")
  }));

  const chest = pick(EXERCISES.upper_accessories.chest, 1).map(e => ({ id:e.id, nombre:e.name, series: seriesFor(level,"accessory") }));
  const back  = pick(EXERCISES.upper_accessories.back, 1).map(e => ({ id:e.id, nombre:e.name, series: seriesFor(level,"accessory") }));
  const shou  = pick(EXERCISES.upper_accessories.shoulders, 1).map(e => ({ id:e.id, nombre:e.name, series: seriesFor(level,"accessory") }));
  const bi    = pick(EXERCISES.upper_accessories.biceps, 1).map(e => ({ id:e.id, nombre:e.name, series: seriesFor(level,"accessory") }));
  const tri   = pick(EXERCISES.upper_accessories.triceps, 1).map(e => ({ id:e.id, nombre:e.name, series: seriesFor(level,"accessory") }));

  const upperExercises = [...upperComp, ...chest, ...back, ...shou, ...bi, ...tri];

  // ——— Día Lower ———
  const lowerComp = pick(EXERCISES.lower_compounds, 2).map(e => ({
    id: e.id, nombre: e.name, series: seriesFor(level,"compound")
  }));

  const quads = pick(EXERCISES.lower_accessories.quads, 1).map(e => ({ id:e.id, nombre:e.name, series: seriesFor(level,"accessory") }));
  const hams  = pick(EXERCISES.lower_accessories.hamstrings, 1).map(e => ({ id:e.id, nombre:e.name, series: seriesFor(level,"accessory") }));
  const gl    = pick(EXERCISES.lower_accessories.glutes, 1).map(e => ({ id:e.id, nombre:e.name, series: seriesFor(level,"accessory") }));
  const calves= pick(EXERCISES.lower_accessories.calves, 1).map(e => ({ id:e.id, nombre:e.name, series: seriesFor(level,"accessory") }));
  const core  = pick(EXERCISES.lower_accessories.core, 1).map(e => ({ id:e.id, nombre:e.name, series: seriesFor(level,"accessory") }));

  const lowerExercises = [...lowerComp, ...quads, ...hams, ...gl, ...calves, ...core];

  // Si pide 3 días, creamos un full body ligero
  const fullBody = () => {
    const fb: { id:string; nombre:string; series:number }[] = [];
    fb.push(...pick(EXERCISES.upper_compounds, 1).map(e => ({ id:e.id, nombre:e.name, series: 3 })));
    fb.push(...pick(EXERCISES.lower_compounds, 1).map(e => ({ id:e.id, nombre:e.name, series: 3 })));
    fb.push(...pick(EXERCISES.upper_accessories.shoulders, 1).map(e => ({ id:e.id, nombre:e.name, series: 2 })));
    fb.push(...pick(EXERCISES.upper_accessories.biceps, 1).map(e => ({ id:e.id, nombre:e.name, series: 2 })));
    fb.push(...pick(EXERCISES.lower_accessories.core, 1).map(e => ({ id:e.id, nombre:e.name, series: 2 })));
    return fb;
  };

  const out: AiRoutineJSON = {
    rutina: {
      nombre: "AI Routine (Offline)",
      cantidadDias: days,
      tiempoAproximado: time,
      nivelDificultad: level,
      descripcion: "Rutina generada localmente a partir de tu pedido. Segura y progresiva.",
      notas: "Calienta 5–8 min. Ajusta 1 serie si sientes fatiga. Mantén técnica estricta."
    },
    dias: [
      { id: 1, nombre: upperName, ejercicios: upperExercises },
      { id: 2, nombre: lowerName, ejercicios: lowerExercises },
    ]
  };

  if (days === 3) {
    out.dias.push({ id: 3, nombre: "Full Body (Ligero)", ejercicios: fullBody() });
  }
  // Si days = 4, tu app repetirá 1 y 2 (no añadimos 3 y 4)

  return out;
}
