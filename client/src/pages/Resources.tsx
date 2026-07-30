import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Filter, ExternalLink, BookOpen, School, Microscope, Code, Lightbulb, Shield, Globe, Users, TrendingUp, Mail, Plus, ChevronLeft, ChevronRight, X, Clock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ResourceRecommender from '@/components/ResourceRecommender';

// Type definitions
interface ResourceData {
  key: string;
  icon: any;
  categoryKey: string;
  tags: string[];
  difficulty: string;
  lastUpdated: string;
}

interface Resource extends ResourceData {
  title: string;
  description: string;
  category: string;
  link: string;
  relevanceScore?: number;
}

const Resources = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [suggestForm, setSuggestForm] = useState({
    title: "",
    url: "",
    description: "",
    category: "guidelines",
    tags: ""
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const resourcesPerPage = 12; // Show 12 resources per page (4 rows of 3)

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Enhanced categories with icons and descriptions
  const categories = [
    { key: "all", label: "All Resources", icon: Globe, count: 0, color: "bg-blue-100 text-blue-800" },
    { key: "guidelines", label: "Guidelines & Policies", icon: Shield, count: 0, color: "bg-green-100 text-green-800" },
    { key: "research", label: "Research & Studies", icon: Microscope, count: 0, color: "bg-purple-100 text-purple-800" },
    { key: "tools", label: "Tools & Platforms", icon: Code, count: 0, color: "bg-orange-100 text-orange-800" },
    { key: "courses", label: "Courses & Tutorials", icon: School, count: 0, color: "bg-indigo-100 text-indigo-800" },
    { key: "case-studies", label: "Case Studies", icon: BookOpen, count: 0, color: "bg-teal-100 text-teal-800" },
    { key: "frameworks", label: "Ethical Frameworks", icon: Lightbulb, count: 0, color: "bg-pink-100 text-pink-800" },
    { key: "communities", label: "Communities", icon: Users, count: 0, color: "bg-yellow-100 text-yellow-800" }
  ];

  // Enhanced resources data structure
  const resourcesData = [
    { 
      key: "unescoGuidelines", 
      icon: Shield, 
      categoryKey: "guidelines",
      tags: ["UNESCO", "Global", "Policy"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "ai4k12Guidelines", 
      icon: School, 
      categoryKey: "guidelines",
      tags: ["K-12", "Curriculum", "Standards"],
      difficulty: "Beginner",
      lastUpdated: "2023"
    },
    { 
      key: "isteResearch", 
      icon: Microscope, 
      categoryKey: "research",
      tags: ["ISTE", "Research", "Best Practices"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "elementsOfAiCourse", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Free", "Online Course", "Basics"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "aif360Toolkit", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Open Source", "Bias Detection", "IBM"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "algorithmicJusticeLeague", 
      icon: Shield, 
      categoryKey: "tools",
      tags: ["Bias", "Justice", "Advocacy"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "digitalEquity", 
      icon: Users, 
      categoryKey: "guidelines",
      tags: ["Equity", "Access", "Inclusion"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "euGuidelines", 
      icon: Shield, 
      categoryKey: "guidelines",
      tags: ["EU", "Policy", "Trustworthy AI"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "unescoPolicyGuidance", 
      icon: Shield, 
      categoryKey: "guidelines",
      tags: ["Policy", "Guidance", "Government", "Framework", "Risk Assessment"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "unescoGenerativeAI", 
      icon: Shield, 
      categoryKey: "guidelines",
      tags: ["Generative AI", "Policy", "Guidance", "Humanistic Values", "Regulation"],
      difficulty: "Advanced",
      lastUpdated: "2023"
    },
    { 
      key: "euAIAct", 
      icon: Shield, 
      categoryKey: "guidelines",
      tags: ["Regulation", "Legal Framework", "Risk-based", "Human Oversight", "Discrimination"],
      difficulty: "Advanced",
      lastUpdated: "2025"
    },
    { 
      key: "usEdToolkit", 
      icon: Shield, 
      categoryKey: "guidelines",
      tags: ["Federal Policy", "Toolkit", "Student Protection", "Privacy", "Equity"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "usEdOCR", 
      icon: Shield, 
      categoryKey: "guidelines",
      tags: ["Civil Rights", "Discrimination", "Privacy", "Monitoring", "Policy"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "ospiFramework", 
      icon: Lightbulb, 
      categoryKey: "frameworks",
      tags: ["Framework", "K-12", "Human-centered", "Bias Prevention", "Privacy"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "srebGuidance", 
      icon: Shield, 
      categoryKey: "guidelines",
      tags: ["K-12", "Guidance", "Policy", "Data Privacy", "AI Bias"],
      difficulty: "Intermediate",
      lastUpdated: "2025"
    },
    { 
      key: "csuEthicalFramework", 
      icon: Lightbulb, 
      categoryKey: "frameworks",
      tags: ["Higher Education", "Framework", "Ethics", "Transparency", "Human-centered"],
      difficulty: "Advanced",
      lastUpdated: "2025"
    },
    { 
      key: "buckinghamFramework", 
      icon: Lightbulb, 
      categoryKey: "frameworks",
      tags: ["Framework", "Ethical Decision-making", "Data Privacy", "Procurement", "Stakeholder Views"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "ibmEthics", 
      icon: Lightbulb, 
      categoryKey: "frameworks",
      tags: ["Principles", "Transparency", "Fairness", "Privacy", "Human Augmentation"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "mozillaTrustworthyAI", 
      icon: Lightbulb, 
      categoryKey: "frameworks",
      tags: ["Trustworthy AI", "Privacy", "Fairness", "Transparency", "Human Agency"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "effAIIssues", 
      icon: Lightbulb, 
      categoryKey: "frameworks",
      tags: ["Digital Rights", "Privacy", "Surveillance", "Bias", "Accountability"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "gousetiReview", 
      icon: Microscope, 
      categoryKey: "research",
      tags: ["Systematic Review", "K-12", "Data Privacy", "Algorithmic Bias", "Human Educators"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "martinReview", 
      icon: Microscope, 
      categoryKey: "research",
      tags: ["Systematic Review", "K-12", "Research Themes", "Equity", "Safety"],
      difficulty: "Advanced",
      lastUpdated: "2023"
    },
    { 
      key: "vashisthaStudy", 
      icon: Microscope, 
      categoryKey: "research",
      tags: ["Academic Paper", "Curriculum", "Data Privacy", "Algorithmic Bias", "Human Intelligence"],
      difficulty: "Advanced",
      lastUpdated: "2025"
    },
    { 
      key: "asefWhitePaper", 
      icon: Microscope, 
      categoryKey: "research",
      tags: ["White Paper", "Higher Education", "Ethical Aspects", "Human-centric", "Innovation"],
      difficulty: "Advanced",
      lastUpdated: "2025"
    },
    { 
      key: "algorithmAudit", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Bias Detection", "Open Source", "Privacy", "Algorithm Audit", "Fairness"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "sdsuAssessment", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Assessment Tool", "Rubric", "Environmental Impact", "Social Impact", "Ethical Evaluation"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "magicSchoolAI", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Educational Platform", "Personalized Learning", "Teacher Adoption", "AI Literacy", "Case Studies"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "anthropicClaude", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["AI Platform", "Academic Integrity", "Privacy", "Critical Thinking", "Generative AI"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "curriculumAssociates", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Voice AI", "Privacy-by-design", "Equitable Representation", "Co-creation", "Literacy"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "floeProject", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Open AI", "Transparency", "Bias Mitigation", "Equitable Access", "Open-source"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "aiEthicsLabyrinth", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Game", "Interactive", "Digital Citizenship", "Ethical Dilemmas", "K-12"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "techBetterGames", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Workshop", "Role-playing Game", "AI Governance", "Active Learning", "Ethical Training"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "hyperspace", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Simulation", "Ethical Decision-making", "Training", "Personalized Learning", "Real-time Feedback"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "mitCurriculum", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Curriculum", "Middle School", "Open Source", "Algorithmic Bias", "Ethical Reasoning"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "googleLessonPlan", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Lesson Plan", "K-12", "Responsible AI", "Bias", "Privacy"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "codeOrg", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Curriculum", "K-12", "AI Ethics", "Societal Impact", "Generative AI"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "flintCourse", 
      icon: School, 
      categoryKey: "courses",
      tags: ["AI Literacy", "K-12", "Free Course", "AI Bias", "Privacy"],
      difficulty: "Beginner",
      lastUpdated: "2025"
    },
    { 
      key: "microsoftLearn", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Teacher Training", "Professional Development", "Generative AI", "Prompt Engineering", "Responsible AI"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "minnesotaWorkshop", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Faculty Development", "Workshop", "Generative AI", "AI Literacy", "Equitable Teaching"],
      difficulty: "Intermediate",
      lastUpdated: "2025"
    },
    { 
      key: "neaWebinars", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Webinar", "Teacher Training", "Ethics", "Equity", "Digital Citizenship"],
      difficulty: "Beginner",
      lastUpdated: "2025"
    },
    { 
      key: "asuCourse", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Teacher Training", "K-12", "Ethical AI Use", "Student Engagement", "Parent Communication"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "cambridgeMasters", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Master's Program", "Higher Education", "AI Ethics", "Algorithmic Bias", "Responsible Innovation"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "baylorSeries", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Online Course", "Professional Development", "Industry-specific", "Transparency", "Privacy"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "magicSchoolCaseStudies", 
      icon: BookOpen, 
      categoryKey: "case-studies",
      tags: ["Implementation Story", "Personalized Learning", "Teacher Adoption", "AI Literacy", "K-12"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "mississippiCaseStudy", 
      icon: BookOpen, 
      categoryKey: "case-studies",
      tags: ["Generative AI", "Academic Integrity", "Higher Education", "Pedagogical Strategies", "Critical Engagement"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "caribouReport", 
      icon: BookOpen, 
      categoryKey: "case-studies",
      tags: ["Global Perspective", "Developing Regions", "Responsible AI", "Community Engagement", "Equitable Development"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "olcRubric", 
      icon: Code, 
      categoryKey: "assessment",
      tags: ["Rubric", "Student Assessment", "AI Collaboration", "Information Literacy", "Academic Integrity"],
      difficulty: "Intermediate",
      lastUpdated: "2025"
    },
    { 
      key: "remcRubric", 
      icon: Code, 
      categoryKey: "assessment",
      tags: ["Rubric Generation", "Generative AI", "Assessment", "Fairness", "Student Involvement"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "flintAssessment", 
      icon: Code, 
      categoryKey: "assessment",
      tags: ["Assessment", "AI Literacy", "K-12", "Certification", "Ethical AI"],
      difficulty: "Beginner",
      lastUpdated: "2025"
    },
    { 
      key: "aimAhead", 
      icon: Users, 
      categoryKey: "communities",
      tags: ["Discussion Group", "Ethics Experts", "Healthcare AI", "Online Community", "Peer Learning"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "learntoquestion", 
      icon: Users, 
      categoryKey: "communities",
      tags: ["Online Forum", "Student Perspectives", "Educator Perspectives", "Critical Thinking", "AI Literacy"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "edWeb", 
      icon: Users, 
      categoryKey: "communities",
      tags: ["Online Community", "Networking", "Webinars", "Policy-making", "Ethical Decision-making"],
      difficulty: "Beginner",
      lastUpdated: "2025"
    },
    { 
      key: "iste", 
      icon: Users, 
      categoryKey: "communities",
      tags: ["Professional Organization", "Teacher Network", "Professional Learning", "Digital Citizenship", "Collaboration"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "aera", 
      icon: Users, 
      categoryKey: "communities",
      tags: ["Professional Association", "Research", "Ethical Framework", "Interdisciplinary", "Human Research"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "cesConsulting", 
      icon: Users, 
      categoryKey: "communities",
      tags: ["Consulting", "Professional Development", "Policy Development", "Equity", "Bias"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "aiGuardianPolicy", 
      icon: Shield, 
      categoryKey: "guidelines",
      tags: ["Policy Template", "Ethics", "Governance", "Transparency", "Accountability"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "merlynRoadmap", 
      icon: Shield, 
      categoryKey: "guidelines",
      tags: ["District Policy", "Roadmap", "Data Privacy", "Procurement", "Governance"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "egenPolicy", 
      icon: Shield, 
      categoryKey: "guidelines",
      tags: ["Policy", "Ethics", "Human Rights", "Transparency", "Sustainability"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "learningAnalyticsReview", 
      icon: Microscope, 
      categoryKey: "research",
      tags: ["Systematic Review", "Learning Analytics", "Blended Learning", "Ethics", "Data Protection"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "teacherAIDilemmas", 
      icon: Microscope, 
      categoryKey: "research",
      tags: ["Empirical Study", "Ethical Dilemmas", "Teacher-AI Interaction", "Decision-making", "Human Values"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "insight7", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Bias Detection", "AI Tool", "Qualitative Data", "Sentiment Analysis", "Research Integrity"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "squirrelAI", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Adaptive Learning", "Personalized Learning", "AI Platform", "K-12", "Tutoring"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "contentTechnologies", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Content Creation", "AI Tool", "Textbooks", "Learning Materials", "Automation"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "knewton", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Adaptive Learning", "Personalized Learning", "AI Platform", "Student Data", "Recommendations"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "cognii", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Interactive Learning", "Virtual Tutor", "AI Tool", "Student Engagement", "Feedback"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "jillWatson", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Chatbot", "Virtual Assistant", "Teacher Support", "Administrative Tasks", "Feedback"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "aiDungeon", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Generative AI", "Interactive Learning", "Storytelling", "Problem-solving", "AI Game"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "workBot", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["AI Platform", "Productivity", "Collaboration", "Data Management", "Privacy"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "quickRubric", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Rubric Creation", "Assessment Tool", "Teacher Productivity", "Feedback", "Self-assessment"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "khanmigo", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["AI Assistant", "Teacher Tool", "Lesson Planning", "Rubric Creation", "Productivity"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "goblinTools", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Student Tool", "Productivity", "Writing Assistance", "Communication Skills", "Critical Thinking"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "perplexityAI", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Research Tool", "AI Search", "Information Gathering", "Fact-checking", "Student Support"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "quizlet", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Study Tool", "Flashcards", "AI-powered", "Student Learning", "Test Preparation"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "shovel", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Time Management", "AI Planner", "Student Productivity", "Organization", "Scheduling"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "focusmate", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Time Management", "Productivity", "Focus", "Study Aid", "Virtual Co-working"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "adobeExpress", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Content Creation", "Generative AI", "K-12", "Digital Media", "Safety Features"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "descript", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Video Editing", "Audio Editing", "Transcription", "Media Literacy", "Creative Expression"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "qusoAI", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Digital Media", "Content Refinement", "Image Editing", "Video Editing", "Student Projects"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "remini", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Video Editing", "Digital Media", "Content Enhancement", "Student Projects", "Media Production"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "adventureAI", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["AI Game", "Kids Learning", "Interactive", "AI Literacy", "Elementary Education"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "schoolAI", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["AI Platform", "Teacher Oversight", "Student Monitoring", "Real-time Insights", "K-12"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "snorkl", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["AI Feedback", "Student Engagement", "Verbal Explanation", "Visual Explanation", "Personalized Learning"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "deckToys", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Interactive Lessons", "Gamification", "Lesson Design", "Student Engagement", "Learning Pathways"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "readWrite", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Assistive Technology", "Reading Support", "Writing Support", "Accessibility", "Chrome Extension"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "weVideo", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Video Editing", "Collaborative Tool", "Cloud-based", "Student Projects", "Digital Media"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "dews", 
      icon: Code, 
      categoryKey: "tools",
      tags: ["Predictive Analytics", "Student Support", "Risk Assessment", "Early Warning System", "K-12"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "ai101Teachers", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Teacher Training", "AI Literacy", "Responsible AI", "LLM", "Professional Development"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "preparingToTeachAI", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Teacher Training", "Self-paced", "Generative AI", "Machine Learning", "Professional Development"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "aiForEducators", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Teacher Training", "AI Fundamentals", "Responsible AI", "Online Course", "Educator Skills"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "essentialGuideAI", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Teacher Training", "ChatGPT", "Prompt Engineering", "Ethical Implications", "Student Introduction"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "aiEducationTeachers", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Teacher Training", "AI Ethics", "Bias Awareness", "Design Thinking", "Computational Thinking"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "chatgptFoundations", 
      icon: School, 
      categoryKey: "courses",
      tags: ["ChatGPT", "Teacher Training", "Productivity", "Media Assets", "Responsible Use"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "creativeCriticalAI", 
      icon: School, 
      categoryKey: "courses",
      tags: ["AI Pedagogy", "Generative AI", "Teacher Resources", "AI Literacy", "Critical Engagement"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "empowerEducators", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Teacher Training", "Generative AI", "Microsoft AI", "AI Tools", "Accessibility"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "generativeAIEducators", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Generative AI", "Teacher Training", "Personalized Instruction", "Lesson Enhancement", "Google AI"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "aiFoundationsEducators", 
      icon: School, 
      categoryKey: "courses",
      tags: ["AI Fundamentals", "Responsible AI", "Generative AI Impact", "Teacher Training", "Free Course"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "artificialIntelligenceLessons", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Lesson Plans", "AI Literacy", "Chatbots", "Educational Games", "K-12"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "aiForEducatorsMicrosoft", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Teacher Training", "Microsoft Education", "AI Tools", "Copilot", "Professional Development"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "artificialIntelligenceIBM", 
      icon: School, 
      categoryKey: "courses",
      tags: ["IBM Resources", "Student Resources", "Teacher Resources", "AI Curriculum", "Chatbots"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "introToAI", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Project-based Learning", "AI Fundamentals", "High School", "Curriculum", "Student Learning"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "ai4AllResources", 
      icon: School, 
      categoryKey: "courses",
      tags: ["High School", "Curriculum", "Career Skills", "AI Ethics", "Deepfakes"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "aiForEveryone", 
      icon: School, 
      categoryKey: "courses",
      tags: ["AI Overview", "Beginner Course", "Societal Impact", "Business Applications", "Coursera"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "aiFoundationsEveryone", 
      icon: School, 
      categoryKey: "courses",
      tags: ["AI Fundamentals", "Generative AI", "Prompt Engineering", "Chatbots", "Coursera"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "elementsOfAI", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Online Course", "AI Theory", "Practical Exercises", "Free Resource", "AI Building"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "googleAIAnyone", 
      icon: School, 
      categoryKey: "courses",
      tags: ["AI Fundamentals", "Ethics", "Fairness", "Applications", "edX"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "introductionToAI", 
      icon: School, 
      categoryKey: "courses",
      tags: ["AI Concepts", "Applications", "Business Transformation", "Ethical Considerations", "Coursera"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "aiInTheWorld", 
      icon: School, 
      categoryKey: "courses",
      tags: ["K-12", "AI Awareness", "Everyday AI", "Curriculum", "Student Learning"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "applicationsOfAI", 
      icon: School, 
      categoryKey: "courses",
      tags: ["AI Applications", "Problem-solving", "Interdisciplinary", "Student Engagement", "Curriculum"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "proceduralProgrammingAI", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Programming", "AI Skills", "Career Readiness", "Computer Science", "Curriculum"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "machineLearningAI", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Machine Learning", "AI Skills", "Career Readiness", "Advanced Topics", "Curriculum"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "aiEthicsNavigating", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Professional Development", "AI Ethics", "Industry-specific", "Online Course", "Ethical Leadership"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "aiMathematicsClassroom", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Workshop", "Mathematics Education", "Equity", "Algorithmic Bias", "Higher Education"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "aiEnglishClassroom", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Workshop", "English Education", "Equity", "Algorithmic Bias", "Higher Education"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "aiHigherEducation", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Webinar", "Student Experience", "Higher Education", "AI Policy", "Career Preparation"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "buildingAILiteracy", 
      icon: School, 
      categoryKey: "courses",
      tags: ["AI Literacy", "Generative AI", "Student Learning", "Human-centered AI", "Workshop"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "artificialIntelligenceCollective", 
      icon: School, 
      categoryKey: "courses",
      tags: ["AI Ethics", "Discrimination", "Societal Impact", "Critical Thinking", "Higher Education"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "aiPoweredK12", 
      icon: School, 
      categoryKey: "courses",
      tags: ["K-12", "Teacher Training", "Ethical AI", "Personalized Learning", "Assessment"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "aiEthicsBusiness", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Business Ethics", "Data Ethics", "Regulatory Compliance", "Governance", "Generative AI"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "aiEthicsResponsible", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Data Ethics", "Generative AI", "Legal Risk", "Business Ethics", "Sustainability"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "dataEthicsAI", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Data Ethics", "Data Security", "Responsible Innovation", "Machine Learning", "Governance"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "responsibleGenerativeAI", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Generative AI", "Governance", "Data Management", "Compliance", "Business Risk"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "aiEmpathyEthics", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Data Ethics", "Empathy", "Neural Networks", "Machine Learning", "Policy Development"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "introductionResponsibleAI", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Responsible AI", "Data Ethics", "Accountability", "Business Ethics", "Governance"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "generativeAIPrompt", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Prompt Engineering", "ChatGPT", "Generative AI", "Large Language Modeling", "Image Analysis"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "aiClassroomEthical", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Lesson Plan", "AI Ethics", "Responsible AI", "Media Literacy", "High School"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "aiUnlocked", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Lesson Plan", "AI Tools", "Evaluation", "Critical Thinking", "Media Literacy"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "ultimateAIUnit", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Curriculum Unit", "AI Ethics", "Bias", "Classroom Activities", "K-12"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "ethicsAIUnit", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Curriculum Unit", "AI Ethics", "Worksheets", "Projects", "Middle School", "High School"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "aiEthicalConcerns", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Worksheet", "Robotics Ethics", "Discussion", "Critical Thinking", "High School"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "aiWritingEthics", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Lesson Bundle", "Writing Ethics", "Generative AI", "Academic Honesty", "High School"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "aiClassroomToolkit", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Toolkit", "Classroom Resources", "Responsible AI", "Student Discussion", "K-12"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "minecraftAIFoundations", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Minecraft", "AI Literacy", "Responsible AI", "Student Learning", "Game-based Learning"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "teachAIGuidance", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Guidance", "AI Policy", "Risk Mitigation", "Community Engagement", "School Leadership"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "microsoftEducationAIToolkit", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Toolkit", "Educational Leaders", "Generative AI", "Strategy", "Implementation"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "microsoftLearnEducators", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Teacher Training", "Professional Development", "AI Skills", "Faculty Support", "Bootcamp"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "transformingTeacherPreparation", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Teacher Preparation", "ISTE", "ASCD", "Microsoft", "Ethical Integration"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "farmBeatsStudents", 
      icon: School, 
      categoryKey: "courses",
      tags: ["STEM Program", "Precision Agriculture", "Data Science", "Sustainability", "Real-world Applications"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "imagineCupJunior", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Student Learning", "AI Fundamentals", "Cloud Computing", "Youth Education", "Introduction to AI"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "microsoftAzureAIFundamentals", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Azure AI", "AI Fundamentals", "Technical Training", "Cloud Services", "AI Solutions"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "prepareTeachAI900", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Teacher Training", "Azure AI", "Academic Programs", "Curriculum Delivery", "Professional Development"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "developGenerativeAI", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Generative AI", "Azure OpenAI", "AI Development", "Model Deployment", "Technical Skills"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "generativeAIEducatorsTeachers", 
      icon: School, 
      categoryKey: "courses",
      tags: ["Generative AI", "Teacher Training", "Free Course", "Lesson Planning", "Ethical AI"],
      difficulty: "Beginner",
      lastUpdated: "2024"
    },
    { 
      key: "socapLocalLingua", 
      icon: BookOpen, 
      categoryKey: "case-studies",
      tags: ["Case Study", "AI Ethics", "Ed-tech", "Investment", "Due Diligence"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "philTechGenAI", 
      icon: BookOpen, 
      categoryKey: "case-studies",
      tags: ["Case Study", "Generative AI", "Non-profit", "Risk Management", "AI Adoption"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "aLevelExamControversy", 
      icon: BookOpen, 
      categoryKey: "case-studies",
      tags: ["Algorithmic Bias", "Case Study", "Assessment", "Ethical Safeguards", "UK Education"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "dewsWisconsin", 
      icon: BookOpen, 
      categoryKey: "case-studies",
      tags: ["Case Study", "Predictive Analytics", "Student Support", "Risk Identification", "K-12"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "prathamHybridLearning", 
      icon: BookOpen, 
      categoryKey: "case-studies",
      tags: ["Case Study", "Hybrid Learning", "Rural Education", "Equity", "Global Perspective"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "digitalPromiseAILiteracy", 
      icon: Lightbulb, 
      categoryKey: "frameworks",
      tags: ["Framework", "AI Literacy", "Digital Citizenship", "Critical Thinking", "Responsible AI"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "hurixDigitalFramework", 
      icon: Lightbulb, 
      categoryKey: "frameworks",
      tags: ["Framework", "Risk Assessment", "Ethical Implementation", "K-12", "Policy Development"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "isteStandards", 
      icon: Lightbulb, 
      categoryKey: "frameworks",
      tags: ["Standards", "Teacher Training", "Digital Citizenship", "Data Privacy", "Ethical Technology"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "belmontReport", 
      icon: Lightbulb, 
      categoryKey: "frameworks",
      tags: ["Principles", "Ethics Foundation", "Consent", "Bias Mitigation", "Fairness"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "acsaPrinciples", 
      icon: Lightbulb, 
      categoryKey: "frameworks",
      tags: ["Framework", "Fairness", "Privacy", "Transparency", "Accountability"],
      difficulty: "Intermediate",
      lastUpdated: "2024"
    },
    { 
      key: "abetAccreditation", 
      icon: Lightbulb, 
      categoryKey: "frameworks",
      tags: ["Accreditation", "Standards", "Computer Science", "Professional Ethics", "Higher Education"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "aeraCode", 
      icon: Lightbulb, 
      categoryKey: "frameworks",
      tags: ["Code of Ethics", "Research Ethics", "Professional Standards", "Education Research", "Guidance"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "singaporeMOE", 
      icon: Lightbulb, 
      categoryKey: "frameworks",
      tags: ["National Framework", "AI Governance", "Ethics Principles", "K-12", "Teacher Professionalism"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    },
    { 
      key: "ethicalPerspectivesAI", 
      icon: Lightbulb, 
      categoryKey: "frameworks",
      tags: ["Ethical Perspectives", "Decision-making", "Virtue Ethics", "Deontological Ethics", "Care Ethics"],
      difficulty: "Advanced",
      lastUpdated: "2024"
    }
  ];

  const resources: Resource[] = useMemo(() => resourcesData.map(res => ({
    ...res,
    title: t(`resources.items.${res.key}.title`),
    description: t(`resources.items.${res.key}.description`),
    category: t(`resources.categories.${res.categoryKey}`),
    link: t(`resources.items.${res.key}.link`)
  })), [t]);

  // Enhanced search with relevance scoring
  const searchResults: Resource[] = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return resources;
    }

    const query = debouncedSearchQuery.toLowerCase();
    const queryWords = query.split(' ').filter(word => word.length > 0);

    return resources
      .filter(resource => {
        const matchesCategory = selectedCategory === "all" || resource.categoryKey === selectedCategory;
        if (!matchesCategory) return false;

        // Check if any query word matches
        return queryWords.some(word => 
          resource.title.toLowerCase().includes(word) ||
          resource.description.toLowerCase().includes(word) ||
          resource.tags.some(tag => tag.toLowerCase().includes(word)) ||
          resource.category.toLowerCase().includes(word) ||
          resource.difficulty.toLowerCase().includes(word)
        );
      })
      .map(resource => {
        // Calculate relevance score
        let score = 0;
        const titleLower = resource.title.toLowerCase();
        const descLower = resource.description.toLowerCase();
        const tagsLower = resource.tags.map(tag => tag.toLowerCase());
        const categoryLower = resource.category.toLowerCase();

        queryWords.forEach(word => {
          // Title matches get highest score
          if (titleLower.includes(word)) {
            score += 10;
            // Exact title match gets bonus
            if (titleLower === word) score += 5;
          }
          
          // Tag matches get high score
          if (tagsLower.some(tag => tag.includes(word))) {
            score += 8;
            // Exact tag match gets bonus
            if (tagsLower.some(tag => tag === word)) score += 3;
          }
          
          // Description matches get medium score
          if (descLower.includes(word)) {
            score += 3;
          }
          
          // Category matches get low score
          if (categoryLower.includes(word)) {
            score += 2;
          }
        });

        return { ...resource, relevanceScore: score };
      })
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  }, [resources, debouncedSearchQuery, selectedCategory]);

  // Sort resources
  const sortedResources: Resource[] = useMemo(() => {
    const resourcesToSort = debouncedSearchQuery ? searchResults : resources.filter(resource => 
      selectedCategory === "all" || resource.categoryKey === selectedCategory
    );

    return [...resourcesToSort].sort((a, b) => {
      switch (sortBy) {
        case "relevance":
          // If there's a search query, use relevance score, otherwise keep original order
          if (debouncedSearchQuery && a.relevanceScore !== undefined && b.relevanceScore !== undefined) {
            return (b.relevanceScore || 0) - (a.relevanceScore || 0);
          }
          return 0;
        case "newest":
          return parseInt(b.lastUpdated) - parseInt(a.lastUpdated);
        case "difficulty":
          const difficultyOrder: Record<string, number> = { "Beginner": 1, "Intermediate": 2, "Advanced": 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        default:
          return 0;
      }
    });
  }, [searchResults, resources, debouncedSearchQuery, selectedCategory, sortBy]);

  // Search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];

    const query = searchQuery.toLowerCase();
    const suggestions = new Set<string>();

    // Get suggestions from titles, tags, and categories
    resources.forEach(resource => {
      // Title suggestions
      const titleWords = resource.title.toLowerCase().split(' ');
      titleWords.forEach(word => {
        if (word.startsWith(query) && word.length > 2) {
          suggestions.add(word);
        }
      });

      // Tag suggestions
      resource.tags.forEach(tag => {
        const tagLower = tag.toLowerCase();
        if (tagLower.includes(query) && tagLower.length > 2) {
          suggestions.add(tag);
        }
      });

      // Category suggestions
      const categoryLower = resource.category.toLowerCase();
      if (categoryLower.includes(query)) {
        suggestions.add(resource.category);
      }
    });

    return Array.from(suggestions).slice(0, 8);
  }, [searchQuery, resources]);

  // Highlight search terms in text
  const highlightText = useCallback((text: string, query: string) => {
    if (!query.trim()) return text;

    // Escape HTML first so resource titles/descriptions cannot inject markup
    // through dangerouslySetInnerHTML, then wrap matches in <mark>.
    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const queryWords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .map(escapeRegExp);

    let highlightedText = escapeHtml(text);

    queryWords.forEach((word) => {
      const regex = new RegExp(`(${word})`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        '<mark class="bg-yellow-200 rounded">$1</mark>'
      );
    });

    return highlightedText;
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(sortedResources.length / resourcesPerPage);
  const startIndex = (currentPage - 1) * resourcesPerPage;
  const endIndex = startIndex + resourcesPerPage;
  const currentResources = sortedResources.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setShowSearchSuggestions(query.length >= 2);
    setCurrentPage(1);
  };

  const handleSearchSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSearchSuggestions(false);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSearchSuggestions(false);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handleSuggestResource = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create email content
    const subject = "AI Ethical Compass - Resource Suggestion";
    const body = `Hi AI Ethical Compass Team,

I'd like to suggest the following resource for your platform:

Title: ${suggestForm.title}
URL: ${suggestForm.url}
Description: ${suggestForm.description}
Category: ${suggestForm.category}
Tags: ${suggestForm.tags}

Thank you for considering this resource!

Best regards,
[Your name]`;

    // Open email client
    const mailtoLink = `mailto:bodenmoraski@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
    
    // Reset form and close modal
    setSuggestForm({
      title: "",
      url: "",
      description: "",
      category: "guidelines",
      tags: ""
    });
    setShowSuggestModal(false);
  };

  const handleContactUs = () => {
    navigate('/contact');
  };

  const handleRecommenderFilters = (filters: { category?: string; difficulty?: string; tags?: string[] }) => {
    if (filters.category) {
      handleCategoryChange(filters.category);
    }
    // Since this page doesn't have difficulty/tag filtering UI yet, 
    // we could add a search for the tags to help users find relevant resources
    if (filters.tags && filters.tags.length > 0) {
      // Use the first tag as a search query to help find related resources
      const searchTerm = filters.tags[0];
      setSearchQuery(searchTerm);
      setCurrentPage(1);
    }
  };

  // Inline autocomplete suggestion (top suggestion that starts with the input)
  const inlineSuggestion = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 1) return "";
    const query = searchQuery.toLowerCase();
    // Find the first suggestion that starts with the query and is not exactly the query
    return searchSuggestions.find(s => s.toLowerCase().startsWith(query) && s.toLowerCase() !== query) || "";
  }, [searchQuery, searchSuggestions]);

  // Handle Tab to autocomplete
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" && inlineSuggestion) {
      e.preventDefault();
      setSearchQuery(inlineSuggestion);
      setShowSearchSuggestions(false);
    }
  };

  // In a useEffect, update the --input-measure-width CSS variable on input change
  useEffect(() => {
    const span = document.getElementById('input-measure-span');
    if (span) {
      const width = span.offsetWidth;
      span.parentElement?.style.setProperty('--input-measure-width', `${width}px`);
    }
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-visible min-h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-4">
              <span className="block">Educational</span>
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Resources
              </span>
            </h1>
            
            <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
              Discover curated resources from leading organizations, researchers, and educators worldwide. 
              From policy guidelines to practical tools, find everything you need to implement ethical AI in education.
            </p>
            
            {/* Search Bar */}
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search resources, topics, or organizations..."
                  value={searchQuery}
                  onChange={e => handleSearchChange(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-10 pr-12 py-3 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 w-full bg-transparent font-mono"
                  autoComplete="off"
                  spellCheck={false}
                  style={{ position: 'relative', zIndex: 2 }}
                />
                {/* Hidden span to measure input width */}
                <span
                  id="input-measure-span"
                  className="invisible absolute left-10 top-1/2 -translate-y-1/2 whitespace-pre font-mono text-lg"
                  style={{ pointerEvents: 'none', zIndex: 1 }}
                >
                  {searchQuery}
                </span>
                {/* Inline suggestion ghost text */}
                {inlineSuggestion && (
                  <span
                    className="absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none select-none text-lg font-mono ml-0.5"
                    style={{
                      left: `calc(2.5rem + var(--input-measure-width, 0px))`,
                      zIndex: 1,
                    }}
                  >
                    {(() => {
                      const nextChar = inlineSuggestion[searchQuery.length];
                      // If the next char is a space and the user hasn't typed it, show the space in the ghost text
                      if (
                        nextChar === " " &&
                        !searchQuery.endsWith(" ")
                      ) {
                        return "\u00A0" + inlineSuggestion.slice(searchQuery.length + 1); // non-breaking space
                      }
                      return inlineSuggestion.slice(searchQuery.length);
                    })()}
                  </span>
                )}
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              {/* Search Stats */}
              <div className={`mt-2 text-sm text-gray-600 flex items-center gap-4 transition-opacity duration-200 ${debouncedSearchQuery ? '' : 'opacity-0 pointer-events-none'}`}>
                <span>Found {sortedResources.length} results</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Search results update as you type
                </span>
              </div>
            </div>

            {/* Resource Recommender - Prominently placed after search */}
            <div className="mt-8 max-w-2xl mx-auto">
              <ResourceRecommender 
                resources={resources}
                onApplyFilters={handleRecommenderFilters}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
              return (
                <Button
                    key={category.key}
                  variant="outline"
                    onClick={() => handleCategoryChange(category.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                      selectedCategory === category.key
                        ? "border-2 border-blue-500 bg-blue-50 text-blue-700 font-medium shadow-sm"
                        : "border-2 border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    {category.label}
                    {category.count > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {category.count}
                      </Badge>
                    )}
                </Button>
              );
            })}
            </div>
            
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="relevance">Sort by Relevance</option>
                <option value="newest">Sort by Newest</option>
                <option value="difficulty">Sort by Difficulty</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="relative py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {currentResources.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {debouncedSearchQuery ? "No resources found" : "No resources in this category"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {debouncedSearchQuery 
                      ? `No resources match "${debouncedSearchQuery}". Try different keywords or browse all resources.`
                      : "Try selecting a different category or browse all resources."
                    }
                  </p>
                  <Button 
                    onClick={clearSearch}
                    variant="outline"
                    className="mr-2"
                  >
                    Clear Search
                  </Button>
                  {selectedCategory !== "all" && (
                    <Button 
                      onClick={() => handleCategoryChange("all")}
                      variant="outline"
                    >
                      Show All Resources
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <p className="text-gray-600">
                      Showing {currentResources.length} of {sortedResources.length} resources
                      {debouncedSearchQuery && ` matching "${debouncedSearchQuery}"`}
                    </p>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {currentResources.map((resource, index) => {
                      const IconComponent = resource.icon;
                      return (
              <a
                key={index}
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                        <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200 overflow-hidden">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                              <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                            
                            <div className="space-y-3">
                    <div>
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs mb-2"
                                  style={{ 
                                    backgroundColor: categories.find(c => c.key === resource.categoryKey)?.color.split(' ')[0] + '20',
                                    color: categories.find(c => c.key === resource.categoryKey)?.color.split(' ')[1]
                                  }}
                                >
                        {resource.category}
                                </Badge>
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                  {debouncedSearchQuery ? (
                                    <span dangerouslySetInnerHTML={{ 
                                      __html: highlightText(resource.title, debouncedSearchQuery) 
                                    }} />
                                  ) : (
                                    resource.title
                                  )}
                      </h3>
                    </div>
                              
                              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                {debouncedSearchQuery ? (
                                  <span dangerouslySetInnerHTML={{ 
                                    __html: highlightText(resource.description, debouncedSearchQuery) 
                                  }} />
                                ) : (
                                  resource.description
                                )}
                              </p>
                              
                              <div className="flex flex-wrap gap-1">
                                {resource.tags.map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="outline" className="text-xs">
                                    {debouncedSearchQuery ? (
                                      <span dangerouslySetInnerHTML={{ 
                                        __html: highlightText(tag, debouncedSearchQuery) 
                                      }} />
                                    ) : (
                                      tag
                                    )}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    {resource.difficulty}
                    </span>
                                  <span>{resource.lastUpdated}</span>
                  </div>
                                <span className="text-blue-600 text-sm font-medium group-hover:underline">
                                  Visit Resource
                      </span>
                </div>
                  </div>
                          </CardContent>
                        </Card>
                </a>
                    );
                  })}
            </div>
              </>
            )}
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, sortedResources.length)} of {sortedResources.length} resources
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10 h-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && <span className="px-2 text-gray-500">...</span>}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-10 h-10"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                  </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              We're constantly expanding our resource library. Let us know what specific topics or resources you'd like to see added.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-50"
                onClick={() => setShowSuggestModal(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                Suggest a Resource
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-blue-600 bg-white hover:bg-blue-50 hover:text-blue-700"
                onClick={handleContactUs}
              >
                <Mail className="h-5 w-5 mr-2" />
                Contact Us
              </Button>
                  </div>
                </div>
              </div>
            </div>

      {/* Suggest Resource Modal */}
      {showSuggestModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSuggestModal(false)}
        >
          <div 
            className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Suggest a Resource</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuggestModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
          </div>
            
            <form onSubmit={handleSuggestResource} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resource Title *
                </label>
                <Input
                  type="text"
                  value={suggestForm.title}
                  onChange={(e) => setSuggestForm({...suggestForm, title: e.target.value})}
                  placeholder="Enter the resource title"
                  required
                  className="w-full"
                />
        </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resource URL *
                </label>
                <Input
                  type="url"
                  value={suggestForm.url}
                  onChange={(e) => setSuggestForm({...suggestForm, url: e.target.value})}
                  placeholder="https://example.com/resource"
                  required
                  className="w-full"
                />
      </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={suggestForm.description}
                  onChange={(e) => setSuggestForm({...suggestForm, description: e.target.value})}
                  placeholder="Brief description of the resource and how it helps with AI ethics education"
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={suggestForm.category}
                  onChange={(e) => setSuggestForm({...suggestForm, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="guidelines">Guidelines & Policies</option>
                  <option value="research">Research & Studies</option>
                  <option value="tools">Tools & Platforms</option>
                  <option value="courses">Courses & Tutorials</option>
                  <option value="case-studies">Case Studies</option>
                  <option value="frameworks">Ethical Frameworks</option>
                  <option value="communities">Communities</option>
                  <option value="assessment">Assessment Tools</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <Input
                  type="text"
                  value={suggestForm.tags}
                  onChange={(e) => setSuggestForm({...suggestForm, tags: e.target.value})}
                  placeholder="Enter tags separated by commas (e.g., bias, assessment, K-12)"
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Submit Suggestion
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSuggestModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;
