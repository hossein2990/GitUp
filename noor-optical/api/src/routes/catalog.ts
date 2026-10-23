import { Router } from 'express';
import {
  getBrandBySlug,
  getCategoryBySlug,
  getFacets,
  getProductBySlug,
  getRelatedProducts,
  getSearchSuggestions,
  listBrands,
  listCategories,
  listProducts,
} from '../domain/catalog.js';
import { asyncRoute, notFoundError, requiredString } from '../http.js';

export const catalogRouter = Router();

catalogRouter.get(
  '/categories',
  asyncRoute(async (_req, res) => {
    res.json({ items: await listCategories() });
  }),
);

catalogRouter.get(
  '/categories/:slug',
  asyncRoute(async (req, res) => {
    const category = await getCategoryBySlug(req.params.slug);
    if (!category) throw notFoundError('Category not found');
    res.json(category);
  }),
);

catalogRouter.get(
  '/brands',
  asyncRoute(async (_req, res) => {
    res.json({ items: await listBrands() });
  }),
);

catalogRouter.get(
  '/brands/:slug',
  asyncRoute(async (req, res) => {
    const brand = await getBrandBySlug(req.params.slug);
    if (!brand) throw notFoundError('Brand not found');
    res.json(brand);
  }),
);

catalogRouter.get(
  '/products',
  asyncRoute(async (req, res) => {
    res.json(await listProducts(req.query as Record<string, unknown>));
  }),
);

catalogRouter.get(
  '/products/facets',
  asyncRoute(async (req, res) => {
    res.json(await getFacets(req.query as Record<string, unknown>));
  }),
);

catalogRouter.get(
  '/products/:slug',
  asyncRoute(async (req, res) => {
    const product = await getProductBySlug(req.params.slug);
    if (!product) throw notFoundError('Product not found');
    const related = await getRelatedProducts(product);
    res.json({ product, related });
  }),
);

catalogRouter.get(
  '/search/suggest',
  asyncRoute(async (req, res) => {
    const term = typeof req.query.q === 'string' ? req.query.q : '';
    res.json(await getSearchSuggestions(term));
  }),
);

catalogRouter.get(
  '/search',
  asyncRoute(async (req, res) => {
    const term = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const { q: _q, ...rest } = req.query as Record<string, unknown>;
    const result = await listProducts({ ...rest, q: term });
    res.json({ ...result, query: term });
  }),
);
