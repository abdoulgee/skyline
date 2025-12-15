import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, SlidersHorizontal, Megaphone } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CelebrityCard, CelebrityCardSkeleton } from "@/components/celebrity-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Celebrity } from "@shared/schema";

const categories = [
  "All",
  "Actor",
  "Musician",
  "Athlete",
  "Influencer",
  "Comedian",
  "Model",
  "TV Host",
];

export default function Celebrities({ defaultFilter }: { defaultFilter?: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCampaignOnly, setShowCampaignOnly] = useState(defaultFilter === "campaign");
  const [sortBy, setSortBy] = useState("name");

  // Sync prop change
  useEffect(() => {
    if(defaultFilter === 'campaign') setShowCampaignOnly(true);
  }, [defaultFilter]);

  const { data: celebrities, isLoading } = useQuery<Celebrity[]>({
    queryKey: ["/api/celebrities"],
  });

  const filteredCelebrities = celebrities?.filter((celeb) => {
    const matchesSearch = celeb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      celeb.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || celeb.category === selectedCategory;
    const matchesCampaign = showCampaignOnly ? celeb.isCampaignAvailable : true;
    
    return matchesSearch && matchesCategory && matchesCampaign;
  }).sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "price-asc") return parseFloat(a.priceUsd) - parseFloat(b.priceUsd);
    if (sortBy === "price-desc") return parseFloat(b.priceUsd) - parseFloat(a.priceUsd);
    return 0;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-skyline-navy to-skyline-navy/90">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            <div className="text-center text-white">
              <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-4 text-3d">
                {showCampaignOnly ? "Campaign Talent" : "Celebrity Directory"}
              </h1>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">
                {showCampaignOnly 
                    ? "Connect with celebrities open to brand partnerships and campaigns."
                    : "Explore our exclusive roster of world-renowned celebrities."
                }
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 border-b bg-background sticky top-16 z-40">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-4 flex-wrap">
                 <Button 
                    variant={showCampaignOnly ? "default" : "outline"}
                    onClick={() => setShowCampaignOnly(!showCampaignOnly)}
                    className="gap-2"
                 >
                    <Megaphone className="h-4 w-4"/>
                    Campaign Ready
                 </Button>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px]">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <CelebrityCardSkeleton key={i} />
                ))
              ) : filteredCelebrities && filteredCelebrities.length > 0 ? (
                filteredCelebrities.map((celebrity) => (
                  <CelebrityCard key={celebrity.id} celebrity={celebrity} />
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <h3 className="font-heading font-semibold text-xl mb-2">No celebrities found</h3>
                  <p className="text-muted-foreground">Try adjusting your search.</p>
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