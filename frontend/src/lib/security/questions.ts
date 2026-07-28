export const SECURITY_QUESTIONS = [
  "¿Nombre de tu primera mascota?",
  "¿Ciudad donde naciste?",
  "¿Nombre de tu madre?",
  "¿Tu comida favorita?",
  "¿Nombre de tu mejor amiga de infancia?",
] as const;

export type SecurityQuestion = (typeof SECURITY_QUESTIONS)[number];
