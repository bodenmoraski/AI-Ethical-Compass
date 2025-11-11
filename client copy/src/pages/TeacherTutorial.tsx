import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TeacherTutorial() {
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const teacherSteps = [
    {
      icon: "group_add",
      title: "Create Your First Class",
      description: "Set up classes to organize your students and manage their AI ethics learning journey.",
      details: [
        "Sign in and click your profile icon, then select 'Dashboard'",
        "Click 'Create Class' to start",
        "Enter class name, description, and grade level",
        "Generate a unique class code for student enrollment",
        "Customize class settings and privacy options"
      ],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: "person_add",
      title: "Enroll Students",
      description: "Add students to your classes and manage their profiles and participation.",
      details: [
        "Share the class code with your students",
        "Students join by entering the code during registration",
        "View and manage enrolled students in Class Details",
        "Track student engagement and participation",
        "Organize students into groups if needed"
      ],
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: "assignment",
      title: "Create Assignments",
      description: "Design engaging assignments with scenarios, rubrics, and assessment criteria.",
      details: [
        "Navigate to the Assignments tab in your class",
        "Click 'Create Assignment' to begin",
        "Select scenarios or create custom ethical dilemmas",
        "Set up rubrics and grading criteria",
        "Schedule assignment release and due dates"
      ],
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: "live_tv",
      title: "Monitor Real-Time Activity",
      description: "Use the Live Classroom Monitor to see student engagement and participation in real-time.",
      details: [
        "Access Live Classroom from the class menu",
        "View real-time student activity feeds",
        "Monitor discussion participation and quality",
        "Receive notifications for flagged content",
        "Intervene when necessary with moderation tools"
      ],
      color: "from-green-500 to-green-600"
    },
    {
      icon: "analytics",
      title: "Track Student Progress",
      description: "Use comprehensive analytics to monitor individual and class performance.",
      details: [
        "Review student engagement metrics",
        "Track assignment completion rates",
        "Analyze perspective quality scores",
        "Export progress reports for administration",
        "Identify students who need additional support"
      ],
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: "grade",
      title: "Grade & Provide Feedback",
      description: "Assess student work using AI-assisted grading and provide meaningful feedback.",
      details: [
        "Review submitted perspectives and assignments",
        "Use rubric-based grading for consistency",
        "Leverage AI quality scores for guidance",
        "Provide detailed written feedback",
        "Track grade distribution and trends"
      ],
      color: "from-pink-500 to-pink-600"
    }
  ];

  const teacherFeatures = [
    {
      icon: "dashboard",
      title: "Comprehensive Dashboard",
      description: "Get a complete overview of all your classes, students, and their progress in one place.",
      benefits: ["Class management", "Student overview", "Quick actions", "Recent activity"]
    },
    {
      icon: "smart_toy",
      title: "AI-Powered Insights",
      description: "Leverage artificial intelligence to get insights into student performance and content quality.",
      benefits: ["Automated quality scoring", "Bias detection", "Engagement analysis", "Progress predictions"]
    },
    {
      icon: "security",
      title: "FERPA Compliant",
      description: "All student data is handled with the highest security standards and educational privacy compliance.",
      benefits: ["Data encryption", "Privacy controls", "Audit trails", "Secure access"]
    },
    {
      icon: "export_notes",
      title: "Export & Integration",
      description: "Export data and integrate with your existing Learning Management Systems.",
      benefits: ["CSV/Excel export", "LMS compatibility", "Grade passback", "Progress reports"]
    }
  ];

  const classroomTips = [
    {
      icon: "psychology",
      title: "Fostering Critical Thinking",
      tips: [
        "Encourage students to consider multiple perspectives",
        "Ask open-ended questions about ethical implications",
        "Use real-world examples to make scenarios relatable",
        "Create safe spaces for controversial discussions"
      ]
    },
    {
      icon: "groups",
      title: "Managing Discussions",
      tips: [
        "Set clear guidelines for respectful discourse",
        "Monitor discussions using the live classroom feature",
        "Intervene when discussions become unproductive",
        "Highlight exemplary contributions to the class"
      ]
    },
    {
      icon: "assessment",
      title: "Effective Assessment",
      tips: [
        "Use rubrics to ensure consistent grading",
        "Focus on reasoning quality over length",
        "Provide specific, actionable feedback",
        "Consider peer assessment opportunities"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Back Button */}
      <div className="fixed top-24 left-6 z-50">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/about")}
          className="bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200/50 text-gray-600 hover:text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 rounded-full p-2"
        >
          <span className="material-icons">arrow_back</span>
        </Button>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 text-sm font-medium">
                👩‍🏫 Teacher Guide
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
              <span className="block">Teacher Dashboard</span>
              <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Complete Guide
              </span>
            </h1>
            
            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
              Master the Teacher Dashboard to create engaging AI ethics curricula, manage student progress, 
              and foster critical thinking in your classroom.
            </p>
            
            {/* Quick Start Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/teacher")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <span className="material-icons mr-2">dashboard</span>
                Access Teacher Dashboard
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/tutorial/user")}
                className="border-2 border-purple-300 hover:border-purple-500 text-purple-700 hover:text-purple-800 font-bold px-8 py-4 text-lg transition-all duration-300"
              >
                <span className="material-icons mr-2">school</span>
                Student Guide
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started Steps */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Getting Started</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow these steps to set up your classroom and start teaching AI ethics effectively
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teacherSteps.map((step, index) => (
              <Card key={index} className="relative group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className={`bg-gradient-to-br ${step.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="material-icons text-white text-2xl">{step.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{step.description}</p>
                  
                  <div className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-start">
                        <span className="material-icons text-gray-400 text-sm mr-2 mt-1">check_circle</span>
                        <span className="text-sm text-gray-600">{detail}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Step number */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-gray-100">
                    <span className="text-sm font-bold text-gray-600">{index + 1}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Teacher Features */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Teaching Tools</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced features designed to enhance your teaching effectiveness and student engagement
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teacherFeatures.map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start mb-6">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-14 h-14 rounded-xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300">
                      <span className="material-icons text-white text-xl">{feature.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center">
                        <span className="material-icons text-purple-600 text-sm mr-2">check_circle</span>
                        <span className="text-sm text-gray-600">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Classroom Management Tips */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Best Practices</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Proven strategies for effective AI ethics education in your classroom
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {classroomTips.map((section, index) => (
              <Card key={index} className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
                <CardContent className="p-8">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                    <span className="material-icons text-white text-2xl">{section.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h3>
                  <ul className="space-y-3">
                    {section.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start">
                        <span className="material-icons text-indigo-600 text-sm mr-2 mt-1">lightbulb</span>
                        <span className="text-sm text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Live Features Showcase */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Real-Time Classroom Management</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Monitor and manage your classroom with cutting-edge real-time features
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-8">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <span className="material-icons text-white text-2xl">live_tv</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Live Activity Feed</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="material-icons text-green-600 text-sm mr-2 mt-1">visibility</span>
                    See student submissions in real-time
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-green-600 text-sm mr-2 mt-1">notifications</span>
                    Get alerts for flagged content or issues
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-green-600 text-sm mr-2 mt-1">trending_up</span>
                    Monitor engagement and participation levels
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-green-600 text-sm mr-2 mt-1">chat</span>
                    Track discussion quality and tone
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-8">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <span className="material-icons text-white text-2xl">analytics</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Instant Analytics</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="material-icons text-blue-600 text-sm mr-2 mt-1">bar_chart</span>
                    Real-time engagement statistics
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-blue-600 text-sm mr-2 mt-1">speed</span>
                    Quality scores and progress tracking
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-blue-600 text-sm mr-2 mt-1">group</span>
                    Class participation overview
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-blue-600 text-sm mr-2 mt-1">timeline</span>
                    Historical performance trends
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Get Started CTA */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-12 text-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-icons text-white text-3xl">school</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Transform Your Classroom?</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Start using the Teacher Dashboard to create engaging AI ethics curricula and track student progress.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/teacher")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <span className="material-icons mr-2">dashboard</span>
                  Open Teacher Dashboard
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate("/contact")}
                  className="border-2 border-purple-300 hover:border-purple-500 text-purple-700 hover:text-purple-800 font-bold px-8 py-4 text-lg transition-all duration-300"
                >
                  <span className="material-icons mr-2">support</span>
                  Get Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 