import path from 'node:path';
import sharp from 'sharp';
import { visit } from 'unist-util-visit';

const RASTER_IMAGE_PATTERN = /\.(?:avif|gif|jpe?g|png|tiff?|webp)$/i;

const getImagePath = (source, markdownPath) => {
  const pathname = decodeURI(source).split(/[?#]/, 1)[0];

  if (!pathname || !RASTER_IMAGE_PATTERN.test(pathname)) return null;

  if (pathname.startsWith('/')) {
    return path.resolve(process.cwd(), 'public', `.${pathname}`);
  }

  if (URL.canParse(pathname)) return null;

  return path.resolve(path.dirname(markdownPath), pathname);
};

export default function rehypeResponsiveImages({ maxWidth = 720, maxHeight = 720 } = {}) {
  return async (tree, file) => {
    if (typeof file.path !== 'string') return;

    const jobs = [];

    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img' || typeof node.properties?.src !== 'string') return;

      const source = node.properties.src;
      const imagePath = getImagePath(source, file.path);
      if (!imagePath) return;

      jobs.push(
        sharp(imagePath)
          .metadata()
          .then(({ width, height }) => {
            if (!width || !height) return;

            const scale = Math.min(1, maxWidth / width, maxHeight / height);
            const displayWidth = Math.max(1, Math.round(width * scale));
            const displayHeight = Math.max(1, Math.round(height * scale));

            node.properties.width = displayWidth;
            node.properties.height = displayHeight;
            node.properties.loading ??= 'lazy';
            node.properties.decoding ??= 'async';

            // Astro only transforms relative images imported from the Markdown file.
            // Public images still receive stable, appropriately capped dimensions.
            if (!source.startsWith('/')) {
              node.properties.layout = 'constrained';
              node.properties.sizes = `(max-width: ${displayWidth + 32}px) calc(100vw - 2rem), ${displayWidth}px`;
            }
          })
          .catch(() => {
            // Let Astro report an invalid or missing image using its normal diagnostics.
          }),
      );
    });

    await Promise.all(jobs);
  };
}
