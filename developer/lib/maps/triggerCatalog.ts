/** Triggers observados en mapas + confirmados por código del stack nuevo. */
export type TriggerDef = {
  value: number;
  label: string;
  color: string;
  confirmed: boolean;
  description: string;
};

export const WOAO_TRIGGERS: TriggerDef[] = [
  {
    value: 1,
    label: "Bajo techo / interior",
    color: "#9b5de5",
    confirmed: true,
    description: "Cliente: oculta techos / trata como interior (Engine trigger===1).",
  },
  {
    value: 2,
    label: "Trigger 2",
    color: "#c77dff",
    confirmed: false,
    description: "Presente en mapas. Sin handler dedicado en server nuevo.",
  },
  {
    value: 3,
    label: "Trigger 3",
    color: "#b5179e",
    confirmed: false,
    description: "Presente en mapas. No inventar semántica AO clásica.",
  },
  {
    value: 4,
    label: "Cárcel",
    color: "#f72585",
    confirmed: true,
    description: "Server: isJailTile (game.ts trigger===4).",
  },
  {
    value: 5,
    label: "Trigger 5",
    color: "#7209b7",
    confirmed: false,
    description: "Presente en mapas. Sin handler dedicado encontrado.",
  },
  {
    value: 6,
    label: "Zona segura",
    color: "#4cc9f0",
    confirmed: true,
    description: "Server: safeZone.ts (trigger===6).",
  },
];

export function triggerColor(value: number): string {
  return WOAO_TRIGGERS.find((t) => t.value === value)?.color ?? "#c77dff";
}

export function triggerLabel(value: number): string {
  return (
    WOAO_TRIGGERS.find((t) => t.value === value)?.label ?? `Trigger ${value}`
  );
}
