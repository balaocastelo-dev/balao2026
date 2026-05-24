import Image from 'next/image';

export default function BlogGallery(props: { images: string[]; title: string }) {
  const images = props.images.filter(Boolean).slice(0, 12);
  if (images.length === 0) return null;

  return (
    <section className="mt-6">
      <h3 className="text-base font-bold text-gray-900">Galeria</h3>
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((src, idx) => (
          <div key={`${src}-${idx}`} className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 border">
            <Image
              src={src}
              alt={`${props.title} — imagem ${idx + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

