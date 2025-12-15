import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
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
      // No payment required for campaign request
      // Server will automatically create a chat thread
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
        description: error.message || "Unable to submit campaign request.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) return <div>Loading...</div>;

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="font-bold text-2xl mb-2">Request Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Your campaign request for {celebrity?.name} has been sent. A chat thread has been created in your message center.
              </p>
              <div className="flex flex-col gap-3">
                 <Link href="/dashboard/messages"><Button className="w-full">Go to Message Center</Button></Link>
                 <Link href="/celebrities"><Button variant="outline" className="w-full">Browse More</Button></Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
            <Link href={`/celebrity/${id}`}><Button variant="ghost" className="mb-4 gap-2"><ArrowLeft className="h-4 w-4"/> Back</Button></Link>
            
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Request Campaign with {celebrity?.name}</CardTitle>
                        <CardDescription>No payment required to submit. Prices are negotiated via chat.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4 bg-muted p-4 rounded-lg">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={celebrity?.imageUrl || undefined} />
                                <AvatarFallback>{celebrity?.name[0]}</AvatarFallback>
                            </Avatar>
                            <h3 className="font-semibold">{celebrity?.name}</h3>
                        </div>

                        <div className="space-y-3">
                            <Label>Campaign Type</Label>
                            <RadioGroup value={campaignType} onValueChange={setCampaignType}>
                                {campaignTypes.map(type => (
                                    <div key={type.value} className="flex items-center space-x-2 border p-3 rounded hover:bg-muted/50">
                                        <RadioGroupItem value={type.value} id={type.value} />
                                        <Label htmlFor={type.value}>{type.value}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        <div className="space-y-2">
                            <Label>Project Details</Label>
                            <Textarea 
                                placeholder="Describe your campaign goals, budget range, and timeline..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={5}
                            />
                        </div>

                        <Button 
                            className="w-full" 
                            size="lg"
                            onClick={() => campaignMutation.mutate()}
                            disabled={campaignMutation.isPending || !description}
                        >
                            {campaignMutation.isPending ? "Sending..." : "Submit Request"}
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