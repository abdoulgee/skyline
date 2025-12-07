import { Link } from "wouter";
import { MapPin, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-skyline-navy text-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-md bg-gradient-to-br from-skyline-cyan to-white/20 flex items-center justify-center">
                <span className="text-white font-heading font-bold text-lg">S</span>
              </div>
              <span className="font-heading font-bold text-xl">
                Skyline<span className="text-skyline-gold"> LTD</span>
              </span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Premium celebrity booking and campaign platform. Connecting brands with world-class talent since 2020.
            </p>
            <p className="text-white/50 text-xs">
              A SONY Company
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-skyline-gold">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/celebrities">
                <span className="text-white/70 hover:text-skyline-cyan transition-colors text-sm" data-testid="link-footer-celebrities">
                  Browse Celebrities
                </span>
              </Link>
              <Link href="/about">
                <span className="text-white/70 hover:text-skyline-cyan transition-colors text-sm" data-testid="link-footer-about">
                  About Us
                </span>
              </Link>
              <Link href="/contact">
                <span className="text-white/70 hover:text-skyline-cyan transition-colors text-sm" data-testid="link-footer-contact">
                  Contact
                </span>
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-skyline-gold">Legal</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/terms">
                <span className="text-white/70 hover:text-skyline-cyan transition-colors text-sm" data-testid="link-footer-terms">
                  Terms & Conditions
                </span>
              </Link>
              <Link href="/privacy">
                <span className="text-white/70 hover:text-skyline-cyan transition-colors text-sm" data-testid="link-footer-privacy">
                  Privacy Policy
                </span>
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-skyline-gold">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-skyline-cyan mt-0.5 flex-shrink-0" />
                <span className="text-white/70 text-sm">
                  350 Fifth Avenue, Suite 5000<br />
                  New York, NY 10118, USA
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-skyline-cyan flex-shrink-0" />
                <span className="text-white/70 text-sm">contact@skylineltd.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-skyline-cyan flex-shrink-0" />
                <span className="text-white/70 text-sm">+1 (212) 555-0100</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-white/50 text-sm">
            &copy; {new Date().getFullYear()} Skyline LTD. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
