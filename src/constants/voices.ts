export interface VoiceOption {
  id: string;
  name: string;
  desc: string;
  gender: "Masculino" | "Feminino";
  previewUrl?: string;
}

export const VOICES: VoiceOption[] = [
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", desc: "Natural e confiante", gender: "Masculino" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian", desc: "Madura e autoridade", gender: "Masculino" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", desc: "Clara e profissional", gender: "Feminino" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", desc: "Elegante e suave", gender: "Feminino" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", desc: "Clássica", gender: "Masculino" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", desc: "Grave", gender: "Masculino" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", desc: "Jovem", gender: "Feminino" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", desc: "Suave", gender: "Feminino" },
];

export const DEFAULT_VOICE_ID = "onwK4e9ZLuTAKqWW03F9";

export function getVoiceById(id: string) {
  return VOICES.find((v) => v.id === id);
}
