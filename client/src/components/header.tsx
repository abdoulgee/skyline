import { Link, useLocation } from "wouter";
import { Menu, X, Wallet, Bell, LogIn, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Notification } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/celebrities", label: "Celebrities" },
  { href: "/campaigns", label: "Campaigns" }, // Moved here
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
    refetchInterval: 10000,
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-skyline-cyan to-skyline-navy flex items-center justify-center">
                <span className="text-white font-heading font-bold text-sm">S</span>
              </div>
              <span className="font-heading font-bold text-xl hidden sm:block">
                <span className="text-skyline-navy dark:text-white">Skyline</span>
                <span className="text-skyline-gold"> LTD</span>
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location === link.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {user ? (
              <>
                {/* Mobile Icons (Always shown when logged in) */}
                <div className="flex items-center gap-2">
                    {/*<Link href="/dashboard/messages">
                      <Button variant="ghost" size="icon" className="relative">
                        <MessageSquare className="h-5 w-5" />
                        <span className="sr-only">Messages</span>
                      </Button>
                    </Link> */}

                    <Link href="/dashboard/wallet">
                      <Button variant="ghost" size="icon" className="relative">
                        <Wallet className="h-5 w-5" />
                        <span className="sr-only">Wallet</span>
                      </Button>
                    </Link>

                    <Link href="/dashboard/notifications">
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                          >
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </Badge>
                        )}
                        <span className="sr-only">Notifications</span>
                      </Button>
                    </Link>
                </div>
                
                {/* Desktop/Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {user.firstName?.[0] || user.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Panel</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => logoutMutation.mutate()}
                      className="cursor-pointer"
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button className="hidden sm:inline-flex">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                  <Button size="icon" className="sm:hidden">
                    <LogIn className="h-4 w-4" />
                  </Button>
                </Link>

                {/* Mobile Menu Toggle for UN-AUTHENTICATED users 
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button> */}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}