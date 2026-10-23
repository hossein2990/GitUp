/**
 * Imagery used for editorial surfaces (hero, showroom, guides). These are the
 * same openly licensed references the catalogue seed uses, kept in one module so
 * the business can swap every editorial photo in a single place.
 */
const photo = (id: string, width = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${width}`;

export const HERO_IMAGE = photo('1604781099561-c70393a38a6d', 1800);
export const BOUTIQUE_IMAGE = photo('1486250944723-86bca2b15b06');
export const CRAFT_IMAGE = photo('1544177586-c9b9fb1f45c2');
export const LIFESTYLE_IMAGE = photo('1616769402452-267817d74fba');
export const CONSULT_IMAGE = photo('1775338845696-3d6b1f5e2124', 1400);
export const RACK_IMAGE = photo('1534078477103-9f6a18b3a5e2');
export const SHOWROOM_IMAGE = photo('1764778055595-b641b067ab40');
