import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">About AI Ethical Compass</h1>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Our Mission</h2>
          <p className="text-neutral-700 mb-4">
            AI Ethical Compass was developed for the ISTE+ASCD AI Innovator Challenge 2025 with a clear mission: 
            to help high school students and educators develop critical thinking skills regarding the ethical, 
            responsible, and inclusive use of Artificial Intelligence.
          </p>
          <p className="text-neutral-700">
            In a world where AI increasingly influences education and daily life, it's essential that young people 
            and educators learn to navigate complex ethical questions about how these technologies should be used.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">The Challenge Themes</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-medium text-primary-800 mb-2">Digital Inclusion</h3>
            <p className="text-neutral-700">
              Our platform examines how AI tools can either promote or hinder digital inclusion in educational contexts. 
              We explore issues of access, equity, language barriers, and how AI might bridge or widen existing digital divides.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-medium text-primary-800 mb-2">Responsible Digital Citizenship</h3>
            <p className="text-neutral-700">
              Through our scenarios, users confront questions about responsible AI use, including transparency, 
              disclosure, plagiarism concerns, privacy implications, and the development of ethical frameworks 
              for emerging technologies.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">UN Sustainable Development Goals</h2>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className="material-icons text-primary-600 mr-2">school</span>
              <h3 className="text-xl font-medium text-primary-800">SDG 4: Quality Education</h3>
            </div>
            <p className="text-neutral-700">
              Our platform supports SDG 4 by promoting critical analysis of how AI can enhance or detract from 
              quality education. We examine ethical considerations that educators and students must navigate as 
              AI becomes more prevalent in learning environments.
            </p>
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <span className="material-icons text-accent-600 mr-2">diversity_3</span>
              <h3 className="text-xl font-medium text-accent-800">SDG 10: Reduced Inequalities</h3>
            </div>
            <p className="text-neutral-700">
              We address SDG 10 by exploring how AI can either amplify or reduce inequalities. Our scenarios 
              prompt users to consider algorithmic bias, accessibility considerations, and how AI design choices 
              impact different populations.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">How to Get Involved</h2>
          <p className="text-neutral-700 mb-4">
            We encourage educators to use AI Ethical Compass in their classrooms to facilitate discussions 
            about AI ethics. The platform can be used individually or in group settings to promote deeper 
            understanding of these important issues.
          </p>
          <p className="text-neutral-700">
            By participating in scenario evaluations and sharing perspectives, users contribute to a growing 
            body of thought about responsible AI use in education. These diverse viewpoints help build a more 
            nuanced understanding of complex ethical questions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;
