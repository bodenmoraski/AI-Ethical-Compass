import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/lib/auth";

interface PlatformStats {
  users: number;
  perspectives: number;
  scenarios_analyzed: number;
  countries: number;
}

interface DisplayStats {
  totalUsers: number;
  perspectivesShared: number;
  scenariosAnalyzed: number;
  countriesReached: number;
  shouldShow: boolean;
}

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<DisplayStats>({
    totalUsers: 0,
    perspectivesShared: 0,
    scenariosAnalyzed: 0,
    countriesReached: 0,
    shouldShow: false // Hidden for now
  });
  const [isLoading, setIsLoading] = useState(true);

  // Smart threshold algorithm - only show stats when they're impressive enough
  const calculateDisplayStats = (realStats: PlatformStats): DisplayStats => {
    const thresholds = {
      users: 100,        // Need at least 100 users to look established
      perspectives: 500, // Need at least 500 perspectives for vibrant community
      scenarios: 25,     // Need at least 25 scenarios for comprehensive coverage
      countries: 5       // Need at least 5 countries for true "global" reach
    };

    // Check if stats meet our "impressiveness" threshold
    const meetsThreshold = 
      realStats.users >= thresholds.users &&
      realStats.perspectives >= thresholds.perspectives &&
      realStats.scenarios_analyzed >= thresholds.scenarios &&
      realStats.countries >= thresholds.countries;

    console.log('📊 Stats Analysis:', {
      current: realStats,
      thresholds,
      meetsThreshold,
      gaps: {
        users: Math.max(0, thresholds.users - realStats.users),
        perspectives: Math.max(0, thresholds.perspectives - realStats.perspectives),
        scenarios: Math.max(0, thresholds.scenarios - realStats.scenarios_analyzed),
        countries: Math.max(0, thresholds.countries - realStats.countries)
      }
    });

    // For now, always return shouldShow: false to hide stats
    // But calculate what we would show when ready
    return {
      totalUsers: realStats.users,
      perspectivesShared: realStats.perspectives,
      scenariosAnalyzed: realStats.scenarios_analyzed,
      countriesReached: realStats.countries,
      shouldShow: false // Always hidden for now, but algorithm is ready
    };
  };

  // Fetch real stats from API and apply smart algorithm
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/platform?type=stats');
        const data = await response.json();
        
        if (data.success) {
          const displayStats = calculateDisplayStats(data.stats);
          setStats(displayStats);
          
          // Animation would happen here when stats are shown
          if (displayStats.shouldShow) {
            animateStats(displayStats);
          }
        } else {
          throw new Error('API response not successful');
        }
      } catch (error) {
        console.error('Error fetching platform stats:', error);
        // Even with fallback, keep stats hidden
        setStats(prev => ({ ...prev, shouldShow: false }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Animate stats (ready for when we want to show them)
  const animateStats = (finalStats: DisplayStats) => {
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setStats(prev => ({
        ...prev,
        totalUsers: Math.round(finalStats.totalUsers * easeOut),
        perspectivesShared: Math.round(finalStats.perspectivesShared * easeOut),
        scenariosAnalyzed: Math.round(finalStats.scenariosAnalyzed * easeOut),
        countriesReached: Math.round(finalStats.countriesReached * easeOut),
        shouldShow: true
      }));

      if (step >= steps) {
        clearInterval(interval);
      }
    }, stepTime);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center">
            <div className="flex justify-center mb-6">
              <Badge className="bg-blue-600 text-white px-4 py-2 text-sm font-medium">
                🏆 Featured Project - ISTE+ASCD AI Innovator Challenge 2025
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
          <span className="block">{t('home.title')}</span>
              <span className="block text-blue-700">
                {t('home.subtitle')}
              </span>
        </h1>
            
            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
              An interactive platform for developing critical thinking about AI ethics in education. 
              Real-world scenarios, teacher tools for classroom management, and community-driven discussions.
            </p>
            
            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/scenarios")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 text-lg"
              >
                {t('home.buttons.exploreScenarios')}
              </Button>
              <Button 
                size="lg" 
                onClick={() => navigate("/teacher")}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-8 py-4 text-lg"
              >
                Teacher Dashboard
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/about")}
                className="border-2 border-neutral-300 hover:border-neutral-500 text-neutral-700 hover:text-neutral-900 px-8 py-4 text-lg"
              >
                {t('home.buttons.learnMore')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
            {/* Live Stats Section - Only show when stats are impressive enough */}
      {!isLoading && stats.shouldShow && (
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Global Impact in Real-Time</h2>
              <p className="text-lg text-gray-600">Join our growing community of educators and students worldwide</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-2xl p-6">
                  <div className="text-3xl font-bold mb-2">{stats.totalUsers.toLocaleString()}</div>
                  <div className="text-blue-50 font-medium">Active Users</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-blue-700 text-white rounded-2xl p-6">
                  <div className="text-3xl font-bold mb-2">{stats.perspectivesShared.toLocaleString()}</div>
                  <div className="text-blue-50 font-medium">Perspectives Shared</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-blue-800 text-white rounded-2xl p-6">
                  <div className="text-3xl font-bold mb-2">{stats.scenariosAnalyzed.toLocaleString()}</div>
                  <div className="text-blue-50 font-medium">Scenarios Analyzed</div>
            </div>
          </div>
              <div className="text-center">
                <div className="bg-blue-900 text-white rounded-2xl p-6">
                  <div className="text-3xl font-bold mb-2">{stats.countriesReached}</div>
                  <div className="text-blue-50 font-medium">Countries Reached</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Advanced Features Section */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Educational AI Ethics Platform</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Student engagement tools with teacher dashboard for classroom management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI-Powered Analysis */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons text-white text-2xl">psychology</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Analysis</h3>
                <p className="text-gray-600 mb-4">
                  AI-powered perspective analysis including bias detection, 
                  quality scoring, and ethical framework identification.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">Bias Detection</Badge>
                  <Badge variant="secondary" className="text-xs">Quality Scoring</Badge>
                  <Badge variant="secondary" className="text-xs">Sentiment Analysis</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Intelligent Ranking */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons text-white text-2xl">trending_up</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible Discussion Sorting</h3>
                <p className="text-gray-600 mb-4">
                  Multiple ways to organize perspectives including by quality scores, 
                  engagement metrics, and recency for effective content discovery.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">Quality-Based</Badge>
                  <Badge variant="secondary" className="text-xs">Engagement Sorting</Badge>
                  <Badge variant="secondary" className="text-xs">Time-Based</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Gamification */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons text-white text-2xl">emoji_events</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Achievement System</h3>
                <p className="text-gray-600 mb-4">
                  Multi-tier achievements and leaderboards that reward thoughtful contribution 
                  over quantity, fostering meaningful engagement.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">Achievement System</Badge>
                  <Badge variant="secondary" className="text-xs">Leaderboards</Badge>
                  <Badge variant="secondary" className="text-xs">Reputation Scoring</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Community Features */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons text-white text-2xl">groups</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Community-Driven Content</h3>
                <p className="text-gray-600 mb-4">
                  User-generated scenarios with AI moderation, community voting, and collaborative 
                  perspective sharing create a dynamic learning environment.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">User Scenarios</Badge>
                  <Badge variant="secondary" className="text-xs">AI Moderation</Badge>
                  <Badge variant="secondary" className="text-xs">Community Voting</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Global Accessibility */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons text-white text-2xl">language</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Global Accessibility</h3>
                <p className="text-gray-600 mb-4">
                  Multi-language support (7 languages), accessibility controls, and inclusive design 
                  ensure equitable access to AI ethics education worldwide.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">7 Languages</Badge>
                  <Badge variant="secondary" className="text-xs">Accessibility</Badge>
                  <Badge variant="secondary" className="text-xs">Inclusive Design</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Teacher Dashboard */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-8">
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons text-white text-2xl">school</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Comprehensive Teacher Dashboard</h3>
                <p className="text-gray-600 mb-4">
                  Complete classroom management with real-time student analytics, assignment creation, 
                  gradebook integration, and live discussion monitoring with FERPA compliance.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">Class Management</Badge>
                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">Live Monitoring</Badge>
                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">FERPA Compliant</Badge>
                </div>
              </CardContent>
            </Card>

           
          </div>
        </div>
            </div>


      {/* How It Works - Enhanced */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A structured process that develops critical thinking through scenario analysis
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: "visibility",
                title: "Identify & Analyze",
                description: "Examine complex scenarios using AI-powered analysis tools and structured evaluation frameworks",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: "psychology",
                title: "Evaluate & Reason",
                description: "Apply ethical frameworks and consider multiple perspectives with guided critical thinking prompts",
                color: "from-indigo-500 to-indigo-600"
              },
              {
                icon: "comment",
                title: "Contribute & Share",
                description: "Submit thoughtful perspectives that undergo AI moderation and quality assessment",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: "groups",
                title: "Learn & Grow",
                description: "Explore ranked community insights, earn achievements, and track your ethical reasoning development",
                color: "from-green-500 to-green-600"
              }
            ].map((step, index) => (
              <Card key={index} className="relative group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className={`bg-gradient-to-br ${step.color} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="material-icons text-white text-3xl">{step.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  
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
      
      {/* Final CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Shape the Future of AI Ethics?
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Join educators and students worldwide in developing critical thinking about AI's role in education. 
            Your perspective matters in creating a more ethical, inclusive future.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
        <Button 
          size="lg" 
          onClick={() => navigate("/scenarios")}
              className="bg-white text-blue-600 hover:bg-gray-50 font-bold px-10 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <span className="material-icons mr-2">play_arrow</span>
              Start Learning
            </Button>
            <Button 
              size="lg" 
              onClick={() => navigate("/teacher")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-10 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <span className="material-icons mr-2">school</span>
              Teacher Portal
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/about")}
              className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-blue-600 font-bold px-10 py-4 text-lg transition-all duration-300"
            >
              <span className="material-icons mr-2">info</span>
              Learn More
        </Button>
          </div>

          {user && (
            <div className="mt-8 text-blue-100">
              <p className="text-lg">Welcome back! Continue your ethical AI journey.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
