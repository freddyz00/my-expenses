export const CATEGORIES = [
  { name: 'Food', color: '#2563EB', tint: '#EAF1FE' },
  { name: 'Shopping', color: '#C2410C', tint: '#FDEEE6' },
  { name: 'Transport', color: '#0F766E', tint: '#E3F4F1' },
  { name: 'Others', color: '#475569', tint: '#EDF0F4' },
];

const OTHERS = CATEGORIES[CATEGORIES.length - 1];

export function isKnownCategory(name) {
  return CATEGORIES.some((c) => c.name === name);
}

export function getCategory(name) {
  return CATEGORIES.find((c) => c.name === name) ?? { ...OTHERS, name: name || OTHERS.name };
}
