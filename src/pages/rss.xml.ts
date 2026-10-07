import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../config';
import { getPublishedPosts, postPath } from '../lib/posts';

export async function GET(context: APIContext) {
  // astro.config.mjs の site は常に設定されている前提
  if (!context.site) throw new Error('astro.config.mjs に site が設定されていません。');
  const posts = await getPublishedPosts();

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: postPath(post),
      categories: [post.data.category, ...post.data.tags],
    })),
  });
}
