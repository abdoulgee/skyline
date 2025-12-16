import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1600&h=600&fit=crop"
              alt="Celebrity event"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-skyline-navy via-skyline-navy/90 to-skyline-navy/70" />
          </div>

          <div className="relative z-10 py-16 md:py-24 px-6 md:px-12 lg:px-16 text-center md:text-left">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-skyline-gold/20 text-skyline-gold rounded-full text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Start Your Journey Today
              </div>
              
              <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-4 text-3d">
                Ready to Work with{" "}
                <span className="text-skyline-gold">World-Class Talent?</span>
              </h2>
              
              <p className="text-white/80 text-lg mb-8 max-w-lg">
                Join thousands of brands and event organizers who trust Skyline LTD for premium celebrity engagements.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a href="/auth">
                  <Button size="lg" className="bg-skyline-cyan hover:bg-skyline-cyan/90 text-white font-semibold px-8 gap-2" data-testid="button-cta-get-started">
                    Get Started
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </a>
                <a href="/contact">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" data-testid="button-cta-contact">
                    Contact Sales
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
