import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, Trash2, Wallet, Calendar, Megaphone, MessageSquare } from "lucide-react";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Notification } from "@shared/schema";

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PATCH", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", "/api/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <Wallet className="h-5 w-5 text-green-500" />;
      case "booking":
        return <Calendar className="h-5 w-5 text-primary" />;
      case "campaign":
        return <Megaphone className="h-5 w-5 text-chart-4" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading font-bold text-2xl md:text-3xl mb-2">Notifications</h1>
              <p className="text-muted-foreground">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                  : "All caught up!"}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="gap-2"
                data-testid="button-mark-all-read"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">All Notifications</CardTitle>
              <CardDescription>Stay updated on your bookings, campaigns, and wallet activity</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : notifications && notifications.length > 0 ? (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-4 py-4 ${
                        !notification.isRead ? "bg-primary/5 -mx-4 px-4" : ""
                      }`}
                      data-testid={`notification-${notification.id}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        !notification.isRead ? "bg-primary/10" : "bg-muted"
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`font-medium ${!notification.isRead ? "" : "text-muted-foreground"}`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <Badge variant="default" className="flex-shrink-0">New</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(notification.createdAt!)}
                          </span>
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markReadMutation.mutate(notification.id)}
                              disabled={markReadMutation.isPending}
                              className="h-auto py-1 px-2 text-xs"
                              data-testid={`button-mark-read-${notification.id}`}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-heading font-semibold text-lg mb-2">No notifications</h3>
                  <p className="text-muted-foreground">
                    You'll be notified about deposits, bookings, and campaigns here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
