import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="outline" className="bg-primary-100 text-primary-800">
              Legal
            </Badge>
            <h1 className="text-3xl font-bold text-neutral-900">Privacy Policy</h1>
          </div>

          <div className="prose max-w-none">
            <p className="text-neutral-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-800 mb-4">1. Introduction</h2>
              <p className="text-neutral-700">
                At EthicalAI, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-800 mb-4">2. Information We Collect</h2>
              <p className="text-neutral-700 mb-4">We collect several types of information from and about users of our website, including:</p>
              <ul className="list-disc pl-6 text-neutral-700">
                <li>Personal information (name, email address, etc.)</li>
                <li>Usage data (how you interact with our website)</li>
                <li>Device information (IP address, browser type, etc.)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-800 mb-4">3. How We Use Your Information</h2>
              <p className="text-neutral-700 mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-neutral-700">
                <li>Provide and maintain our service</li>
                <li>Notify you about changes to our service</li>
                <li>Provide customer support</li>
                <li>Gather analysis or valuable information to improve our service</li>
                <li>Monitor the usage of our service</li>
                <li>Detect, prevent and address technical issues</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-800 mb-4">4. Data Security</h2>
              <p className="text-neutral-700">
                The security of your data is important to us. We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-800 mb-4">5. Your Data Protection Rights</h2>
              <p className="text-neutral-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-neutral-700">
                <li>Access your personal data</li>
                <li>Correct your personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Request restriction of processing your personal data</li>
                <li>Request transfer of your personal data</li>
                <li>Withdraw consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-800 mb-4">6. Cookies</h2>
              <p className="text-neutral-700">
                We use cookies and similar tracking technologies to track the activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-800 mb-4">7. Changes to This Privacy Policy</h2>
              <p className="text-neutral-700">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-800 mb-4">8. Contact Us</h2>
              <p className="text-neutral-700">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-neutral-700 mt-2">
                Email: privacy@ethicalai.com<br />
                Address: [Your Company Address]
              </p>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicy; 