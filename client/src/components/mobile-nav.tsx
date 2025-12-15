import { Link, useLocation } from "wouter";
import { Home, Users, Megaphone, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/dashboard/bookings", icon: Users, label: "Bookings" },
  { href: "/dashboard/campaigns", icon: Megaphone, label: "Campaigns" },
  { href: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
];

export function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t bottom-nav-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location === item.href || 
            (item.href !== "/dashboard" && location.startsWith(item.href));
          
          return (
            <Link key={item.href} href={item.href}>
              <span
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                data-testid={`link-mobile-nav-${item.label.toLowerCase()}`}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                <span className="text-xs font-medium">{item.label}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
