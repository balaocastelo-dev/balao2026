import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/blog/store';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Params = Promise<{ slug: string }>;

export default async function Image(props: { params: Params }) {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  const title = post?.title || 'Blog | Balão da Informática';
  const category = post?.category || 'Notícias';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px',
          background: 'linear-gradient(135deg, #0b0b0b 0%, #1a1a1a 55%, #e60012 160%)',
          color: '#ffffff'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignSelf: 'flex-start',
              padding: '10px 14px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.12)',
              fontSize: '22px',
              fontWeight: 700
            }}
          >
            {category}
          </div>
          <div style={{ fontSize: '54px', fontWeight: 900, lineHeight: 1.1, maxWidth: '1088px' }}>
            {title}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '4px',
              background: '#e60012'
            }}
          />
          <div style={{ fontSize: '26px', fontWeight: 800 }}>Balão da Informática</div>
          <div style={{ fontSize: '22px', opacity: 0.85 }}>balao.info</div>
        </div>
      </div>
    ),
    { ...size }
  );
}

