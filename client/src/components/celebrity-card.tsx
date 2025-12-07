import { Link } from "wouter";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Celebrity } from "@shared/schema";

interface CelebrityCardProps {
  celebrity: Celebrity;
}

export function CelebrityCard({ celebrity }: CelebrityCardProps) {
  const formatPrice = (price: string | number) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <Link href={`/celebrity/${celebrity.id}`}>
      <Card 
        className="celebrity-card overflow-hidden cursor-pointer group"
        data-testid={`card-celebrity-${celebrity.id}`}
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={celebrity.imageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"}
            alt={celebrity.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-skyline-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Badge 
            className="absolute top-3 left-3 bg-skyline-navy/80 text-white border-0"
            size="sm"
          >
            {celebrity.category}
          </Badge>
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading font-semibold text-lg line-clamp-1">
              {celebrity.name}
            </h3>
            <div className="flex items-center gap-1 text-skyline-gold flex-shrink-0">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">4.9</span>
            </div>
          </div>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {celebrity.bio || "World-renowned talent available for exclusive bookings and campaigns."}
          </p>
          <div className="flex items-center justify-between gap-2 pt-2">
            <div>
              <span className="text-xs text-muted-foreground">Starting at</span>
              <p className="font-heading font-bold text-lg text-skyline-gold">
                {formatPrice(celebrity.priceUsd)}
              </p>
            </div>
            <Button size="sm" data-testid={`button-view-celebrity-${celebrity.id}`}>
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function CelebrityCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-muted animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="h-5 w-12 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-8 w-20 bg-muted rounded animate-pulse" />
          <div className="h-9 w-24 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
