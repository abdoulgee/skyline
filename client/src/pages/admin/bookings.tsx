import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, Search, Check, X, MessageSquare } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { BookingWithDetails } from "@shared/schema";

export default function AdminBookings() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: bookings, isLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/admin/bookings"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/admin/bookings/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({ title: "Booking status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update booking", variant: "destructive" });
    },
  });

  const formatPrice = (price: string | number) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const filteredBookings = bookings?.filter((b) => {
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesSearch = b.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.celebrity?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toString().includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
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
            <h1 className="font-heading font-bold text-2xl md:text-3xl mb-2">Manage Bookings</h1>
            <p className="text-muted-foreground">View and manage all booking requests.</p>
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
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
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
                      <TableHead>Price</TableHead>
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
                    ) : filteredBookings && filteredBookings.length > 0 ? (
                      filteredBookings.map((booking) => (
                        <TableRow key={booking.id} data-testid={`row-booking-${booking.id}`}>
                          <TableCell className="font-mono text-sm">#{booking.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{booking.user?.firstName} {booking.user?.lastName}</p>
                              <p className="text-xs text-muted-foreground">{booking.user?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={booking.celebrity?.imageUrl || undefined} />
                                <AvatarFallback>{booking.celebrity?.name?.[0]}</AvatarFallback>
                              </Avatar>
                              <span>{booking.celebrity?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-skyline-gold">
                            {formatPrice(booking.priceUsd)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(booking.status)}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(booking.createdAt!).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/admin/messages?type=booking&id=${booking.id}`}>
                                <Button variant="ghost" size="sm" data-testid={`button-chat-${booking.id}`}>
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </Link>
                              {booking.status === "pending" && (
                                <>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "confirmed" })}
                                    disabled={updateStatusMutation.isPending}
                                    data-testid={`button-confirm-${booking.id}`}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Confirm
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "cancelled" })}
                                    disabled={updateStatusMutation.isPending}
                                    data-testid={`button-cancel-${booking.id}`}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                          No bookings found
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
