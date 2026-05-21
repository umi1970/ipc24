import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    date: z.coerce.date(),
    author: z.string(),
    cover: z.string().optional(),
    tags: z.array(z.string()).default([]),
    description: z.string(),
    lang: z.enum(["de", "en"]).default("de"),
    draft: z.boolean().default(false),
  }),
});

const servicesCollection = defineCollection({
  type: "data",
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    icon: z.string().optional(),
    order: z.number().default(0),
  }),
});

export const collections = {
  "blog/de": blogCollection,
  "blog/en": blogCollection,
  services: servicesCollection,
};
