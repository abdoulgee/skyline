import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Megaphone, CheckCircle } from "lucide-react";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Celebrity } from "@shared/schema";
import { Link } from "wouter";

const campaignTypes = [
  { value: "Brand Promotion", description: "Feature your brand through celebrity endorsement" },
  { value: "Social Media Shoutout", description: "Mentions and posts on celebrity social channels" },
  { value: "Product Endorsement", description: "Celebrity-backed product promotion campaign" },
  { value: "Event Appearance", description: "Celebrity appearance at brand events" },
  { value: "Advertising Campaign", description: "Full advertising campaign with celebrity" },
  { value: "Custom", description: "Custom campaign tailored to your needs" },
];

export default function CampaignRequestPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [campaignType, setCampaignType] = useState("Brand Promotion");
  const [description, setDescription] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: celebrity, isLoading } = useQuery<Celebrity>({
    queryKey: ["/api/celebrities", id],
    enabled: !!id,
  });

  const campaignMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/campaigns", {
        celebrityId: parseInt(id!),
        campaignType,
        description,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      setIsSubmitted(true);
    },
    onError: (error: any) => {
      toast({
        title: "Request Failed",
        description: error.message || "Unable to submit campaign request. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col pb-20 md:pb-0">
        <Header />
        <main className="flex-1 bg-muted/30 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </main>
        <MobileNav />
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col pb-20 md:pb-0">
        <Header />
        <main className="flex-1 bg-muted/30 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="font-heading font-bold text-2xl mb-2">Campaign Request Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Your campaign request for {celebrity?.name} has been submitted. An agent will contact you to discuss details and pricing.
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/dashboard/campaigns">
                  <Button className="w-full" data-testid="button-view-campaigns">
                    View My Campaigns
                  </Button>
                </Link>
                <Link href="/celebrities">
                  <Button variant="outline" className="w-full" data-testid="button-browse-more">
                    Browse More Celebrities
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <Link href={`/celebrity/${id}`}>
            <Button variant="ghost" size="sm" className="gap-2 mb-6" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Button>
          </Link>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Request Campaign with {celebrity?.name}</CardTitle>
                <CardDescription>
                  Tell us about your campaign needs. Our agent will contact you to discuss details and pricing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={celebrity?.imageUrl || undefined} />
                    <AvatarFallback>{celebrity?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-heading font-semibold text-lg">{celebrity?.name}</h3>
                    <p className="text-sm text-muted-foreground">{celebrity?.category}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Campaign Type</Label>
                  <RadioGroup value={campaignType} onValueChange={setCampaignType}>
                    {campaignTypes.map((type) => (
                      <div
                        key={type.value}
                        className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer"
                        data-testid={`radio-campaign-${type.value.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <RadioGroupItem value={type.value} id={type.value} className="mt-0.5" />
                        <Label htmlFor={type.value} className="cursor-pointer flex-1">
                          <span className="font-medium">{type.value}</span>
                          <p className="text-sm text-muted-foreground mt-0.5">{type.description}</p>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Campaign Details</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your campaign goals, timeline, target audience, and any specific requirements..."
                    rows={6}
                    data-testid="input-campaign-description"
                  />
                </div>

                <div className="p-4 bg-skyline-gold/10 rounded-lg">
                  <p className="text-sm">
                    <strong>Note:</strong> Campaign pricing is negotiated based on scope and requirements. An agent will contact you via our messaging system to discuss terms.
                  </p>
                </div>

                <Button
                  onClick={() => campaignMutation.mutate()}
                  disabled={campaignMutation.isPending || !description.trim()}
                  className="w-full gap-2"
                  size="lg"
                  data-testid="button-submit-campaign"
                >
                  <Megaphone className="h-4 w-4" />
                  {campaignMutation.isPending ? "Submitting..." : "Submit Campaign Request"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
