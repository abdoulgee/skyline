import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-8">
            Privacy <span className="text-gradient-cyan">Policy</span>
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-muted-foreground">
              Last updated: December 2024
            </p>

            <h2>1. Introduction</h2>
            <p>
              Skyline LTD ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our celebrity booking platform.
            </p>

            <h2>2. Information We Collect</h2>
            <p>
              We collect the following types of information:
            </p>
            <h3>Personal Information</h3>
            <ul>
              <li>Name and contact details (email, phone number)</li>
              <li>Profile information from authentication providers</li>
              <li>Billing and transaction history</li>
              <li>Communication records with our agents</li>
            </ul>
            <h3>Automatically Collected Information</h3>
            <ul>
              <li>Device and browser information</li>
              <li>IP address and location data</li>
              <li>Usage patterns and preferences</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>
              We use your personal information to:
            </p>
            <ul>
              <li>Provide and improve our celebrity booking services</li>
              <li>Process transactions and manage your wallet</li>
              <li>Communicate with you about bookings and campaigns</li>
              <li>Send notifications about your account activity</li>
              <li>Ensure platform security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>4. Data Sharing</h2>
            <p>
              We may share your information with:
            </p>
            <ul>
              <li>Celebrity talent and their representatives (for booking purposes)</li>
              <li>Payment processors for transaction handling</li>
              <li>Service providers who assist our operations</li>
              <li>Legal authorities when required by law</li>
            </ul>
            <p>
              We do not sell your personal information to third parties.
            </p>

            <h2>5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data, including:
            </p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and assessments</li>
              <li>Access controls and authentication protocols</li>
              <li>Secure data centers with physical security measures</li>
            </ul>

            <h2>6. Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Object to certain processing activities</li>
              <li>Export your data in a portable format</li>
            </ul>

            <h2>7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to enhance your experience, analyze usage patterns, and personalize content. You can manage cookie preferences through your browser settings.
            </p>

            <h2>8. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Transaction records are kept for a minimum of 7 years as required by financial regulations.
            </p>

            <h2>9. International Transfers</h2>
            <p>
              Your data may be transferred to and processed in countries outside your residence. We ensure appropriate safeguards are in place for such transfers.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this privacy policy periodically. We will notify you of significant changes through our platform or via email.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              For privacy-related inquiries, please contact our Data Protection Officer:
            </p>
            <address className="not-italic">
              Skyline LTD - Privacy Team<br />
              350 Fifth Avenue, Suite 5000<br />
              New York, NY 10118<br />
              Email: privacy@skylineltd.org
            </address>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
