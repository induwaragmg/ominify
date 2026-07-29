"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Zap, Flame } from "lucide-react";

interface Slide {
  id: number;
  badge: string;
  badgeIcon: React.ElementType;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  accentBg: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    badge: "New Collection",
    badgeIcon: Sparkles,
    title: "Find Your Style, Love Your Look ✨",
    subtitle: "Discover the latest trends in fashion, footwear, and lifestyle essentials.",
    ctaText: "Shop Collection",
    ctaLink: "/categories/fashion",
    image: "/banners/banner1.png",
    accentBg: "bg-purple-500/20 text-purple-200 border-purple-300/30",
  },
  {
    id: 2,
    badge: "Tech & Audio Sale",
    badgeIcon: Zap,
    title: "Next-Gen Audio & Smart Tech 🎧",
    subtitle: "Upgrade your setup with premium headphones, smart watches, and accessories.",
    ctaText: "Explore Tech",
    ctaLink: "/products?category=electronics",
    image: "/banners/banner2.png",
    accentBg: "bg-blue-500/20 text-blue-200 border-blue-300/30",
  },
  {
    id: 3,
    badge: "Limited Edition",
    badgeIcon: Flame,
    title: "Curated Luxury & Everyday Gear 👜",
    subtitle: "Explore handcrafted bags, sunglasses, and aesthetic home lifestyle pieces.",
    ctaText: "Browse Gear",
    ctaLink: "/products",
    image: "/banners/banner3.png",
    accentBg: "bg-amber-500/20 text-amber-200 border-amber-300/30",
  },
];

const HeroCarousel = (): JSX.Element => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play interval (5 seconds)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="group relative w-full mb-4 overflow-hidden rounded-3xl border border-gray-100 bg-gray-900 shadow-md transition-all"
    >
      {/* ── CAROUSEL HEIGHT / ASPECT RATIO CONTAINER ──
          Mobile: h-[290px] (taller aspect ratio so content doesn't cramp)
          Tablet: h-[330px]
          Desktop: h-[380px] lg:h-[400px] (3:1 / 21:9 ratio view)
      */}
      <div className="relative w-full h-[290px] sm:h-[330px] md:h-[360px] lg:h-[390px]">
        {SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          const BadgeIcon = slide.badgeIcon;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 pointer-events-auto z-10" : "opacity-0 pointer-events-none z-0"
              }`}
            >
              {/* Background Image */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover object-right sm:object-center transition-transform duration-1000 group-hover:scale-105"
              />

              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent sm:from-black/70 sm:via-black/35" />

              {/* Slide Content */}
              <div className="relative h-full flex flex-col justify-center px-6 sm:px-10 md:px-14 max-w-2xl text-white z-20">
                {/* Badge */}
                <div className="mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md border ${slide.accentBg}`}
                  >
                    <BadgeIcon className="h-3.5 w-3.5" />
                    <span>{slide.badge}</span>
                  </span>
                </div>

                {/* Main Headline */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight drop-shadow-xs">
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p className="mt-2.5 text-xs sm:text-sm text-gray-200/90 leading-relaxed max-w-md line-clamp-2 sm:line-clamp-none">
                  {slide.subtitle}
                </p>

                {/* CTA Button */}
                <div className="mt-5">
                  <Link
                    href={slide.ctaLink}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-900 shadow-md transition-all duration-200 hover:bg-gray-100 hover:shadow-lg hover:gap-3"
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowRight className="h-4 w-4 text-gray-900 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/40 hover:scale-110"
          title="Previous Slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/40 hover:scale-110"
          title="Next Slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Slide Indicator Dots (Bottom Center) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-7 bg-white shadow-xs"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
              title={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
