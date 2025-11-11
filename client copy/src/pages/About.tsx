import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function About() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 text-sm font-medium">
                📖 Learn About Our Mission
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              <span className="block">Empowering Critical Thinking</span>
              <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                in AI Ethics Education
              </span>
            </h1>
            
            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
              {t('about.subtitle')}
            </p>
            
            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/scenarios")}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <span className="material-icons mr-2">explore</span>
                  {t('about.buttons.startExploring')}
                </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/tutorial/user")}
                className="border-2 border-emerald-300 hover:border-emerald-500 text-emerald-700 hover:text-emerald-800 font-bold px-8 py-4 text-lg transition-all duration-300"
              >
                <span className="material-icons mr-2">help</span>
                {t('navigation.userTutorial')}
                </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('about.mission.title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('about.subtitle')}
            </p>
          </div>
          
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-12">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6">
                    <span className="material-icons text-white text-3xl">rocket_launch</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                  <p className="text-lg text-gray-700 leading-relaxed mb-4">
                    {t('about.mission.content')}
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {t('about.mission.additional')}
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center mb-3">
                      <span className="material-icons text-blue-600 mr-3">school</span>
                      <h4 className="font-semibold text-gray-900">Educational Excellence</h4>
                    </div>
                    <p className="text-gray-600">Advanced pedagogical methods for AI ethics education</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center mb-3">
                      <span className="material-icons text-indigo-600 mr-3">psychology</span>
                      <h4 className="font-semibold text-gray-900">Critical Thinking</h4>
                    </div>
                    <p className="text-gray-600">Develop analytical skills for complex ethical scenarios</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center mb-3">
                      <span className="material-icons text-purple-600 mr-3">groups</span>
                      <h4 className="font-semibold text-gray-900">Global Community</h4>
            </div>
                    <p className="text-gray-600">Connect with learners and educators worldwide</p>
            </div>
            </div>
          </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Challenge Themes Section */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('about.themes.title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('about.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons text-white text-2xl">diversity_3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('about.themes.digitalInclusion.title')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('about.themes.digitalInclusion.content')}
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="bg-gradient-to-br from-purple-500 to-violet-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons text-white text-2xl">verified_user</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('about.themes.responsibleCitizenship.title')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('about.themes.responsibleCitizenship.content')}
                </p>
              </CardContent>
            </Card>
              </div>
            </div>
          </div>

      {/* SDG Goals Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('about.sdg.title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('about.sdg.intro')}
            </p>
                  </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* SDG 4 */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons text-white text-xl">school</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('about.sdg.goals.sdg4.title')}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t('about.sdg.goals.sdg4.content')}
                </p>
              </CardContent>
            </Card>

            {/* SDG 10 */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons text-white text-xl">diversity_3</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('about.sdg.goals.sdg10.title')}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t('about.sdg.goals.sdg10.content')}
                </p>
              </CardContent>
            </Card>

            {/* SDG 9 */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons text-white text-xl">precision_manufacturing</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('about.sdg.goals.sdg9.title')}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t('about.sdg.goals.sdg9.content')}
                </p>
              </CardContent>
            </Card>

            {/* SDG 16 */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons text-white text-xl">gavel</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('about.sdg.goals.sdg16.title')}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t('about.sdg.goals.sdg16.content')}
                </p>
              </CardContent>
            </Card>

            {/* SDG 8 */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="bg-gradient-to-br from-red-500 to-red-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons text-white text-xl">work</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('about.sdg.goals.sdg8.title')}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t('about.sdg.goals.sdg8.content')}
                </p>
              </CardContent>
            </Card>

            {/* SDG 3 */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons text-white text-xl">favorite</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('about.sdg.goals.sdg3.title')}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t('about.sdg.goals.sdg3.content')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Tutorial Links Section */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('navigation.tutorial')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('about.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons text-white text-3xl">person</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Student Guide</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Learn how to navigate scenarios, contribute perspectives, earn achievements, and track your learning progress.
                </p>
                <Button 
                  onClick={() => navigate("/tutorial/user")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span className="material-icons mr-2">school</span>
                  Student Tutorial
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons text-white text-3xl">person_4</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Teacher Guide</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Discover how to create classes, manage students, create assignments, and monitor real-time classroom activity.
                </p>
                <Button 
                  onClick={() => navigate("/tutorial/teacher")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span className="material-icons mr-2">group</span>
                  Teacher Tutorial
                </Button>
              </CardContent>
            </Card>
              </div>
            </div>
          </div>

          {/* Get Involved CTA */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardContent className="p-12 text-center">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-icons text-white text-3xl">rocket_launch</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('about.getInvolved.title')}</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('about.getInvolved.content')}
            </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/scenarios")}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <span className="material-icons mr-2">play_arrow</span>
                  {t('about.buttons.startScenario')}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate("/resources")}
                  className="border-2 border-indigo-300 hover:border-indigo-500 text-indigo-700 hover:text-indigo-800 font-bold px-8 py-4 text-lg transition-all duration-300"
                >
                  <span className="material-icons mr-2">menu_book</span>
                  {t('about.buttons.browseResources')}
                </Button>
            </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
