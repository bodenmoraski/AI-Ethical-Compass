import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/LanguageSelector';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Language Selector */}
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      {/* Hero Section */}
      <div className="relative bg-slate-50 border-b border-slate-200" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              {t('about.title')}
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl">
              {t('about.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4" role="navigation" aria-label="Main navigation">
              <NavLink to="/scenarios/1">
                <Button size="lg" variant="outline" className="border-2 border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-primary-300 shadow-sm hover:shadow-md transition-all duration-300" aria-label={t('about.buttons.startExploring')}>
                  {t('about.buttons.startExploring')}
                  <span className="material-icons ml-2" aria-hidden="true">arrow_forward</span>
                </Button>
              </NavLink>
              <NavLink to="/resources">
                <Button size="lg" variant="outline" className="border-2 border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-primary-300 shadow-sm hover:shadow-md transition-all duration-300" aria-label={t('about.buttons.viewResources')}>
                  {t('about.buttons.viewResources')}
                  <span className="material-icons ml-2" aria-hidden="true">library_books</span>
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative bg-white border-b border-slate-200" role="region" aria-label="Key statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200" role="article">
              <div className="text-4xl font-bold text-primary-800 mb-2" aria-label="10 plus ethical scenarios">10+</div>
              <div className="text-sm text-slate-600 uppercase tracking-wider font-medium">{t('about.stats.scenarios')}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200" role="article">
              <div className="text-4xl font-bold text-primary-800 mb-2" aria-label="10 UN SDG goals">10</div>
              <div className="text-sm text-slate-600 uppercase tracking-wider font-medium">{t('about.stats.sdgGoals')}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200" role="article">
              <div className="text-4xl font-bold text-primary-800 mb-2" aria-label="Infinite learning opportunities">∞</div>
              <div className="text-sm text-slate-600 uppercase tracking-wider font-medium">{t('about.stats.learningOpportunities')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative bg-white" role="main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Mission Section */}
          <div className="mb-16" role="region" aria-label="Our mission">
            <div className="flex items-center mb-6">
              <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center mr-4" aria-hidden="true">
                <span className="material-icons text-2xl text-primary-800">rocket_launch</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">{t('about.mission.title')}</h2>
            </div>
            <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
              <p className="text-lg text-slate-700 mb-4 leading-relaxed">
                {t('about.mission.content')}
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                {t('about.mission.additional')}
              </p>
            </div>
          </div>

          {/* Challenge Themes */}
          <div className="mb-16" role="region" aria-label="Challenge themes">
            <div className="flex items-center mb-6">
              <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center mr-4" aria-hidden="true">
                <span className="material-icons text-2xl text-primary-800">lightbulb</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">{t('about.themes.title')}</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-8 border border-slate-200" role="article">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center mr-4" aria-hidden="true">
                    <span className="material-icons text-2xl text-primary-800">diversity_3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{t('about.themes.digitalInclusion.title')}</h3>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {t('about.themes.digitalInclusion.content')}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-8 border border-slate-200" role="article">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center mr-4" aria-hidden="true">
                    <span className="material-icons text-2xl text-primary-800">verified_user</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{t('about.themes.responsibleCitizenship.title')}</h3>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {t('about.themes.responsibleCitizenship.content')}
                </p>
              </div>
            </div>
          </div>

          {/* SDG Goals */}
          <div className="mb-16" role="region" aria-label="UN Sustainable Development Goals">
            <div className="flex items-center mb-6">
              <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center mr-4" aria-hidden="true">
                <span className="material-icons text-2xl text-primary-800">public</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">{t('about.sdg.title')}</h2>
            </div>
            <p className="text-lg text-slate-700 mb-8 leading-relaxed">
              {t('about.sdg.intro')}
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-8 border border-slate-200" role="article">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center mr-4" aria-hidden="true">
                    <span className="material-icons text-2xl text-primary-800">school</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{t('about.sdg.goals.sdg4.title')}</h3>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {t('about.sdg.goals.sdg4.content')}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-8 border border-slate-200" role="article">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center mr-4" aria-hidden="true">
                    <span className="material-icons text-2xl text-primary-800">diversity_3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{t('about.sdg.goals.sdg10.title')}</h3>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {t('about.sdg.goals.sdg10.content')}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-8 border border-slate-200" role="article">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center mr-4" aria-hidden="true">
                    <span className="material-icons text-2xl text-primary-800">precision_manufacturing</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{t('about.sdg.goals.sdg9.title')}</h3>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {t('about.sdg.goals.sdg9.content')}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-8 border border-slate-200" role="article">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center mr-4" aria-hidden="true">
                    <span className="material-icons text-2xl text-primary-800">gavel</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{t('about.sdg.goals.sdg16.title')}</h3>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {t('about.sdg.goals.sdg16.content')}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-8 border border-slate-200" role="article">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center mr-4" aria-hidden="true">
                    <span className="material-icons text-2xl text-primary-800">work</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{t('about.sdg.goals.sdg8.title')}</h3>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {t('about.sdg.goals.sdg8.content')}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-8 border border-slate-200" role="article">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center mr-4" aria-hidden="true">
                    <span className="material-icons text-2xl text-primary-800">favorite</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{t('about.sdg.goals.sdg3.title')}</h3>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {t('about.sdg.goals.sdg3.content')}
                </p>
              </div>
            </div>
          </div>

          {/* Get Involved CTA */}
          <div className="bg-slate-50 rounded-xl p-12 border border-slate-200 text-center" role="region" aria-label="Get involved">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('about.getInvolved.title')}</h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              {t('about.getInvolved.content')}
            </p>
            <div className="flex flex-wrap justify-center gap-4" role="navigation" aria-label="Get involved navigation">
              <NavLink to="/scenarios/1">
                <Button size="lg" variant="outline" className="border-2 border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-primary-300 shadow-sm hover:shadow-md transition-all duration-300" aria-label={t('about.buttons.startScenario')}>
                  {t('about.buttons.startScenario')}
                  <span className="material-icons ml-2" aria-hidden="true">arrow_forward</span>
                </Button>
              </NavLink>
              <NavLink to="/resources">
                <Button size="lg" variant="outline" className="border-2 border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-primary-300 shadow-sm hover:shadow-md transition-all duration-300" aria-label={t('about.buttons.browseResources')}>
                  {t('about.buttons.browseResources')}
                  <span className="material-icons ml-2" aria-hidden="true">menu_book</span>
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
