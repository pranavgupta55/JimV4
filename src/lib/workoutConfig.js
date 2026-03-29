export const MUSCLE_GROUP_ORDER = [
  'Chest',
  'Back',
  'Front Delts',
  'Rear Delts',
  'Biceps',
  'Bicep',
  'Triceps',
  'Legs',
  'Calves',
  'Core'
];

export const MUSCLE_GROUP_SHORT_LABELS = {
  Chest: 'Chest',
  Back: 'Back',
  'Front Delts': 'Front',
  'Rear Delts': 'Rear',
  Biceps: 'Biceps',
  Bicep: 'Biceps',
  Triceps: 'Triceps',
  Legs: 'Legs',
  Calves: 'Calves',
  Core: 'Core'
};

export const FALLBACK_MUSCLE_IMAGES = {
  Chest: '/chest.png',
  Back: '/lats.png',
  'Front Delts': '/shoulders.png',
  'Rear Delts': '/shoulders.png',
  Biceps: '/biceps.png',
  Bicep: '/biceps.png',
  Triceps: '/triceps.png',
  Legs: '/quads.png',
  Calves: '/calves.png',
  Core: '/core.png'
};

export function sortMuscleGroups(groups = []) {
  return [...groups].sort((a, b) => {
    const aIndex = MUSCLE_GROUP_ORDER.indexOf(a.name);
    const bIndex = MUSCLE_GROUP_ORDER.indexOf(b.name);

    const resolvedA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const resolvedB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;

    if (resolvedA !== resolvedB) return resolvedA - resolvedB;
    return (a.sort_order ?? 999) - (b.sort_order ?? 999);
  });
}

export function resolveMuscleImage(group) {
  if (group?.image_url) return group.image_url;
  return FALLBACK_MUSCLE_IMAGES[group?.name] ?? '/core.png';
}
