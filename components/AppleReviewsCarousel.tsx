"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export type AppleReview = {
  name: string;
  model: string;
  text: string;
};

export default function AppleReviewsCarousel({ reviews }: { reviews: AppleReview[] }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(1);

  useEffect(() => {
    const updateCardsPerPage = () => {
      if (window.innerWidth >= 1280) {
        setCardsPerPage(3);
        return;
      }
      if (window.innerWidth >= 768) {
        setCardsPerPage(2);
        return;
      }
      setCardsPerPage(1);
    };

    updateCardsPerPage();
    window.addEventListener("resize", updateCardsPerPage);
    return () => window.removeEventListener("resize", updateCardsPerPage);
  }, []);

  const pages = useMemo(() => {
    const chunks: AppleReview[][] = [];
    for (let index = 0; index < reviews.length; index += cardsPerPage) {
      chunks.push(reviews.slice(index, index + cardsPerPage));
    }
    return chunks;
  }, [reviews, cardsPerPage]);

  useEffect(() => {
    if (currentPage > Math.max(0, pages.length - 1)) {
      setCurrentPage(0);
    }
  }, [currentPage, pages.length]);

  useEffect(() => {
    if (pages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % pages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [pages.length]);

  if (!reviews.length) return null;

  const goPrev = () => setCurrentPage((prev) => (prev - 1 + pages.length) % pages.length);
  const goNext = () => setCurrentPage((prev) => (prev + 1) % pages.length);

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentPage * 100}%)` }}
        >
          {pages.map((page, pageIndex) => (
            <div key={pageIndex} className="min-w-full">
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {page.map((review, index) => (
                  <div key={`${review.name}-${pageIndex}-${index}`} className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm md:p-8">
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
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {pages.length > 1 ? (
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
            {pages.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Ir para comentário ${index + 1}`}
                onClick={() => setCurrentPage(index)}
                className={`h-2.5 rounded-full transition-all ${
                  currentPage === index ? "w-8 bg-red-600" : "w-2.5 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
