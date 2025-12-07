import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
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

export default function Celebrities() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");

  const { data: celebrities, isLoading } = useQuery<Celebrity[]>({
    queryKey: ["/api/celebrities"],
  });

  const filteredCelebrities = celebrities?.filter((celeb) => {
    const matchesSearch = celeb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      celeb.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || celeb.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-skyline-cyan rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            <div className="text-center text-white">
              <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-4 text-3d">
                Celebrity <span className="text-skyline-gold">Directory</span>
              </h1>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">
                Explore our exclusive roster of world-renowned celebrities available for bookings and campaigns.
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
                  placeholder="Search celebrities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-celebrities"
                />
              </div>

              <div className="flex gap-4 flex-wrap">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[160px]" data-testid="select-category">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px]" data-testid="select-sort">
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

            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide md:hidden">
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setSelectedCategory(cat)}
                  data-testid={`badge-category-${cat.toLowerCase()}`}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            {selectedCategory !== "All" && (
              <div className="flex items-center gap-2 mb-6">
                <span className="text-muted-foreground">Showing:</span>
                <Badge variant="secondary">{selectedCategory}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory("All")}
                  data-testid="button-clear-filter"
                >
                  Clear
                </Button>
              </div>
            )}

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
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl mb-2">No celebrities found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria.
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
