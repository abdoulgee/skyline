import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Megaphone } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CelebrityCard, CelebrityCardSkeleton } from "@/components/celebrity-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Celebrity } from "@shared/schema";

export default function CampaignDirectory() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: celebrities, isLoading } = useQuery<Celebrity[]>({
    queryKey: ["/api/celebrities"],
  });

  // Filter only celebrities available for campaigns
  const campaignCelebrities = celebrities?.filter(celeb => celeb.campaignAvailable);

  const filteredCelebrities = campaignCelebrities?.filter((celeb) => {
    const matchesSearch = celeb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      celeb.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-skyline-navy to-skyline-navy/90">
          <div className="container mx-auto px-4 relative z-10 text-center text-white">
            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-4 text-3d">
              Campaign <span className="text-skyline-cyan">Talent Roster</span>
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Browse celebrities exclusively available for brand endorsements and marketing campaigns.
            </p>
          </div>
        </section>

        <section className="py-8 border-b bg-background sticky top-16 z-40">
          <div className="container mx-auto px-4">
            <div className="relative flex-1 w-full max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search campaign celebrities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <CelebrityCardSkeleton key={i} />
                ))
              ) : filteredCelebrities && filteredCelebrities.length > 0 ? (
                filteredCelebrities.map((celebrity) => (
                  <CelebrityCard key={celebrity.id} celebrity={celebrity} />
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-heading font-semibold text-xl mb-2">No campaign celebrities available</h3>
                  <p className="text-muted-foreground">
                    Check back later for updated talent available for endorsement.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}