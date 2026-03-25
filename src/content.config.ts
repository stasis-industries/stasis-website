import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docsCollection = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/docs" }),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
	}),
});

const blogCollection = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		author: z.string().default('Teddy Truong'),
		date: z.string(),           // ISO date: "2026-03-24"
		readTime: z.number(),       // estimated minutes
		tags: z.array(z.string()).optional(),
		image: z.string().optional(), // path relative to /public, e.g. "/blog/braess-chart.png"
		imageAlt: z.string().optional(),
		status: z.enum(['draft', 'preliminary', 'published']).default('preliminary'),
	}),
});

export const collections = {
	docs: docsCollection,
	blog: blogCollection,
};
