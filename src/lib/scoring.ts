export interface ScoreModifier {
  modifier_value: number | string;
}

export function sumModifiers(modifiers: ScoreModifier[]): number {
  return modifiers.reduce((s, m) => s + Number(m.modifier_value), 0);
}

export function computeFinalScore(baseline: number | string, modifiers: ScoreModifier[]): number {
  return Number(baseline) * (1 + sumModifiers(modifiers));
}
