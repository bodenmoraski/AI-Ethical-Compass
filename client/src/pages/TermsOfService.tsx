import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TermsOfService = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="outline" className="bg-primary-100 text-primary-800">
              Legal
            </Badge>
            <h1 className="text-3xl font-bold text-neutral-900">Terms of Service</h1>
          </div>

          <div className="prose max-w-none">
            <p className="text-neutral-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-800 mb-4">1. Introduction</h2>
              <p className="text-neutral-700 mb-4">
                Welcome to EthicalAI. These Terms of Service ("Terms") govern your access to and use of our website, services, and applications (collectively, the "Service").
              </p>
              <p className="text-neutral-700">
                By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-800 mb-4">2. Use License</h2>
              <p className="text-neutral-700 mb-4">
                Permission is granted to temporarily access the materials (information or software) on EthicalAI's website for personal, non-commercial transitory viewing only.
              </p>
              <p className="text-neutral-700">
                This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 mt-4 text-neutral-700">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to decompile or reverse engineer any software</li>
                <li>Remove any copyright or other proprietary notations</li>
                <li>Transfer the materials to another person</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-800 mb-4">3. User Content</h2>
              <p className="text-neutral-700 mb-4">
                Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, or other material ("Content").
              </p>
              <p className="text-neutral-700">
                You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-800 mb-4">4. Disclaimer</h2>
              <p className="text-neutral-700 mb-4">
                The materials on EthicalAI's website are provided on an 'as is' basis. EthicalAI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-800 mb-4">5. Limitations</h2>
              <p className="text-neutral-700">
                In no event shall EthicalAI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on EthicalAI's website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-800 mb-4">6. Revisions and Errata</h2>
              <p className="text-neutral-700">
                The materials appearing on EthicalAI's website could include technical, typographical, or photographic errors. EthicalAI does not warrant that any of the materials on its website are accurate, complete, or current. EthicalAI may make changes to the materials contained on its website at any time without notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-800 mb-4">7. Contact Us</h2>
              <p className="text-neutral-700">
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="text-neutral-700 mt-2">
                Email: support@ethicalai.com<br />
                Address: [Your Company Address]
              </p>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsOfService; 