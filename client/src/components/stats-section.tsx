import { Users, Star, Globe, Award } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "500+",
    label: "Celebrity Partners",
    description: "A-list talent across all industries",
  },
  {
    icon: Star,
    value: "10K+",
    label: "Successful Bookings",
    description: "Events and campaigns delivered",
  },
  {
    icon: Globe,
    value: "50+",
    label: "Countries Served",
    description: "Global reach and presence",
  },
  {
    icon: Award,
    value: "98%",
    label: "Client Satisfaction",
    description: "Exceptional service guaranteed",
  },
];

export function StatsSection() {
  return (
    <section className="py-16 md:py-24 bg-skyline-slate dark:bg-muted/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
            Trusted by <span className="text-gradient-gold">Industry Leaders</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our track record speaks for itself. Join thousands of satisfied clients who have elevated their brand with Skyline LTD.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center p-6 bg-background rounded-xl shadow-sm border animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="font-heading font-bold text-3xl md:text-4xl text-skyline-navy dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="font-semibold text-foreground mb-1">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
