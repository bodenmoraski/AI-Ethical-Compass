import { Card, CardContent } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Terms of{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-primary-800">
                  Service
                </span>
                <span className="absolute inset-x-0 bottom-0 h-3 bg-primary-100"></span>
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl">
              Please read these terms carefully before using our educational platform.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-slate max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-600 mb-4">
                By accessing or using AI Ethical Compass, you agree to be bound by these Terms of Service. 
                If you disagree with any part of the terms, you may not access the service.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Educational Purpose</h2>
              <p className="text-slate-600 mb-4">
                Our platform is designed for educational purposes. Users agree to:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Use the platform for learning and educational development</li>
                <li>Engage respectfully with scenarios and discussions</li>
                <li>Not misuse or attempt to manipulate the platform</li>
                <li>Maintain academic integrity in all interactions</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. User Accounts</h2>
              <p className="text-slate-600 mb-4">
                When creating an account, you agree to:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any security breaches</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Intellectual Property</h2>
              <p className="text-slate-600 mb-4">
                All content on AI Ethical Compass, including but not limited to scenarios, text, graphics, 
                and code, is the property of AI Ethical Compass and is protected by intellectual property laws.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. User Contributions</h2>
              <p className="text-slate-600 mb-4">
                By submitting content to our platform, you:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Grant us the right to use and display your contributions</li>
                <li>Maintain ownership of your original content</li>
                <li>Accept responsibility for your contributions</li>
                <li>Agree not to submit inappropriate or harmful content</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-slate-600 mb-4">
                AI Ethical Compass is provided "as is" without any warranties. We are not liable for any 
                damages arising from the use or inability to use our services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Changes to Terms</h2>
              <p className="text-slate-600 mb-4">
                We reserve the right to modify these terms at any time. Users will be notified of significant changes.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact</h2>
              <p className="text-slate-600">
                For questions about these terms, please contact:{" "}
                <a href="mailto:bodenmoraski@gmail.com" className="text-primary-800 hover:text-primary-900">
                  bodenmoraski@gmail.com
                </a>
              </p>
            </section>

            <section className="border-t border-slate-200 pt-8 text-sm text-slate-500">
              <p>Last updated: March 2024</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms; 