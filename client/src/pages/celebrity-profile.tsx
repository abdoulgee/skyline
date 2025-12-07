import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, Star, Calendar, Megaphone, MessageSquare, Share2, Heart } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import type { Celebrity } from "@shared/schema";

export default function CelebrityProfile() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();

  const { data: celebrity, isLoading } = useQuery<Celebrity>({
    queryKey: ["/api/celebrities", id],
    enabled: !!id,
  });

  const formatPrice = (price: string | number) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Skeleton className="aspect-square rounded-xl" />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-skyline-navy/5 to-transparent py-4">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <Link href="/celebrities">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back">
                <ArrowLeft className="h-4 w-4" />
                Back to Directory
              </Button>
            </Link>
          </div>
        </div>

        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={celebrity.imageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop"}
                      alt={celebrity.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <Badge className="absolute top-4 left-4 bg-skyline-navy/80">
                      {celebrity.category}
                    </Badge>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="icon" data-testid="button-share">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" data-testid="button-favorite">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="font-heading font-bold text-3xl md:text-4xl" data-testid="text-celebrity-name">
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
                        <p className="font-heading font-bold text-3xl text-skyline-gold" data-testid="text-celebrity-price">
                          {formatPrice(celebrity.priceUsd)}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        {isAuthenticated ? (
                          <>
                            <Link href={`/dashboard/book/${celebrity.id}`}>
                              <Button size="lg" className="gap-2 w-full sm:w-auto" data-testid="button-book-celebrity">
                                <Calendar className="h-5 w-5" />
                                Book Now
                              </Button>
                            </Link>
                            <Link href={`/dashboard/campaign/${celebrity.id}`}>
                              <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto" data-testid="button-campaign-celebrity">
                                <Megaphone className="h-5 w-5" />
                                Request Campaign
                              </Button>
                            </Link>
                          </>
                        ) : (
                          <a href="/api/login">
                            <Button size="lg" className="gap-2" data-testid="button-login-to-book">
                              Sign In to Book
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="about" className="w-full">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="about" data-testid="tab-about">About</TabsTrigger>
                    <TabsTrigger value="services" data-testid="tab-services">Services</TabsTrigger>
                    <TabsTrigger value="reviews" data-testid="tab-reviews">Reviews</TabsTrigger>
                  </TabsList>

                  <TabsContent value="about" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Biography</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {celebrity.bio || 
                            `${celebrity.name} is a world-renowned ${celebrity.category.toLowerCase()} with an impressive portfolio spanning multiple industries. Known for exceptional professionalism and captivating presence, they bring unparalleled star power to any event or campaign. With years of experience in high-profile engagements, ${celebrity.name} consistently delivers memorable experiences that exceed client expectations.`
                          }
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="services" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Event Appearances
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm">
                            Book for corporate events, private parties, charity galas, and more.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Megaphone className="h-5 w-5 text-primary" />
                            Brand Endorsements
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm">
                            Partner for advertising campaigns, product launches, and brand promotions.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            Social Media
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm">
                            Sponsored posts, shoutouts, and social media takeovers.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-primary" />
                            Custom Requests
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm">
                            Contact our agents for personalized engagement options.
                          </p>
                        </CardContent>
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
