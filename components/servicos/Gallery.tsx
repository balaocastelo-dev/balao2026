import Image from 'next/image'

interface GalleryProps {
  images: { src: string; alt: string }[]
}

export default function Gallery({ images }: GalleryProps) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Nosso Laboratório</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Precisão, agilidade e cuidado com seu dispositivo</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square rounded-2xl overflow-hidden">
              <Image 
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
