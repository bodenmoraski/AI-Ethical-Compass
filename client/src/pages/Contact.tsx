import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Contact = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Meet Our{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-primary-800">
                  Team
                </span>
                <span className="absolute inset-x-0 bottom-0 h-3 bg-primary-100"></span>
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl">
              Get to know the people behind AI Ethical Compass and reach out with any questions.
            </p>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="relative bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Founder */}
            <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
              <div className="flex items-start space-x-6">
                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span className="material-icons text-3xl text-primary-800">person</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Boden Moraski</h2>
                  <p className="text-primary-800 font-medium mb-4">Founder & Lead Developer</p>
                  <div className="space-y-3">
                    <div className="flex items-center text-slate-600">
                      <span className="material-icons text-xl mr-3">mail</span>
                      <a href="mailto:bodenmoraski@gmail.com" className="hover:text-primary-800">
                        bodenmoraski@gmail.com
                      </a>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <span className="material-icons text-xl mr-3">school</span>
                      <a href="mailto:27moraskib@shadysideacademy.org" className="hover:text-primary-800">
                        27moraskib@shadysideacademy.org
                      </a>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <span className="material-icons text-xl mr-3">work</span>
                      <a href="https://linkedin.com/in/boden-moraski" target="_blank" rel="noopener noreferrer" className="hover:text-primary-800">
                        linkedin.com/in/boden-moraski
                      </a>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <span className="material-icons text-xl mr-3">code</span>
                      <a href="https://github.com/bodenmoraski" target="_blank" rel="noopener noreferrer" className="hover:text-primary-800">
                        github.com/bodenmoraski
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Co-founder */}
            <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
              <div className="flex items-start space-x-6">
                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span className="material-icons text-3xl text-primary-800">person</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Roshan Kshirsagar</h2>
                  <p className="text-primary-800 font-medium mb-4">Co-founder</p>
                  <div className="space-y-3">
                    <div className="flex items-center text-slate-600">
                      <span className="material-icons text-xl mr-3">mail</span>
                      <span className="italic">Email coming soon</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <span className="material-icons text-xl mr-3">work</span>
                      <span className="italic">LinkedIn coming soon</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <span className="material-icons text-xl mr-3">code</span>
                      <span className="italic">GitHub coming soon</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* General Contact */}
          <div className="mt-16">
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Get in Touch</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-medium text-slate-900 mb-4">General Inquiries</h3>
                  <p className="text-slate-600 mb-4">
                    Have questions about AI Ethical Compass? We'd love to hear from you.
                  </p>
                  <a 
                    href="mailto:bodenmoraski@gmail.com"
                    className="inline-flex items-center text-primary-800 hover:text-primary-900 font-medium"
                  >
                    Send us an email
                    <span className="material-icons ml-2">arrow_forward</span>
                  </a>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-4">Educational Partnerships</h3>
                  <p className="text-slate-600 mb-4">
                    Interested in implementing AI Ethical Compass at your institution?
                  </p>
                  <a 
                    href="mailto:27moraskib@shadysideacademy.org"
                    className="inline-flex items-center text-primary-800 hover:text-primary-900 font-medium"
                  >
                    Contact our education team
                    <span className="material-icons ml-2">arrow_forward</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 