import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

// 下書きを除いた公開記事を新しい順に返す（同日の記事は id で順序を安定させる）
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort(
    (a, b) =>
      b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf() || b.id.localeCompare(a.id),
  );
}

// コンテンツの id（例: 20260101-abc123/index）から URL 用のスラッグを取り出す
export function postSlug(entry: Post): string {
  return entry.id.replace(/\/index$/, '');
}

// 記事ページのパス
export function postPath(entry: Post): string {
  return `/posts/${postSlug(entry)}/`;
}
