import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl">
          <span className="block">{t('home.title')}</span>
          <span className="block text-primary-600 mt-2">{t('home.subtitle')}</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-neutral-600">
          {t('home.description')}
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button 
            size="lg" 
            onClick={() => navigate("/scenarios")}
            className="text-white bg-blue-600 hover:bg-blue-700 font-bold border-2 border-blue-800 shadow-lg w-40 h-12"
            style={{ backgroundColor: "#1d4ed8" }}
          >
            {t('home.buttons.exploreScenarios')}
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => navigate("/about")}
            className="border-2 border-blue-300 w-40 h-12"
          >
            {t('home.buttons.learnMore')}
          </Button>
        </div>
      </div>
      
      <div className="mt-20">
        <h2 className="text-2xl font-bold text-neutral-900 text-center mb-12">
          {t('home.sdg.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center">
                <div className="bg-primary-100 p-3 rounded-full">
                  <span className="material-icons text-primary-600">school</span>
                </div>
                <h3 className="ml-4 text-xl font-medium text-neutral-900">{t('home.sdg.qualityEducation.title')}</h3>
              </div>
              <p className="mt-4 text-neutral-600">
                {t('home.sdg.qualityEducation.description')}
              </p>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center">
                <div className="bg-accent-100 p-3 rounded-full">
                  <span className="material-icons text-accent-600">diversity_3</span>
                </div>
                <h3 className="ml-4 text-xl font-medium text-neutral-900">{t('home.sdg.reducedInequalities.title')}</h3>
              </div>
              <p className="mt-4 text-neutral-600">
                {t('home.sdg.reducedInequalities.description')}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-20">
        <h2 className="text-2xl font-bold text-neutral-900 text-center mb-6">
          {t('home.howItWorks.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mx-auto bg-primary-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
              <span className="material-icons text-primary-600">visibility</span>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">{t('home.howItWorks.steps.identify.title')}</h3>
            <p className="text-neutral-600">
              {t('home.howItWorks.steps.identify.description')}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mx-auto bg-primary-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
              <span className="material-icons text-primary-600">psychology</span>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">{t('home.howItWorks.steps.evaluate.title')}</h3>
            <p className="text-neutral-600">
              {t('home.howItWorks.steps.evaluate.description')}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mx-auto bg-primary-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
              <span className="material-icons text-primary-600">comment</span>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">{t('home.howItWorks.steps.share.title')}</h3>
            <p className="text-neutral-600">
              {t('home.howItWorks.steps.share.description')}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mx-auto bg-primary-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
              <span className="material-icons text-primary-600">groups</span>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">{t('home.howItWorks.steps.explore.title')}</h3>
            <p className="text-neutral-600">
              {t('home.howItWorks.steps.explore.description')}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <Button 
          size="lg" 
          onClick={() => navigate("/scenarios")}
          className="text-white bg-blue-600 hover:bg-blue-700 font-bold border-2 border-blue-800 shadow-lg w-60 h-12"
          style={{ backgroundColor: "#1d4ed8" }}
        >
          {t('home.buttons.startExploring')}
        </Button>
      </div>
    </div>
  );
};

export default Home;
