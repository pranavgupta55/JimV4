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

export const MUSCLE_GROUP_TAB_LABELS = {
  Chest: 'Chest',
  Back: 'Back',
  'Front Delts': 'F Delts',
  'Rear Delts': 'R Delts',
  Biceps: 'Biceps',
  Bicep: 'Biceps',
  Triceps: 'Tri',
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

export const IMAGE_PATH_ALIASES = {
  '/muscle_images/1.png': '/biceps.png',
  '/muscle_images/2.png': '/calves.png',
  '/muscle_images/3.png': '/chest.png',
  '/muscle_images/4.png': '/core.png',
  '/muscle_images/8.png': '/lats.png',
  '/muscle_images/9.png': '/quads.png',
  '/muscle_images/10.png': '/shoulders.png',
  '/muscle_images/11.png': '/shoulders.png',
  '/muscle_images/12.png': '/triceps.png'
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
  if (group?.image_url && IMAGE_PATH_ALIASES[group.image_url]) {
    return IMAGE_PATH_ALIASES[group.image_url];
  }

  if (group?.image_url && !group.image_url.includes('/muscle_images/')) {
    return group.image_url;
  }

  return FALLBACK_MUSCLE_IMAGES[group?.name] ?? '/core.png';
}
