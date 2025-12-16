import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { ArrowLeft, Megaphone, CheckCircle, Mail, Phone, User, MapPin, Loader2 } from "lucide-react";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
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
  const [, setLocation] = useLocation();
  const celebrityId = id ? parseInt(id) : null;
  
  const { user } = useAuth();
  const { toast } = useToast();

  const [campaignType, setCampaignType] = useState("Brand Promotion");
  const [description, setDescription] = useState("");
  const [occupation, setOccupation] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    email: user?.email || "",
    phone: user?.phone || "",
  });

  useEffect(() => {
    if (user) {
      setPersonalInfo({
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // FIX: Only enable query if celebrityId is a valid number
  const { data: celebrity, isLoading } = useQuery<Celebrity>({
    queryKey: ["/api/celebrities", celebrityId],
    enabled: celebrityId !== null && !isNaN(celebrityId),
    staleTime: 5 * 60 * 1000,
  });
  
  useQuery({
    queryKey: ["/api/campaigns"],
    enabled: !!user,
    refetchInterval: 15000,
  });

  const campaignMutation = useMutation({
    mutationFn: async () => {
      if (!user || celebrityId === null || isNaN(celebrityId) || !celebrity) throw new Error("Invalid request or celebrity data missing.");

      const fullDescription = `
        Campaign Type: ${campaignType}
        --- Personal Contact Info ---
        User: ${user.firstName || user.username} (${user.id})
        Email: ${personalInfo.email}
        Phone: ${personalInfo.phone}
        Occupation: ${occupation}
        Home Address: ${homeAddress}
        --- Project Details ---
        ${description}
      `;

      return apiRequest("POST", "/api/campaigns", {
        celebrityId: celebrityId,
        campaignType,
        description: fullDescription,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      setIsSubmitted(true);
      setLocation("/dashboard/messages");
    },
    onError: (error: any) => {
      toast({
        title: "Request Failed",
        description: error.message || "Unable to submit campaign request. Check required fields.",
        variant: "destructive",
      });
    },
  });

  // CRITICAL FIX: Ensure component waits for data before trying to render fields like celebrity.name
  if (isLoading || !user) {
    return (
        <div className="min-h-screen flex items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }
  
  // Guard against invalid ID or not found celebrity
  if (celebrityId === null || !celebrity) {
    // Redirect to 404/Celebrities page if ID is bad or celebrity isn't found
    setLocation("/celebrities");
    return null;
  }

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
                Your campaign request for {celebrity.name} has been sent. A chat thread has been created in your message center.
              </p>
              <div className="flex flex-col gap-3">
                 <Link href="/dashboard/messages"><Button className="w-full">Go to Message Center</Button></Link>
                 <Link href="/celebrities"><Button variant="outline" className="w-full">Browse More</Button></Link>
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
        <div className="container mx-auto px-4 py-8">
            <Link href={`/celebrity/${celebrityId}`}><Button variant="ghost" className="mb-4 gap-2"><ArrowLeft className="h-4 w-4"/> Back</Button></Link>
            
            <div className="max-w-3xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Request Campaign with {celebrity.name}</CardTitle>
                        <CardDescription>Provide details about your project and contact information for negotiation.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4 bg-muted p-4 rounded-lg">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={celebrity.imageUrl || undefined} />
                                <AvatarFallback>{celebrity.name[0]}</AvatarFallback>
                            </Avatar>
                            <h3 className="font-semibold">{celebrity.name}</h3>
                        </div>

                        {/* Campaign Type */}
                        <div className="space-y-3">
                            <Label>Campaign Type</Label>
                            <RadioGroup value={campaignType} onValueChange={setCampaignType}>
                                {campaignTypes.map(type => (
                                    <div key={type.value} className="flex items-center space-x-2 border p-3 rounded hover:bg-muted/50">
                                        <RadioGroupItem value={type.value} id={type.value} />
                                        <Label htmlFor={type.value}>{type.value} - <span className="text-muted-foreground text-sm">{type.description}</span></Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                        
                        {/* Personal Details */}
                        <div className="space-y-4 pt-4 border-t">
                            <h4 className="font-semibold text-lg flex items-center gap-2"><User className="h-4 w-4"/> Your Contact Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input 
                                        type="email" 
                                        value={personalInfo.email} 
                                        onChange={e => setPersonalInfo({...personalInfo, email: e.target.value})}
                                        placeholder="Your email address"
                                        className="pl-9"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input 
                                        type="tel" 
                                        value={personalInfo.phone} 
                                        onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})}
                                        placeholder="Your phone number"
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Occupation / Company</Label>
                                    <Input 
                                        value={occupation} 
                                        onChange={e => setOccupation(e.target.value)}
                                        placeholder="Your Job Title or Company Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Home Address</Label>
                                    <Input 
                                        value={homeAddress} 
                                        onChange={e => setHomeAddress(e.target.value)}
                                        placeholder="Street Address, City"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Project Details */}
                        <div className="space-y-2 pt-4 border-t">
                            <h4 className="font-semibold text-lg flex items-center gap-2"><Megaphone className="h-4 w-4"/> Project Details</h4>
                            <Textarea 
                                placeholder="Describe your campaign goals, target audience, preferred budget range, and timeline..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={5}
                            />
                        </div>

                        <Button 
                            className="w-full" 
                            size="lg"
                            onClick={() => campaignMutation.mutate()}
                            disabled={campaignMutation.isPending || !description || !personalInfo.email || !personalInfo.phone}
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