import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CelebrityCard, CelebrityCardSkeleton } from "@/components/celebrity-card";
import type { Celebrity } from "@shared/schema";

export function FeaturedCelebrities() {
  const { data: celebrities, isLoading } = useQuery<Celebrity[]>({
    queryKey: ["/api/celebrities"],
  });

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Featured Talent
            </span>
            <h2 className="font-heading font-bold text-3xl md:text-4xl mt-2">
              Top <span className="text-gradient-cyan">Celebrities</span>
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Discover our most sought-after celebrities available for exclusive bookings and campaigns.
            </p>
          </div>
          <Link href="/celebrities">
            <Button variant="outline" className="gap-2" data-testid="button-view-all-celebrities">
              View All Celebrities
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <CelebrityCardSkeleton key={i} />
            ))
          ) : celebrities && celebrities.length > 0 ? (
            celebrities.slice(0, 4).map((celebrity) => (
              <CelebrityCard key={celebrity.id} celebrity={celebrity} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No celebrities available at the moment.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
