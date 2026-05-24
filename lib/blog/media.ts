import sharp from 'sharp';
import { supabaseAdmin } from '@/lib/supabase-admin';

export type BlogImageVariants = {
  coverUrl: string;
  thumbUrl: string;
  socialUrl: string;
  ogUrl: string;
};

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'balao-bot/1.0 (+https://www.balao.info)',
      accept: 'image/*,*/*'
    },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(`Download imagem falhou: ${res.status}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

async function uploadJpeg(path: string, buf: Buffer): Promise<string> {
  const { error } = await supabaseAdmin.storage.from('blog').upload(path, buf, {
    contentType: 'image/jpeg',
    upsert: true
  });
  if (error) throw error;
  const { data } = supabaseAdmin.storage.from('blog').getPublicUrl(path);
  return data.publicUrl;
}

export async function ingestFeaturedImage(params: {
  postId: string;
  imageUrl: string;
}): Promise<BlogImageVariants> {
  const src = params.imageUrl.trim();
  const input = await fetchImageBuffer(src);
  const base = sharp(input).rotate();

  const cover = await base.clone().resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
  const thumb = await base
    .clone()
    .resize({ width: 640, height: 360, fit: 'cover' })
    .jpeg({ quality: 80 })
    .toBuffer();
  const social = await base
    .clone()
    .resize({ width: 1200, height: 630, fit: 'cover' })
    .jpeg({ quality: 82 })
    .toBuffer();
  const og = social;

  const coverUrl = await uploadJpeg(`${params.postId}/cover.jpg`, cover);
  const thumbUrl = await uploadJpeg(`${params.postId}/thumb.jpg`, thumb);
  const socialUrl = await uploadJpeg(`${params.postId}/social.jpg`, social);
  const ogUrl = await uploadJpeg(`${params.postId}/og.jpg`, og);

  return { coverUrl, thumbUrl, socialUrl, ogUrl };
}
