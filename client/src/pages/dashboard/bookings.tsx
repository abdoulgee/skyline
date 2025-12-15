import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calendar, Plus, MessageSquare, FileText, Eye } from "lucide-react";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type { BookingWithDetails } from "@shared/schema";

export default function BookingsPage() {
  const { data: bookings, isLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings"],
  });

  const formatPrice = (price: string | number) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(num);
  };

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

  const pendingBookings = bookings?.filter(b => b.status === "pending") || [];
  const activeBookings = bookings?.filter(b => b.status === "confirmed") || [];
  const completedBookings = bookings?.filter(b => b.status === "completed" || b.status === "cancelled") || [];

  const BookingCard = ({ booking }: { booking: BookingWithDetails }) => (
    <Card className="overflow-hidden" data-testid={`card-booking-${booking.id}`}>
      <div className="flex flex-col md:flex-row">
        <div className="md:w-32 h-32 md:h-auto bg-muted flex-shrink-0">
          <img
            src={booking.celebrity?.imageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"}
            alt={booking.celebrity?.name || "Celebrity"}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="flex-1 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-semibold text-lg">
                  {booking.celebrity?.name || "Celebrity"}
                </h3>
                <Badge variant={getStatusVariant(booking.status)}>
                  {booking.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Booking #{booking.id} • {new Date(booking.createdAt!).toLocaleDateString()}
              </p>
              {booking.eventDate && (
                <p className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Event: {new Date(booking.eventDate).toLocaleDateString()}
                </p>
              )}
              <p className="font-heading font-bold text-lg text-skyline-gold">
                {formatPrice(booking.priceUsd)}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href={`/dashboard/messages?type=booking&id=${booking.id}`}>
                <Button variant="outline" size="sm" className="gap-2" data-testid={`button-booking-chat-${booking.id}`}>
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="gap-2" data-testid={`button-booking-invoice-${booking.id}`}>
                <FileText className="h-4 w-4" />
                Invoice
              </Button>
            </div>
          </div>
          {booking.eventDetails && (
            <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
              {booking.eventDetails}
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
              <h1 className="font-heading font-bold text-2xl md:text-3xl mb-2">My Bookings</h1>
              <p className="text-muted-foreground">Manage your celebrity booking requests.</p>
            </div>
            <Link href="/celebrities">
              <Button className="gap-2" data-testid="button-new-booking">
                <Plus className="h-4 w-4" />
                New Booking
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all" data-testid="tab-all-bookings">
                All ({bookings?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="pending" data-testid="tab-pending-bookings">
                Pending ({pendingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="active" data-testid="tab-active-bookings">
                Active ({activeBookings.length})
              </TabsTrigger>
              <TabsTrigger value="completed" data-testid="tab-completed-bookings">
                History ({completedBookings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-40" />
                  ))}
                </div>
              ) : bookings && bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="font-heading font-semibold text-lg mb-2">No bookings yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by browsing our celebrity directory and making your first booking.
                    </p>
                    <Link href="/celebrities">
                      <Button data-testid="button-browse-to-book">Browse Celebrities</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="pending">
              {pendingBookings.length > 0 ? (
                <div className="space-y-4">
                  {pendingBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No pending bookings
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="active">
              {activeBookings.length > 0 ? (
                <div className="space-y-4">
                  {activeBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No active bookings
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {completedBookings.length > 0 ? (
                <div className="space-y-4">
                  {completedBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No booking history
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
