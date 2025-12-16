import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const slides = [
  {
    id: 1,
    title: "Book World-Class Celebrities",
    subtitle: "Exclusive Access to A-List Talent",
    description: "Connect with the biggest names in entertainment for events, endorsements, and brand partnerships.",
    image: "https://images.unsplash.com/photo-1676113462184-ccbf85282eed?w=1600&h=900&fit=crop",
  },
  {
    id: 2,
    title: "Premium Campaign Solutions",
    subtitle: "Elevate Your Brand",
    description: "Launch powerful marketing campaigns with celebrity endorsements that drive results.",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&h=900&fit=crop",
  },
  {
    id: 3,
    title: "Seamless Booking Experience",
    subtitle: "From Inquiry to Confirmation",
    description: "Our dedicated agents handle every detail, ensuring a flawless celebrity engagement.",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&h=900&fit=crop",
  },
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      goToNext();
    }, 6000);

    return () => clearInterval(timer);
  }, [currentSlide]);

  const goToNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const goToPrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentSlide) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <div className="relative w-full h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-all duration-700 ease-out",
            index === currentSlide
              ? "opacity-100 translate-x-0"
              : index < currentSlide
              ? "opacity-0 -translate-x-full"
              : "opacity-0 translate-x-full"
          )}
        >
          <div className="absolute inset-0">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-skyline-navy via-skyline-navy/70 to-transparent" />
            <div className="absolute inset-0 gradient-overlay-bottom" />
          </div>

          <div className="relative z-10 h-full container mx-auto px-4 md:px-6 lg:px-8 flex items-center">
            <div className="max-w-2xl space-y-6">
              <span className="inline-block px-4 py-2 bg-skyline-gold/20 text-skyline-gold rounded-full text-sm font-medium animate-fade-in">
                {slide.subtitle}
              </span>
              <h1 
                className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white text-3d leading-tight"
                style={{ animationDelay: "0.1s" }}
              >
                {slide.title}
              </h1>
              <p 
                className="text-lg md:text-xl text-white/80 max-w-lg animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                {slide.description}
              </p>
              <div 
                className="flex flex-wrap gap-4 animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                <a href="/celebrities">
                  <Button size="lg" className="bg-skyline-cyan hover:bg-skyline-cyan/90 text-white font-semibold px-8" data-testid="button-hero-browse">
                    Browse Celebrities
                  </Button>
                </a>
                <a href="/about">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" data-testid="button-hero-learn">
                    Learn More
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
        onClick={goToPrev}
        data-testid="button-slider-prev"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
        onClick={goToNext}
        data-testid="button-slider-next"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              index === currentSlide
                ? "w-8 bg-skyline-cyan"
                : "w-2 bg-white/40 hover:bg-white/60"
            )}
            data-testid={`button-slider-dot-${index}`}
          />
        ))}
      </div>
    </div>
  );
}
