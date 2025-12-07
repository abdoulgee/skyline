import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-8">
            Terms & <span className="text-gradient-cyan">Conditions</span>
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-muted-foreground">
              Last updated: December 2024
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Skyline LTD platform, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Skyline LTD provides a platform connecting clients with celebrity talent for bookings, campaigns, and endorsement opportunities. Our services include but are not limited to:
            </p>
            <ul>
              <li>Celebrity booking facilitation</li>
              <li>Campaign management and coordination</li>
              <li>Secure payment processing via cryptocurrency</li>
              <li>Agent-managed communications</li>
            </ul>

            <h2>3. User Accounts</h2>
            <p>
              To access certain features of the platform, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>

            <h2>4. Wallet and Payments</h2>
            <p>
              All transactions on Skyline LTD are conducted in USD. Users may fund their wallet using supported cryptocurrencies (BTC, ETH, USDT). Key terms:
            </p>
            <ul>
              <li>Cryptocurrency deposits are converted to USD at current market rates</li>
              <li>All deposits are subject to verification before being credited</li>
              <li>Wallet balances are non-refundable except in cases of service failure</li>
              <li>Transaction fees may apply</li>
            </ul>

            <h2>5. Booking Terms</h2>
            <p>
              Celebrity bookings are subject to availability and confirmation. Upon booking:
            </p>
            <ul>
              <li>Payment is deducted from your wallet balance</li>
              <li>Bookings enter a pending status until confirmed by our agents</li>
              <li>Cancellation policies vary by celebrity and event type</li>
              <li>Skyline LTD is not liable for celebrity cancellations due to force majeure</li>
            </ul>

            <h2>6. Campaign Terms</h2>
            <p>
              Campaign requests are negotiated through our agent system. Campaign pricing may vary based on scope, duration, and celebrity requirements. All campaign terms must be mutually agreed upon before execution.
            </p>

            <h2>7. Intellectual Property</h2>
            <p>
              All content on the Skyline LTD platform, including text, graphics, logos, and images, is the property of Skyline LTD or its content suppliers and is protected by intellectual property laws.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              Skyline LTD shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.
            </p>

            <h2>9. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of the State of New York, United States.
            </p>

            <h2>10. Contact Information</h2>
            <p>
              For questions about these Terms & Conditions, please contact us at:
            </p>
            <address className="not-italic">
              Skyline LTD<br />
              350 Fifth Avenue, Suite 5000<br />
              New York, NY 10118<br />
              Email: legal@skylineltd.com
            </address>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
