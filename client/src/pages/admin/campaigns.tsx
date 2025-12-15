import { useQuery, useMutation } from "@tanstack/react-query";
import { Megaphone, Check, X, Search } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CampaignWithDetails } from "@shared/schema";
import { useState } from "react";

export default function AdminCampaigns() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: campaigns, isLoading } = useQuery<CampaignWithDetails[]>({
    queryKey: ["/api/admin/campaigns"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/admin/campaigns/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Campaign status updated" });
    },
    onError: (error) => {
      toast({ title: "Failed to update campaign", description: error.message, variant: "destructive" });
    },
  });

  const filteredCampaigns = campaigns?.filter((c) =>
    c.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.celebrity?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.campaignType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-2xl md:text-3xl mb-2">Manage Campaigns</h1>
            <p className="text-muted-foreground">Review and negotiate campaign requests.</p>
          </div>

          <Card>
            <CardHeader>
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Celebrity</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                      </TableRow>
                    ) : filteredCampaigns && filteredCampaigns.length > 0 ? (
                      filteredCampaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{campaign.user?.firstName || campaign.user?.username}</p>
                              <p className="text-xs text-muted-foreground">{campaign.user?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{campaign.celebrity?.name}</TableCell>
                          <TableCell>{campaign.campaignType}</TableCell>
                          <TableCell>
                            <Badge variant={campaign.status === "approved" ? "default" : "secondary"}>
                              {campaign.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                            {campaign.description}
                          </TableCell>
                          <TableCell className="text-right">
                            {campaign.status === 'pending' || campaign.status === 'negotiating' ? (
                                <div className="flex justify-end gap-2">
                                    <Button 
                                        size="sm" 
                                        variant="default"
                                        onClick={() => updateStatusMutation.mutate({ id: campaign.id, status: "approved" })}
                                        disabled={updateStatusMutation.isPending}
                                    >
                                        <Check className="h-4 w-4 mr-1" /> Approve
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="destructive"
                                        onClick={() => updateStatusMutation.mutate({ id: campaign.id, status: "rejected" })}
                                        disabled={updateStatusMutation.isPending}
                                    >
                                        <X className="h-4 w-4 mr-1" /> Reject
                                    </Button>
                                </div>
                            ) : (
                                <span className="text-sm text-muted-foreground">Processed</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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