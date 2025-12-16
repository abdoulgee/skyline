import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Megaphone, Search, ArrowRight, MessageSquare } from "lucide-react";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import type { CampaignWithDetails } from "@shared/schema";
import { useState } from "react";

export default function CampaignsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: campaigns, isLoading } = useQuery<CampaignWithDetails[]>({
    queryKey: ["/api/campaigns"],
    enabled: !!user,
    refetchInterval: 15000, // Real-time fix: Poll every 15 seconds
  });

  const filteredCampaigns = campaigns?.filter((c) =>
    c.celebrity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.campaignType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading font-bold text-2xl md:text-3xl mb-2">My Campaigns</h1>
              <p className="text-muted-foreground">View the status of your campaign requests and manage negotiations.</p>
            </div>
            <Link href="/celebrities">
              <Button className="gap-2">
                <Megaphone className="h-4 w-4" />
                Browse Celebrities
              </Button>
            </Link>
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
                      <TableHead>Celebrity</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested Date</TableHead>
                      <TableHead className="text-right">Chat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                      </TableRow>
                    ) : filteredCampaigns && filteredCampaigns.length > 0 ? (
                      filteredCampaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={campaign.celebrity.imageUrl || undefined} />
                                <AvatarFallback>{campaign.celebrity.name[0]}</AvatarFallback>
                              </Avatar>
                              <p className="font-medium">{campaign.celebrity.name}</p>
                            </div>
                          </TableCell>
                          <TableCell>{campaign.campaignType}</TableCell>
                          <TableCell>
                            <Badge variant={campaign.status === "approved" ? "default" : "secondary"}>
                              {campaign.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(campaign.createdAt!).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {/* FIX: Correct link to message center using threadId */}
                            <Link href={`/dashboard/messages?type=campaign&id=${campaign.id}`}>
                              <Button variant="ghost" size="icon">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          <Megaphone className="h-10 w-10 mx-auto mb-3 opacity-50" />
                          <p>You have no campaign requests.</p>
                          <Link href="/celebrities">
                             <Button variant="link" className="mt-2">
                                New Campaign Request <ArrowRight className="ml-1 h-4 w-4"/>
                            </Button>
                          </Link>
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
      <MobileNav />
    </div>
  );
}