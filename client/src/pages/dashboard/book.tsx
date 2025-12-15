import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Calendar, DollarSign, CheckCircle } from "lucide-react";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Celebrity } from "@shared/schema";
import { Link } from "wouter";

export default function BookCelebrityPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [eventDate, setEventDate] = useState("");
  const [eventDetails, setEventDetails] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  const { data: celebrity, isLoading } = useQuery<Celebrity>({
    queryKey: ["/api/celebrities", id],
    enabled: !!id,
  });

  const bookingMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/bookings", {
        celebrityId: parseInt(id!),
        priceUsd: celebrity?.priceUsd,
        eventDate: eventDate ? new Date(eventDate).toISOString() : null,
        eventDetails,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsConfirmed(true);
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Unable to create booking. Please try again.",
        variant: "destructive",
      });
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

  const formatBalance = (balance: string | number) => {
    const num = typeof balance === "string" ? parseFloat(balance) : balance;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const userBalance = parseFloat(user?.balanceUsd || "0");
  const celebrityPrice = parseFloat(celebrity?.priceUsd || "0");
  const hasEnoughBalance = userBalance >= celebrityPrice;

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

  if (isConfirmed) {
    return (
      <div className="min-h-screen flex flex-col pb-20 md:pb-0">
        <Header />
        <main className="flex-1 bg-muted/30 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="font-heading font-bold text-2xl mb-2">Booking Request Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Your booking request for {celebrity?.name} has been submitted. Our team will review and confirm your booking shortly.
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/dashboard/bookings">
                  <Button className="w-full" data-testid="button-view-bookings">
                    View My Bookings
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Book {celebrity?.name}</CardTitle>
                  <CardDescription>Complete the form below to submit your booking request.</CardDescription>
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

                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Event Date (Optional)</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      data-testid="input-event-date"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventDetails">Event Details</Label>
                    <Textarea
                      id="eventDetails"
                      value={eventDetails}
                      onChange={(e) => setEventDetails(e.target.value)}
                      placeholder="Describe your event, requirements, and any special requests..."
                      rows={6}
                      data-testid="input-event-details"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Celebrity Fee</span>
                    <span className="font-semibold text-skyline-gold">
                      {formatPrice(celebrity?.priceUsd || 0)}
                    </span>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Your Wallet</span>
                      <span className={`font-semibold ${hasEnoughBalance ? "text-green-500" : "text-destructive"}`}>
                        {formatBalance(userBalance)}
                      </span>
                    </div>
                    {!hasEnoughBalance && (
                      <p className="text-xs text-destructive">
                        Insufficient balance. Please add funds to your wallet.
                      </p>
                    )}
                  </div>

                  <div className="border-t pt-4 flex flex-col gap-3">
                    {hasEnoughBalance ? (
                      <Button
                        onClick={() => bookingMutation.mutate()}
                        disabled={bookingMutation.isPending}
                        className="w-full gap-2"
                        size="lg"
                        data-testid="button-confirm-booking"
                      >
                        <Calendar className="h-4 w-4" />
                        {bookingMutation.isPending ? "Processing..." : "Confirm Booking"}
                      </Button>
                    ) : (
                      <Link href="/dashboard/wallet">
                        <Button className="w-full gap-2" size="lg" data-testid="button-add-funds">
                          <DollarSign className="h-4 w-4" />
                          Add Funds to Wallet
                        </Button>
                      </Link>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    By confirming, you agree to our booking terms and conditions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
