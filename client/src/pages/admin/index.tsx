import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Users, Star, Calendar, Megaphone, Wallet, MessageSquare, Settings, TrendingUp, ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: isLoadingStats } = useQuery<{
    totalUsers: number;
    totalCelebrities: number;
    pendingBookings: number;
    pendingCampaigns: number;
    pendingDeposits: number;
    totalRevenue: number;
  }>({
    queryKey: ["/api/admin/stats"],
  });

  const formatRevenue = (value: number) => {
    return `$${(value || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const adminStats = [
    {
      title: "Total Users",
      value: stats?.totalUsers,
      icon: Users,
      href: "/admin/users",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      isCurrency: false,
    },
    {
      title: "Celebrities",
      value: stats?.totalCelebrities,
      icon: Star,
      href: "/admin/celebrities",
      color: "text-skyline-gold",
      bgColor: "bg-skyline-gold/10",
      isCurrency: false,
    },
    {
      title: "Pending Bookings",
      value: stats?.pendingBookings,
      icon: Calendar,
      href: "/admin/bookings",
      color: "text-primary",
      bgColor: "bg-primary/10",
      isCurrency: false,
    },
    {
      title: "Pending Campaigns",
      value: stats?.pendingCampaigns,
      icon: Megaphone,
      href: "/admin/campaigns",
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      isCurrency: false,
    },
    {
      title: "Pending Deposits",
      value: stats?.pendingDeposits,
      icon: Wallet,
      href: "/admin/deposits",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      isCurrency: false,
    },
    {
      title: "Total Revenue",
      value: stats?.totalRevenue,
      icon: TrendingUp,
      href: "/admin",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      isCurrency: true,
    },
  ];

  const quickLinks = [
    { title: "Manage Users", href: "/admin/users", icon: Users },
    { title: "Manage Celebrities", href: "/admin/celebrities", icon: Star },
    { title: "View Bookings", href: "/admin/bookings", icon: Calendar },
    { title: "View Campaigns", href: "/admin/campaigns", icon: Megaphone },
    { title: "Manage Deposits", href: "/admin/deposits", icon: Wallet },
    { title: "View Messages", href: "/admin/messages", icon: MessageSquare },
    { title: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-2xl md:text-3xl mb-2">
              Admin <span className="text-gradient-cyan">Dashboard</span>
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.firstName || user?.username}. Manage the Skyline LTD platform.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {adminStats.map((stat) => (
              <Link key={stat.title} href={stat.href}>
                <Card className="hover-elevate cursor-pointer h-full">
                  <CardContent className="p-4">
                    {isLoadingStats ? (
                      <div className="space-y-2">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-6 w-full" />
                      </div>
                    ) : (
                      <>
                        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${stat.bgColor} mb-3`}>
                          <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <p className="text-muted-foreground text-xs mb-1">{stat.title}</p>
                        <p className={`font-heading font-bold text-xl ${stat.color}`} data-testid={`admin-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                          {stat.isCurrency ? formatRevenue(stat.value as number) : (stat.value || 0).toLocaleString()}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {quickLinks.map((link) => (
                      <Link key={link.title} href={link.href}>
                        <Button
                          variant="outline"
                          className="w-full h-auto py-4 flex flex-col gap-2"
                          data-testid={`link-admin-${link.title.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <link.icon className="h-5 w-5" />
                          <span className="text-sm">{link.title}</span>
                        </Button>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-lg">System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Platform Status</span>
                    <span className="text-sm font-medium text-green-500">Operational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CoinGecko API</span>
                    <span className="text-sm font-medium text-green-500">Connected (Mocked)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <span className="text-sm font-medium text-green-500">Healthy</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}