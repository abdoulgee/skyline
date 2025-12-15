import { useQuery, useMutation } from "@tanstack/react-query";
import { Wallet, Check, X, Download, Search } from "lucide-react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DepositWithUser } from "@shared/schema";
import { useState } from "react";

export default function AdminDeposits() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // FIX: Ensure correct admin deposits endpoint is used
  const { data: deposits, isLoading } = useQuery<DepositWithUser[]>({
    queryKey: ["/api/admin/deposits"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      // FIX: Ensure ID is correctly passed to the route
      return apiRequest("PATCH", `/api/admin/deposits/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] }); // Refresh stats too
      toast({ title: "Deposit status updated" });
    },
    onError: (error) => {
      toast({ title: "Failed to update deposit", description: error.message, variant: "destructive" });
    },
  });

  const formatPrice = (price: string | number) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const filteredDeposits = deposits?.filter((d) => {
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    const matchesSearch = d.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toString().includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleApprove = (id: number) => {
    // In a production app, you would prompt for a transaction hash here.
    updateStatusMutation.mutate({ id, status: "approved" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-2xl md:text-3xl mb-2">Manage Deposits</h1>
            <p className="text-muted-foreground">Review and approve user deposit requests.</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email, username, or ID..."
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
                    <SelectItem value="approved">Approved</SelectItem>
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
                      <TableHead>Amount (USD)</TableHead>
                      <TableHead>Crypto</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                      </TableRow>
                    ) : filteredDeposits && filteredDeposits.length > 0 ? (
                      filteredDeposits.map((deposit) => (
                        <TableRow key={deposit.id} data-testid={`row-deposit-${deposit.id}`}>
                          <TableCell className="font-mono text-sm">#{deposit.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{deposit.user?.firstName || deposit.user?.username}</p>
                              <p className="text-xs text-muted-foreground">{deposit.user?.email || 'N/A'}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-skyline-gold">
                            {formatPrice(deposit.amountUsd)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{deposit.coin}</p>
                              <p className="text-xs text-muted-foreground">{deposit.cryptoAmountExpected}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(deposit.status)}>
                              {deposit.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(deposit.createdAt!).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {deposit.status === "pending" ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleApprove(deposit.id)}
                                  disabled={updateStatusMutation.isPending}
                                  data-testid={`button-approve-${deposit.id}`}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => updateStatusMutation.mutate({ id: deposit.id, status: "rejected" })}
                                  disabled={updateStatusMutation.isPending}
                                  data-testid={`button-reject-${deposit.id}`}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <a 
                                href={`/api/invoices/deposit/${deposit.id}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="sm" data-testid={`button-receipt-${deposit.id}`}>
                                  <Download className="h-4 w-4 mr-1" />
                                  Receipt
                                </Button>
                              </a>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          <Wallet className="h-10 w-10 mx-auto mb-3 opacity-50" />
                          No deposits found
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