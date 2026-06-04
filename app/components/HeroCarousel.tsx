"use client";

import { useEffect, useMemo, useState } from "react";

type HeroCarouselProps = {
  images: string[];
};

export function HeroCarousel({ images }: HeroCarouselProps) {
  const slides = useMemo(
    () => (images.length ? images : ["/hero-page-builder.png"]),
    [images]
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="heroCarousel" aria-label="網站視覺輪播">
      {slides.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden="true"
          className={index === activeIndex ? "heroSlide isActive" : "heroSlide"}
        />
      ))}
      {slides.length > 1 ? (
        <div className="heroDots" aria-label="輪播目前頁">
          {slides.map((src, index) => (
            <button
              key={`${src}-dot`}
              type="button"
              aria-label={`顯示第 ${index + 1} 張圖片`}
              aria-pressed={index === activeIndex}
              className={index === activeIndex ? "heroDot isActive" : "heroDot"}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
