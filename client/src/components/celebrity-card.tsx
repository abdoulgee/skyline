import { Link } from "wouter";
import { Star, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

  // Improved helper to determine image source
  const getImageSrc = (url: string | null) => {
    if (!url) return "https://placehold.co/400x500/0A1A2F/00B8D4?text=Profile";
    
    // If it's a full URL (http/https), use it directly
    if (url.startsWith("http") || url.startsWith("https")) {
      return url;
    }
    
    // If it's a local upload path, ensure it starts with / (root relative)
    // The server/routes.ts returns paths like "/uploads/filename.jpg"
    if (url.startsWith("/uploads/")) {
      return url; 
    }
    
    // If path is stored as "uploads/filename.jpg" (without leading slash), fix it
    if (url.startsWith("uploads/")) {
      return `/${url}`;
    }

    return url;
  };

  return (
    <Link href={`/celebrity/${celebrity.id}`}>
      <Card className="hover-elevate cursor-pointer overflow-hidden h-full flex flex-col group border-border/50">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <img
            src={getImageSrc(celebrity.imageUrl)}
            alt={celebrity.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
                e.currentTarget.src = "https://placehold.co/400x500/0A1A2F/00B8D4?text=Profile";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
          <Badge className="absolute top-3 left-3 bg-skyline-navy/90 border-none shadow-sm backdrop-blur-sm">
            {celebrity.category}
          </Badge>
          {celebrity.isCampaignAvailable && (
             <Badge variant="outline" className="absolute top-3 right-3 bg-black/50 text-white border-white/20 backdrop-blur-sm">
                Campaigns
             </Badge>
          )}
        </div>
        <CardContent className="p-4 flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-heading font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {celebrity.name}
            </h3>
            <div className="flex items-center gap-1 text-skyline-gold text-sm font-medium">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>4.9</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {celebrity.bio || "Available for booking and exclusive events."}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Starting at</p>
            <p className="font-bold text-skyline-gold">{formatPrice(celebrity.priceUsd)}</p>
          </div>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
            View <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

export function CelebrityCardSkeleton() {
  return (
    <Card className="h-full border-border/50">
      <div className="relative aspect-[4/5] bg-muted animate-pulse" />
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-8 w-1/3" />
      </CardFooter>
    </Card>
  );
}