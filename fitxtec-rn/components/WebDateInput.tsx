import React from "react";
import { Platform } from "react-native";

type Props = {
  value?: Date | null;
  onChange: (d: Date) => void;
  style?: React.CSSProperties;
};

// Sencillo input de fecha para web usando un <input type="date"> nativo.
// Mantiene el formato YYYY-MM-DD y normaliza la zona horaria para evitar desfases.
export default function WebDateInput({ value, onChange, style }: Props) {
  if (Platform.OS !== "web") return null as any;

  // Normaliza a YYYY-MM-DD respetando TZ local
  const valueStr = value
    ? new Date(value.getTime() - value.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10)
    : "";

  const handleChange = (e: any) => {
    const v: string | undefined = e?.target?.value;
    if (v) {
      // Construye Date a medianoche local
      const d = new Date(`${v}T00:00:00`);
      onChange(d);
    }
  };

  // @ts-ignore - usamos API específica de react-native-web para crear elementos HTML
  const rnw: any = require("react-native-web");
  return rnw.unstable_createElement("input", {
    type: "date",
    value: valueStr,
    onChange: handleChange,
    style: {
      width: "100%",
      height: 44,
      backgroundColor: "#1E1E1E",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.1)",
      color: "white",
      paddingLeft: 12,
      ...(style || {}),
    },
  });
}
