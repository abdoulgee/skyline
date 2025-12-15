import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Wallet, Calendar, Megaphone, MessageSquare, Bell, TrendingUp, ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import type { User, Booking, Campaign, Notification } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    enabled: !!user,
  });

  const { data: campaigns } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
    enabled: !!user,
  });

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const pendingBookings = bookings?.filter(b => b.status === "pending").length || 0;
  const activeCampaigns = campaigns?.filter(c => c.status === "negotiating" || c.status === "approved").length || 0;
  const unreadNotifications = notifications?.filter(n => !n.isRead).length || 0;

  const formatBalance = (balance: string | number) => {
    const num = typeof balance === "string" ? parseFloat(balance) : balance;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(num);
  };
  
  const displayName = user?.firstName || user?.username || "User";

  const stats = [
    {
      title: "Wallet Balance",
      value: formatBalance(user?.balanceUsd || 0),
      icon: Wallet,
      href: "/dashboard/wallet",
      color: "text-skyline-gold",
      bgColor: "bg-skyline-gold/10",
    },
    {
      title: "Active Bookings",
      value: pendingBookings,
      icon: Calendar,
      href: "/dashboard/bookings",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Campaigns",
      value: activeCampaigns,
      icon: Megaphone,
      href: "/dashboard/campaigns",
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
    {
      title: "Unread Notifications",
      value: unreadNotifications,
      icon: Bell,
      href: "/dashboard/notifications",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-2xl md:text-3xl mb-2">
              Welcome back, <span className="text-gradient-cyan">{displayName}</span>
            </h1>
            <p className="text-muted-foreground">
              Manage your celebrity bookings, campaigns, and wallet from your dashboard.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {stats.map((stat) => (
              <Link key={stat.title} href={stat.href}>
                <Card className="hover-elevate cursor-pointer h-full">
                  <CardContent className="p-4 md:p-6">
                    <div className={`inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full ${stat.bgColor} mb-3`}>
                      <stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`} />
                    </div>
                    <p className="text-muted-foreground text-xs md:text-sm mb-1">{stat.title}</p>
                    <p className={`font-heading font-bold text-lg md:text-2xl ${stat.color}`}>
                      {stat.value}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="font-heading text-lg">Recent Bookings</CardTitle>
                <Link href="/dashboard/bookings">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {bookings && bookings.length > 0 ? (
                  <div className="space-y-3">
                    {bookings.slice(0, 3).map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Booking #{booking.id}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(booking.createdAt!).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            booking.status === "confirmed" ? "default" :
                            booking.status === "completed" ? "secondary" :
                            booking.status === "cancelled" ? "destructive" : "outline"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No bookings yet</p>
                    <Link href="/celebrities">
                      <Button variant="link" className="mt-2">
                        Browse celebrities
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="font-heading text-lg">Recent Notifications</CardTitle>
                <Link href="/dashboard/notifications">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {notifications && notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.slice(0, 4).map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-3 p-3 rounded-lg ${
                          notification.isRead ? "bg-muted/30" : "bg-primary/5"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          notification.isRead ? "bg-muted-foreground" : "bg-primary"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{notification.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No notifications</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card className="bg-gradient-to-r from-skyline-navy to-skyline-navy/80 text-white">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-heading font-bold text-xl md:text-2xl mb-2">
                      Ready to Book a Celebrity?
                    </h3>
                    <p className="text-white/80 text-sm md:text-base">
                      Explore our roster of world-class talent for your next event or campaign.
                    </p>
                  </div>
                  <Link href="/celebrities">
                    <Button size="lg" className="bg-skyline-cyan hover:bg-skyline-cyan/90">
                      Explore Celebrities
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <MobileNav />
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}