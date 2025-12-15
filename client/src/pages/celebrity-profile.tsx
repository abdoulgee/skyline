import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, Star, Calendar, Megaphone, Share2, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import type { Celebrity } from "@shared/schema";
import useEmblaCarousel from "embla-carousel-react";
import { useState, useEffect, useCallback } from "react";

export default function CelebrityProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const celebrityId = parseInt(id || '0');

  const { data: celebrity, isLoading } = useQuery<Celebrity>({
    queryKey: ["/api/celebrities", id],
    enabled: !!id,
  });

  // Embla Carousel Setup
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const formatPrice = (price: string | number) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getImageSrc = (url: string | null) => {
    if (!url) return "https://placehold.co/400x500/0A1A2F/00B8D4?text=Profile";
    if (url.startsWith("http") || url.startsWith("https")) return url;
    if (url.startsWith("/uploads/")) return url; 
    if (url.startsWith("uploads/")) return `/${url}`;
    return url;
  };

  // Combine imageUrl (main) + images (array) into one list for slider
  const getGalleryImages = () => {
      const list = [];
      if (celebrity?.imageUrl) list.push(celebrity.imageUrl);
      if (celebrity?.images && Array.isArray(celebrity.images)) {
          // Avoid duplicates if main image is also in list
          celebrity.images.forEach(img => {
              if (img !== celebrity.imageUrl) list.push(img);
          });
      }
      return list.length > 0 ? list : [null]; // null triggers placeholder
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 container mx-auto px-4">
            <Skeleton className="h-[400px] w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!celebrity) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading font-bold text-2xl mb-4">Celebrity Not Found</h1>
            <Link href="/celebrities">
              <Button>Back to Directory</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const gallery = getGalleryImages();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-skyline-navy/5 to-transparent py-4">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <Link href="/celebrities">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Directory
              </Button>
            </Link>
          </div>
        </div>

        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Image Slider Column */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg group">
                    <div className="overflow-hidden h-full" ref={emblaRef}>
                        <div className="flex h-full">
                            {gallery.map((img, idx) => (
                                <div key={idx} className="flex-[0_0_100%] min-w-0 relative">
                                    <img
                                      src={getImageSrc(img)}
                                      alt={`${celebrity.name} ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.src = "https://placehold.co/600x600/0A1A2F/00B8D4?text=Profile";
                                      }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <Badge className="absolute top-4 left-4 bg-skyline-navy/80 z-10">
                      {celebrity.category}
                    </Badge>

                    {/* Navigation Buttons (Only show if multiple images) */}
                    {gallery.length > 1 && (
                        <>
                            <button 
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={scrollPrev}
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button 
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={scrollNext}
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                            
                            {/* Dots */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {scrollSnaps.map((_, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`w-2 h-2 rounded-full transition-colors ${idx === selectedIndex ? "bg-white" : "bg-white/50"}`} 
                                    />
                                ))}
                            </div>
                        </>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 justify-center">
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content Column */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="font-heading font-bold text-3xl md:text-4xl">
                      {celebrity.name}
                    </h1>
                    <div className="flex items-center gap-1 text-skyline-gold">
                      <Star className="h-5 w-5 fill-current" />
                      <span className="font-semibold">4.9</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground">Premium talent for exclusive engagements</p>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Starting at</span>
                        <p className="font-heading font-bold text-3xl text-skyline-gold">
                          {formatPrice(celebrity.priceUsd)}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        {user ? (
                          <>
                            <Link href={`/dashboard/book/${celebrityId}`}>
                              <Button size="lg" className="gap-2 w-full sm:w-auto">
                                <Calendar className="h-5 w-5" />
                                Book Now
                              </Button>
                            </Link>
                            
                            {celebrity.isCampaignAvailable && (
                                <Link href={`/dashboard/campaign/${celebrityId}`}>
                                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                                    <Megaphone className="h-5 w-5" />
                                    Request Campaign
                                </Button>
                                </Link>
                            )}
                          </>
                        ) : (
                          <Link href="/auth">
                            <Button size="lg" className="gap-2">
                              Sign In to Book
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="about">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="about">Biography</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>

                  <TabsContent value="about" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Biography</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {celebrity.bio || 
                            `${celebrity.name} is a world-renowned ${celebrity.category.toLowerCase()} with an impressive portfolio. Contact the agent for details.`
                          }
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="services" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Event Appearances</CardTitle></CardHeader>
                        <CardContent><p className="text-muted-foreground text-sm">Book for corporate events, private parties, charity galas.</p></CardContent>
                      </Card>
                      <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary" /> Brand Endorsements</CardTitle></CardHeader>
                        <CardContent><p className="text-muted-foreground text-sm">Partner for advertising campaigns, product launches, and brand promotions.</p></CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="mt-6">
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Star className="h-12 w-12 text-skyline-gold mx-auto mb-4" />
                        <h3 className="font-heading font-semibold text-lg mb-2">Exceptional Reviews</h3>
                        <p className="text-muted-foreground">
                          All clients rate their experience with {celebrity.name} as outstanding.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}