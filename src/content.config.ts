import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORY_KEYS } from './config';

const blog = defineCollection({
  loader: glob({ pattern: '**/index.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      category: z.enum(CATEGORY_KEYS),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      coverTitleLines: z.array(z.string().min(1)).min(1).max(4).optional(),
      cover: image().optional(),
      coverAlt: z.string().default(''),
    }),
});

export const collections = { blog };
