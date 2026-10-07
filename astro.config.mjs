import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import remarkJapaneseStrong from './src/lib/remark-japanese-strong.mjs';
import remarkLinkCards from './src/lib/remark-link-cards.mjs';
import remarkTalk from './src/lib/remark-talk.mjs';
import { CHARACTERS } from './src/config.ts';
import rehypeResponsiveImages from './src/lib/rehype-responsive-images.mjs';

export default defineConfig({
  site: process.env.SITE_URL || 'https://example.com',
  output: 'static',
  trailingSlash: 'always',
  image: {
    responsiveStyles: true,
    breakpoints: [320, 480, 640, 720, 960, 1280, 1440],
  },
  integrations: [
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname;
        return !pathname.startsWith('/search/') && !pathname.startsWith('/og/');
      },
    }),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkJapaneseStrong, remarkLinkCards, [remarkTalk, CHARACTERS]],
      rehypePlugins: [[rehypeResponsiveImages, { maxWidth: 720, maxHeight: 720 }]],
    }),
    shikiConfig: {
      theme: 'css-variables',
      wrap: true,
    },
  },
});
