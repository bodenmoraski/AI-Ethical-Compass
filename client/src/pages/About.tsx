import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Shaping the Future of{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-primary-800">
                  AI in Education
                </span>
                <span className="absolute inset-x-0 bottom-0 h-3 bg-primary-100"></span>
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl">
              AI Ethical Compass empowers students and educators to navigate the complex ethical landscape of artificial intelligence in education.
            </p>
            <div className="flex flex-wrap gap-4">
              <NavLink to="/scenarios/1">
                <Button size="lg" variant="outline" className="border-2 border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-primary-300 shadow-sm hover:shadow-md transition-all duration-300">
                  Start Exploring
                  <span className="material-icons ml-2">arrow_forward</span>
                </Button>
              </NavLink>
              <NavLink to="/resources">
                <Button size="lg" variant="outline" className="border-2 border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-primary-300 shadow-sm hover:shadow-md transition-all duration-300">
                  View Resources
                  <span className="material-icons ml-2">library_books</span>
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="text-4xl font-bold text-primary-800 mb-2">10+</div>
              <div className="text-sm text-slate-600 uppercase tracking-wider font-medium">Ethical Scenarios</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="text-4xl font-bold text-primary-800 mb-2">2</div>
              <div className="text-sm text-slate-600 uppercase tracking-wider font-medium">UN SDG Goals</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="text-4xl font-bold text-primary-800 mb-2">∞</div>
              <div className="text-sm text-slate-600 uppercase tracking-wider font-medium">Learning Opportunities</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Mission Section */}
          <div className="mb-16">
            <div className="flex items-center mb-6">
              <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center mr-4">
                <span className="material-icons text-2xl text-primary-800">rocket_launch</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Our Mission</h2>
            </div>
            <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
              <p className="text-lg text-slate-700 mb-4 leading-relaxed">
                AI Ethical Compass was developed for the ISTE+ASCD AI Innovator Challenge 2025 with a clear mission: 
                to help high school students and educators develop critical thinking skills regarding the ethical, 
                responsible, and inclusive use of Artificial Intelligence.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                In a world where AI increasingly influences education and daily life, it's essential that young people 
                and educators learn to navigate complex ethical questions about how these technologies should be used.
              </p>
            </div>
          </div>

          {/* Challenge Themes */}
          <div className="mb-16">
            <div className="flex items-center mb-6">
              <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center mr-4">
                <span className="material-icons text-2xl text-primary-800">lightbulb</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Challenge Themes</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center mr-4">
                    <span className="material-icons text-2xl text-primary-800">diversity_3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Digital Inclusion</h3>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Our platform examines how AI tools can either promote or hinder digital inclusion in educational contexts. 
                  We explore issues of access, equity, language barriers, and how AI might bridge or widen existing digital divides.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center mr-4">
                    <span className="material-icons text-2xl text-primary-800">verified_user</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Responsible Digital Citizenship</h3>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Through our scenarios, users confront questions about responsible AI use, including transparency, 
                  disclosure, plagiarism concerns, privacy implications, and the development of ethical frameworks 
                  for emerging technologies.
                </p>
              </div>
            </div>
          </div>

          {/* SDG Goals */}
          <div className="mb-16">
            <div className="flex items-center mb-6">
              <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center mr-4">
                <span className="material-icons text-2xl text-primary-800">public</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">UN Sustainable Development Goals</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center mr-4">
                    <span className="material-icons text-2xl text-primary-800">school</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">SDG 4: Quality Education</h3>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Our platform supports SDG 4 by promoting critical analysis of how AI can enhance or detract from 
                  quality education. We examine ethical considerations that educators and students must navigate as 
                  AI becomes more prevalent in learning environments.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center mr-4">
                    <span className="material-icons text-2xl text-primary-800">diversity_3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">SDG 10: Reduced Inequalities</h3>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  We address SDG 10 by exploring how AI can either amplify or reduce inequalities. Our scenarios 
                  prompt users to consider algorithmic bias, accessibility considerations, and how AI design choices 
                  impact different populations.
                </p>
              </div>
            </div>
          </div>

          {/* Get Involved CTA */}
          <div className="bg-slate-50 rounded-xl p-12 border border-slate-200 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Get Involved</h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Join educators and students worldwide in exploring the ethical dimensions of AI in education. 
              Your perspective matters in shaping the future of responsible AI use.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <NavLink to="/scenarios/1">
                <Button size="lg" variant="outline" className="border-2 border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-primary-300 shadow-sm hover:shadow-md transition-all duration-300">
                  Start with Scenario 1
                  <span className="material-icons ml-2">arrow_forward</span>
                </Button>
              </NavLink>
              <NavLink to="/resources">
                <Button size="lg" variant="outline" className="border-2 border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-primary-300 shadow-sm hover:shadow-md transition-all duration-300">
                  Browse Resources
                  <span className="material-icons ml-2">menu_book</span>
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
