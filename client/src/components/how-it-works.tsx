import { Search, MessageSquare, CreditCard, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Browse Celebrities",
    description: "Explore our curated roster of world-class talent across entertainment, sports, and more.",
  },
  {
    icon: MessageSquare,
    title: "Contact Agent",
    description: "Connect directly with our dedicated agents who manage celebrity relationships.",
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    description: "Fund your wallet with crypto and pay securely for your booking or campaign.",
  },
  {
    icon: CheckCircle,
    title: "Confirmation",
    description: "Receive confirmation and work with our team to make your event a success.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-skyline-navy text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-skyline-cyan rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-skyline-gold rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <span className="text-skyline-cyan font-medium text-sm uppercase tracking-wider">
            Simple Process
          </span>
          <h2 className="font-heading font-bold text-3xl md:text-4xl mt-2 mb-4">
            How It <span className="text-skyline-gold">Works</span>
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Book your favorite celebrity in just four simple steps. Our streamlined process ensures a seamless experience from start to finish.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative text-center group"
              data-testid={`step-${index + 1}`}
            >
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-skyline-cyan/50 to-transparent" />
              )}
              
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-skyline-cyan to-skyline-cyan/50 mb-6 group-hover:scale-110 transition-transform duration-300">
                <step.icon className="h-10 w-10 text-white" />
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-skyline-gold flex items-center justify-center font-heading font-bold text-skyline-navy">
                  {index + 1}
                </div>
              </div>

              <h3 className="font-heading font-semibold text-xl mb-3">{step.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
