import { Building2, Users, Globe, Award, Shield, Clock } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";

const values = [
  {
    icon: Shield,
    title: "Trust & Security",
    description: "Your transactions and personal information are protected with enterprise-grade security.",
  },
  {
    icon: Users,
    title: "Premium Network",
    description: "Access to an exclusive roster of A-list celebrities across entertainment, sports, and media.",
  },
  {
    icon: Clock,
    title: "Dedicated Support",
    description: "Our agents are available 24/7 to ensure seamless booking experiences.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Operating in over 50 countries, connecting brands with talent worldwide.",
  },
];

const team = [
  {
    name: "Alexandra Chen",
    role: "Chief Executive Officer",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
  },
  {
    name: "Marcus Williams",
    role: "Chief Operations Officer",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
  },
  {
    name: "Sophie Martinez",
    role: "VP of Talent Relations",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
  },
  {
    name: "David Kim",
    role: "VP of Client Success",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
];

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative py-24 md:py-32 bg-skyline-navy overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?w=1600&h=800&fit=crop"
              alt="New York City"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-skyline-navy via-skyline-navy/80 to-skyline-navy/60" />
          </div>
          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <span className="inline-block px-4 py-2 bg-skyline-gold/20 text-skyline-gold rounded-full text-sm font-medium mb-6">
                About Skyline LTD
              </span>
              <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-white mb-6 text-3d">
                Redefining Celebrity <span className="text-skyline-gold">Engagement</span>
              </h1>
              <p className="text-white/80 text-lg md:text-xl leading-relaxed">
                Headquartered in New York City, Skyline LTD is a premium celebrity booking and campaign platform owned by SONY Company. We connect world-class brands with extraordinary talent.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">
                  Our <span className="text-gradient-cyan">Story</span>
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Founded in 2020, Skyline LTD emerged from a vision to revolutionize how brands and event organizers connect with celebrity talent. Under the umbrella of SONY Company, we bring unparalleled resources and industry connections to every engagement.
                  </p>
                  <p>
                    From our flagship office at 350 Fifth Avenue in New York, we have grown to serve clients across 50+ countries, facilitating over 10,000 successful bookings and campaigns with our roster of 500+ celebrity partners.
                  </p>
                  <p>
                    Our dedicated team of agents and relationship managers ensures that every interaction meets the highest standards of professionalism and delivers exceptional results for both our clients and talent partners.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=800&fit=crop"
                    alt="Skyline LTD Office"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-skyline-gold text-skyline-navy p-6 rounded-xl shadow-lg">
                  <div className="flex items-center gap-4">
                    <Building2 className="h-8 w-8" />
                    <div>
                      <p className="font-heading font-bold text-2xl">Since 2020</p>
                      <p className="text-sm opacity-80">A SONY Company</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-skyline-slate dark:bg-muted/30">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
                Our <span className="text-gradient-gold">Values</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These core principles guide everything we do at Skyline LTD.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={value.title} className="text-center">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
                      <value.icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
                Leadership <span className="text-gradient-cyan">Team</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Meet the executives driving Skyline LTD's mission forward.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member) => (
                <Card key={member.name} className="overflow-hidden group">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4 text-center">
                    <h3 className="font-heading font-semibold text-lg">{member.name}</h3>
                    <p className="text-muted-foreground text-sm">{member.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
