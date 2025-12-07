import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Megaphone, Search, MessageSquare, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CampaignWithDetails } from "@shared/schema";

export default function AdminCampaigns() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pricingCampaign, setPricingCampaign] = useState<CampaignWithDetails | null>(null);
  const [customPrice, setCustomPrice] = useState("");

  const { data: campaigns, isLoading } = useQuery<CampaignWithDetails[]>({
    queryKey: ["/api/admin/campaigns"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PATCH", `/api/admin/campaigns/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      toast({ title: "Campaign updated" });
      setPricingCampaign(null);
    },
    onError: () => {
      toast({ title: "Failed to update campaign", variant: "destructive" });
    },
  });

  const formatPrice = (price: string | number | null) => {
    if (!price) return "TBD";
    const num = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const filteredCampaigns = campaigns?.filter((c) => {
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesSearch = c.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.celebrity?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toString().includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "completed":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-2xl md:text-3xl mb-2">Manage Campaigns</h1>
            <p className="text-muted-foreground">View and manage all campaign requests.</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-search"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]" data-testid="select-status-filter">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="negotiating">Negotiating</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Celebrity</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                      </TableRow>
                    ) : filteredCampaigns && filteredCampaigns.length > 0 ? (
                      filteredCampaigns.map((campaign) => (
                        <TableRow key={campaign.id} data-testid={`row-campaign-${campaign.id}`}>
                          <TableCell className="font-mono text-sm">#{campaign.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{campaign.user?.firstName} {campaign.user?.lastName}</p>
                              <p className="text-xs text-muted-foreground">{campaign.user?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={campaign.celebrity?.imageUrl || undefined} />
                                <AvatarFallback>{campaign.celebrity?.name?.[0]}</AvatarFallback>
                              </Avatar>
                              <span>{campaign.celebrity?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{campaign.campaignType}</Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-skyline-gold">
                            {formatPrice(campaign.customPriceUsd)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(campaign.status)}>
                              {campaign.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/admin/messages?type=campaign&id=${campaign.id}`}>
                                <Button variant="ghost" size="sm" data-testid={`button-chat-${campaign.id}`}>
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Dialog open={pricingCampaign?.id === campaign.id} onOpenChange={(open) => !open && setPricingCampaign(null)}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setPricingCampaign(campaign);
                                      setCustomPrice(campaign.customPriceUsd?.toString() || "");
                                    }}
                                    data-testid={`button-price-${campaign.id}`}
                                  >
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    Set Price
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Set Campaign Price</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label>Custom Price (USD)</Label>
                                      <Input
                                        type="number"
                                        value={customPrice}
                                        onChange={(e) => setCustomPrice(e.target.value)}
                                        placeholder="10000"
                                        data-testid="input-custom-price"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Status</Label>
                                      <Select
                                        defaultValue={campaign.status}
                                        onValueChange={(status) => {
                                          updateMutation.mutate({
                                            id: campaign.id,
                                            data: { customPriceUsd: customPrice, status }
                                          });
                                        }}
                                      >
                                        <SelectTrigger data-testid="select-campaign-status">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">Pending</SelectItem>
                                          <SelectItem value="negotiating">Negotiating</SelectItem>
                                          <SelectItem value="approved">Approved</SelectItem>
                                          <SelectItem value="completed">Completed</SelectItem>
                                          <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          <Megaphone className="h-10 w-10 mx-auto mb-3 opacity-50" />
                          No campaigns found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
