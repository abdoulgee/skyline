import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Megaphone, Plus, MessageSquare, FileText } from "lucide-react";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type { CampaignWithDetails } from "@shared/schema";

export default function CampaignsPage() {
  const { data: campaigns, isLoading } = useQuery<CampaignWithDetails[]>({
    queryKey: ["/api/campaigns"],
  });

  const formatPrice = (price: string | number | null) => {
    if (!price) return "TBD";
    const num = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "completed":
        return "secondary";
      case "rejected":
        return "destructive";
      case "negotiating":
        return "outline";
      default:
        return "outline";
    }
  };

  const pendingCampaigns = campaigns?.filter(c => c.status === "pending" || c.status === "negotiating") || [];
  const activeCampaigns = campaigns?.filter(c => c.status === "approved") || [];
  const completedCampaigns = campaigns?.filter(c => c.status === "completed" || c.status === "rejected") || [];

  const CampaignCard = ({ campaign }: { campaign: CampaignWithDetails }) => (
    <Card className="overflow-hidden" data-testid={`card-campaign-${campaign.id}`}>
      <div className="flex flex-col md:flex-row">
        <div className="md:w-32 h-32 md:h-auto bg-muted flex-shrink-0">
          <img
            src={campaign.celebrity?.imageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"}
            alt={campaign.celebrity?.name || "Celebrity"}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="flex-1 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-semibold text-lg">
                  {campaign.celebrity?.name || "Celebrity"}
                </h3>
                <Badge variant={getStatusVariant(campaign.status)}>
                  {campaign.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Campaign #{campaign.id} • {new Date(campaign.createdAt!).toLocaleDateString()}
              </p>
              <Badge variant="secondary" className="font-normal">
                {campaign.campaignType}
              </Badge>
              <p className="font-heading font-bold text-lg text-skyline-gold">
                {formatPrice(campaign.customPriceUsd)}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href={`/dashboard/messages?type=campaign&id=${campaign.id}`}>
                <Button variant="outline" size="sm" className="gap-2" data-testid={`button-campaign-chat-${campaign.id}`}>
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </Button>
              </Link>
              {campaign.status === "completed" && (
                <Button variant="outline" size="sm" className="gap-2" data-testid={`button-campaign-invoice-${campaign.id}`}>
                  <FileText className="h-4 w-4" />
                  Invoice
                </Button>
              )}
            </div>
          </div>
          {campaign.description && (
            <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
              {campaign.description}
            </p>
          )}
        </CardContent>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading font-bold text-2xl md:text-3xl mb-2">My Campaigns</h1>
              <p className="text-muted-foreground">Manage your celebrity campaign requests.</p>
            </div>
            <Link href="/celebrities">
              <Button className="gap-2" data-testid="button-new-campaign">
                <Plus className="h-4 w-4" />
                New Campaign
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all" data-testid="tab-all-campaigns">
                All ({campaigns?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="pending" data-testid="tab-pending-campaigns">
                In Progress ({pendingCampaigns.length})
              </TabsTrigger>
              <TabsTrigger value="active" data-testid="tab-active-campaigns">
                Active ({activeCampaigns.length})
              </TabsTrigger>
              <TabsTrigger value="completed" data-testid="tab-completed-campaigns">
                History ({completedCampaigns.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-40" />
                  ))}
                </div>
              ) : campaigns && campaigns.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="font-heading font-semibold text-lg mb-2">No campaigns yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by browsing our celebrity directory and requesting a campaign.
                    </p>
                    <Link href="/celebrities">
                      <Button data-testid="button-browse-to-campaign">Browse Celebrities</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="pending">
              {pendingCampaigns.length > 0 ? (
                <div className="space-y-4">
                  {pendingCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No campaigns in progress
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="active">
              {activeCampaigns.length > 0 ? (
                <div className="space-y-4">
                  {activeCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No active campaigns
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {completedCampaigns.length > 0 ? (
                <div className="space-y-4">
                  {completedCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No campaign history
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
