import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl">
          <span className="block">AI Ethical Compass</span>
          <span className="block text-primary-600 mt-2">Navigating the Future of AI in Education</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-neutral-600">
          Develop critical thinking skills about the ethical, responsible, and inclusive use of 
          Artificial Intelligence in educational contexts.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button 
            size="lg" 
            onClick={() => navigate("/scenarios")}
            className="text-white bg-blue-600 hover:bg-blue-700 font-bold border-2 border-blue-800 shadow-lg"
            style={{ backgroundColor: "#1d4ed8", padding: "10px 20px" }}
          >
            Explore Scenarios
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => navigate("/about")}
          >
            Learn More
          </Button>
        </div>
      </div>
      
      <div className="mt-20">
        <h2 className="text-2xl font-bold text-neutral-900 text-center mb-12">
          Connecting to United Nations Sustainable Development Goals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center">
                <div className="bg-primary-100 p-3 rounded-full">
                  <span className="material-icons text-primary-600">school</span>
                </div>
                <h3 className="ml-4 text-xl font-medium text-neutral-900">Quality Education (SDG 4)</h3>
              </div>
              <p className="mt-4 text-neutral-600">
                Our scenarios explore how AI can enhance or challenge quality education, 
                focusing on equity, accessibility, and the changing nature of learning in 
                the digital age.
              </p>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center">
                <div className="bg-accent-100 p-3 rounded-full">
                  <span className="material-icons text-accent-600">diversity_3</span>
                </div>
                <h3 className="ml-4 text-xl font-medium text-neutral-900">Reduced Inequalities (SDG 10)</h3>
              </div>
              <p className="mt-4 text-neutral-600">
                We examine how AI can either exacerbate or reduce inequalities in educational 
                settings, addressing issues of digital inclusion, algorithmic bias, and access to 
                technology.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-20">
        <h2 className="text-2xl font-bold text-neutral-900 text-center mb-6">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mx-auto bg-primary-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
              <span className="material-icons text-primary-600">visibility</span>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Identify</h3>
            <p className="text-neutral-600">
              Examine scenarios and identify if and how AI is being used
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mx-auto bg-primary-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
              <span className="material-icons text-primary-600">psychology</span>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Evaluate</h3>
            <p className="text-neutral-600">
              Consider the ethical implications, benefits, and risks
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mx-auto bg-primary-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
              <span className="material-icons text-primary-600">comment</span>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Share</h3>
            <p className="text-neutral-600">
              Contribute your perspective on the ethical dilemma
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mx-auto bg-primary-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
              <span className="material-icons text-primary-600">groups</span>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Explore</h3>
            <p className="text-neutral-600">
              View diverse perspectives from the community
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <Button 
          size="lg" 
          onClick={() => navigate("/scenarios")}
          className="text-white bg-blue-600 hover:bg-blue-700 font-bold border-2 border-blue-800 shadow-lg"
          style={{ backgroundColor: "#1d4ed8", padding: "10px 20px" }}
        >
          Start Exploring Scenarios
        </Button>
      </div>
    </div>
  );
};

export default Home;
