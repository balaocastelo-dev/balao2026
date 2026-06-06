"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export type AppleReview = {
  name: string;
  model: string;
  text: string;
};

export default function AppleReviewsCarousel({ reviews }: { reviews: AppleReview[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  if (!reviews.length) return null;

  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  const goNext = () => setCurrentIndex((prev) => (prev + 1) % reviews.length);

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {reviews.map((review, index) => (
            <div key={`${review.name}-${index}`} className="min-w-full">
              <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                <div className="flex gap-1 text-yellow-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="mt-5 text-base leading-8 text-gray-700 md:text-lg">"{review.text}"</p>
                <div className="mt-6">
                  <div className="text-lg font-black text-gray-900">{review.name}</div>
                  <div className="text-sm font-semibold uppercase tracking-wide text-red-600">{review.model}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {reviews.length > 1 ? (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Comentário anterior"
            className="absolute left-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white p-3 text-gray-700 shadow-md transition hover:bg-gray-50 md:left-4"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Próximo comentário"
            className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white p-3 text-gray-700 shadow-md transition hover:bg-gray-50 md:right-4"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="mt-5 flex items-center justify-center gap-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Ir para comentário ${index + 1}`}
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  currentIndex === index ? "w-8 bg-red-600" : "w-2.5 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
