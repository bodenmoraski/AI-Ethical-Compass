import { 
  scenarios, type Scenario, type InsertScenario,
  perspectives, type Perspective, type InsertPerspective,
  userProgress, type UserProgress, type InsertUserProgress,
  users, type User, type InsertUser
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Scenario management
  getAllScenarios(): Promise<Scenario[]>;
  getScenarioById(id: number): Promise<Scenario | undefined>;
  createScenario(scenario: InsertScenario): Promise<Scenario>;
  
  // Perspective management
  getPerspectivesByScenarioId(scenarioId: number): Promise<Perspective[]>;
  createPerspective(perspective: InsertPerspective): Promise<Perspective>;
  
  // User Progress
  getUserProgress(userId: number | null): Promise<UserProgress[]>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private scenarios: Map<number, Scenario>;
  private perspectives: Map<number, Perspective>;
  private progresses: Map<number, UserProgress>;
  
  private userCurrentId: number;
  private scenarioCurrentId: number;
  private perspectiveCurrentId: number;
  private progressCurrentId: number;

  constructor() {
    this.users = new Map();
    this.scenarios = new Map();
    this.perspectives = new Map();
    this.progresses = new Map();
    
    this.userCurrentId = 1;
    this.scenarioCurrentId = 1;
    this.perspectiveCurrentId = 1;
    this.progressCurrentId = 1;
    
    // Initialize with default scenarios
    this.initializeScenarios();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getAllScenarios(): Promise<Scenario[]> {
    return Array.from(this.scenarios.values())
      .sort((a, b) => a.order - b.order);
  }
  
  async getScenarioById(id: number): Promise<Scenario | undefined> {
    return this.scenarios.get(id);
  }
  
  async createScenario(insertScenario: InsertScenario): Promise<Scenario> {
    const id = this.scenarioCurrentId++;
    const scenario: Scenario = { ...insertScenario, id };
    this.scenarios.set(id, scenario);
    return scenario;
  }
  
  async getPerspectivesByScenarioId(scenarioId: number): Promise<Perspective[]> {
    return Array.from(this.perspectives.values())
      .filter(perspective => perspective.scenarioId === scenarioId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createPerspective(insertPerspective: InsertPerspective): Promise<Perspective> {
    const id = this.perspectiveCurrentId++;
    const perspective: Perspective = { 
      ...insertPerspective, 
      id, 
      createdAt: new Date() 
    };
    this.perspectives.set(id, perspective);
    return perspective;
  }
  
  async getUserProgress(userId: number | null): Promise<UserProgress[]> {
    if (userId === null) {
      return [];
    }
    return Array.from(this.progresses.values())
      .filter(progress => progress.userId === userId);
  }
  
  async updateUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    // Check if progress already exists for this user and scenario
    let existingProgress: UserProgress | undefined;
    
    if (insertProgress.userId) {
      existingProgress = Array.from(this.progresses.values()).find(
        p => p.userId === insertProgress.userId && p.scenarioId === insertProgress.scenarioId
      );
    }
    
    if (existingProgress) {
      // Update existing progress
      const updatedProgress: UserProgress = {
        ...existingProgress,
        ...insertProgress,
        completedAt: insertProgress.completed ? new Date() : existingProgress.completedAt
      };
      this.progresses.set(existingProgress.id, updatedProgress);
      return updatedProgress;
    } else {
      // Create new progress
      const id = this.progressCurrentId++;
      const progress: UserProgress = {
        ...insertProgress,
        id,
        completedAt: insertProgress.completed ? new Date() : null
      };
      this.progresses.set(id, progress);
      return progress;
    }
  }
  
  private initializeScenarios() {
    // Scenario 1: AI-Generated Essay
    this.createScenario({
      title: "AI-Generated Essay",
      description: "A high school teacher receives an essay from a student that seems unusually sophisticated. The writing style is polished, references are extensive and accurate, and the arguments are well-structured. The teacher suspects that the student may have used an AI tool to generate part or all of the essay, but has no definitive proof.\n\nThe student in question has previously submitted work of varying quality, and comes from a household where English is not the primary language. The assignment was a crucial part of the semester grade.",
      options: [
        "Yes - The student likely used an AI text generator to write the entire essay",
        "Yes - The student may have used AI to help edit or enhance their own writing",
        "Yes - The student possibly used AI for research or finding references",
        "No - The improvement is likely due to the student getting outside help or making extra effort",
        "Not sure - There's insufficient information to determine AI use"
      ],
      aiUseAnswer: "The scenario suggests that AI might have been used to generate or significantly enhance the essay. This is a common ethical dilemma in education today.",
      sdgTags: ["Quality Education (SDG 4)", "Reduced Inequalities (SDG 10)"],
      relatedResources: [
        {
          title: "AI in Education: Guidelines for Ethical Use",
          source: "UNESCO",
          type: "article",
          link: "https://en.unesco.org/artificial-intelligence/education"
        },
        {
          title: "Video: Digital Equity in AI-Enhanced Learning",
          source: "ISTE",
          type: "video",
          link: "https://www.iste.org/areas-of-focus/AI-in-education"
        }
      ],
      order: 1
    });
    
    // Scenario 2: Facial Recognition
    this.createScenario({
      title: "Facial Recognition",
      description: "A high school is considering implementing facial recognition technology at school entrances to enhance security. The system would scan students' faces upon entry to verify their identity against a database and alert security staff of any unrecognized individuals.\n\nSome students and parents have expressed privacy concerns, while others believe the safety benefits outweigh these concerns. Additionally, there are questions about the accuracy of facial recognition with diverse student populations.",
      options: [
        "Yes - Facial recognition is a form of AI used for identity verification",
        "Yes - The system uses AI algorithms to match faces to a database",
        "Partially - There's AI involved but it's primarily a security camera system",
        "No - This is standard security technology without advanced AI",
        "Not sure - Need more technical details to determine AI involvement"
      ],
      aiUseAnswer: "Facial recognition systems typically use artificial intelligence, specifically machine learning algorithms, to analyze facial features and match them to a database. These are AI-powered systems.",
      sdgTags: ["Quality Education (SDG 4)", "Reduced Inequalities (SDG 10)"],
      relatedResources: [
        {
          title: "Facial Recognition Technology in Schools: Privacy Concerns",
          source: "Electronic Frontier Foundation",
          type: "article",
          link: "https://www.eff.org/issues/facial-recognition"
        },
        {
          title: "Algorithmic Bias in Face Recognition Technologies",
          source: "MIT Media Lab",
          type: "research",
          link: "https://www.media.mit.edu/projects/gender-shades/overview/"
        }
      ],
      order: 2
    });
    
    // Scenario 3: AI Content Moderation
    this.createScenario({
      title: "AI Content Moderation",
      description: "A popular educational discussion platform used by students and teachers has implemented an AI content moderation system to automatically detect and filter inappropriate content. The system reviews posts in real-time and can automatically remove content it flags as harmful, offensive, or inappropriate for an educational setting.\n\nSome users have noticed that discussions about certain historical events, literature containing sensitive topics, or even scientific discussions are sometimes incorrectly flagged and removed.",
      options: [
        "Yes - The platform is using AI to automatically moderate content",
        "Yes - The system uses natural language processing to analyze posts",
        "Partially - There's likely some human oversight combined with AI tools",
        "No - This appears to be basic keyword filtering, not AI",
        "Not sure - Can't determine without knowing the specific technology used"
      ],
      aiUseAnswer: "Content moderation at scale typically utilizes AI, specifically natural language processing (NLP) models trained to identify potentially problematic content. The ability to analyze context and make judgment calls suggests AI involvement beyond simple keyword filtering.",
      sdgTags: ["Quality Education (SDG 4)", "Reduced Inequalities (SDG 10)"],
      relatedResources: [
        {
          title: "The Challenges of AI Content Moderation in Educational Contexts",
          source: "Journal of Educational Technology",
          type: "article",
          link: "https://www.jlet.org/index.php/articles"
        },
        {
          title: "Balancing Safety and Academic Freedom Online",
          source: "Center for Digital Education",
          type: "guide",
          link: "https://www.govtech.com/education"
        }
      ],
      order: 3
    });
    
    // Scenario 4: AI in College Admissions
    this.createScenario({
      title: "AI in College Admissions",
      description: "A group of universities has begun using an AI system to help screen initial college applications. The system analyzes various factors including grades, standardized test scores, extracurricular activities, and recommendation letters to generate an \"applicant score\" that admissions officers use to prioritize applications for further review.\n\nThe universities claim this makes the process more efficient and helps identify promising candidates who might otherwise be overlooked. However, some students and education advocates have raised concerns about transparency and potential bias in the system.",
      options: [
        "Yes - The universities are using AI to evaluate and score applications",
        "Yes - The system uses machine learning to predict student success potential",
        "Partially - The AI is only providing initial screening, with humans making final decisions",
        "No - This is just an automated scoring system without true AI capabilities",
        "Not sure - More information about the algorithm is needed"
      ],
      aiUseAnswer: "This scenario describes an AI-based application screening system that evaluates multiple factors to generate an applicant score. Modern admissions tools often use machine learning to identify patterns in successful applicants and apply those insights to new applications.",
      sdgTags: ["Quality Education (SDG 4)", "Reduced Inequalities (SDG 10)"],
      relatedResources: [
        {
          title: "AI in College Admissions: Promise and Pitfalls",
          source: "Higher Education Today",
          type: "article",
          link: "https://www.higheredtoday.org/policy-research/diversity-equity-inclusion/"
        },
        {
          title: "Equity Considerations in Automated Admissions Systems",
          source: "Education Policy Institute",
          type: "research",
          link: "https://epi.org.uk/publications-and-research/"
        }
      ],
      order: 4
    });
    
    // Scenario 5: Accessibility AI Tools
    this.createScenario({
      title: "Accessibility AI Tools",
      description: "A high school has introduced AI-powered accessibility tools to support students with different learning needs. These include speech-to-text tools for students with writing difficulties, text-to-speech for reading challenges, real-time captioning for deaf or hard-of-hearing students, and language translation for English language learners.\n\nWhile many students benefit from these tools, there have been instances where the technology misunderstood specialized terminology in science classes or struggled with accented speech. Some teachers also wonder if certain accommodations might give some students an unfair advantage in assessments.",
      options: [
        "Yes - Multiple AI technologies are being used for accessibility purposes",
        "Yes - Speech recognition and language processing are AI applications",
        "Partially - Some of these tools use AI while others use simpler technologies",
        "No - These are basic assistive technologies without advanced AI",
        "Not sure - The level of AI sophistication in these tools is unclear"
      ],
      aiUseAnswer: "The scenario describes several AI-powered accessibility tools. Modern speech-to-text, text-to-speech, real-time captioning, and translation systems typically use sophisticated AI models, particularly neural networks trained on large datasets of human language.",
      sdgTags: ["Quality Education (SDG 4)", "Reduced Inequalities (SDG 10)"],
      relatedResources: [
        {
          title: "AI for Education Accessibility: Best Practices",
          source: "Center for Applied Special Technology",
          type: "guide",
          link: "https://www.cast.org/products-services/resources"
        },
        {
          title: "Balancing Accommodation and Assessment Integrity",
          source: "Association of Test Publishers",
          type: "whitepaper",
          link: "https://www.testpublishers.org/resources"
        }
      ],
      order: 5
    });
    
    // Scenario 6: AI-Powered Tutoring Systems
    this.createScenario({
      title: "AI-Powered Tutoring Systems",
      description: "A school district has implemented an AI-powered tutoring system that provides personalized learning assistance to students outside of regular class hours. The system adapts to each student's learning pace, identifies knowledge gaps based on their responses, and customizes explanations and practice problems accordingly.\n\nSome students have shown significant improvement in their understanding and test scores after using the system, while others find the experience impersonal or struggle to engage with the digital interface. Parents and educators are debating whether AI tutoring should complement or replace traditional tutoring programs.",
      options: [
        "Yes - The system uses AI to personalize learning experiences for each student",
        "Yes - Adaptive learning algorithms are being used to identify knowledge gaps",
        "Partially - There are some AI elements but likely with significant human oversight",
        "No - This is mainly an automated practice system with pre-programmed responses",
        "Not sure - Need more technical details to determine the level of AI involvement"
      ],
      aiUseAnswer: "This scenario describes an AI-powered adaptive tutoring system. Modern educational technology of this type typically uses sophisticated AI algorithms that analyze student performance patterns, adapt content difficulty, and personalize learning pathways based on individual student data.",
      sdgTags: ["Quality Education (SDG 4)", "Reduced Inequalities (SDG 10)"],
      relatedResources: [
        {
          title: "The Effectiveness of AI Tutors vs. Human Tutors",
          source: "Journal of Educational Psychology",
          type: "research",
          link: "https://www.apa.org/pubs/journals/edu"
        },
        {
          title: "Designing Equitable AI Tutoring Systems",
          source: "Stanford HAI",
          type: "guide",
          link: "https://hai.stanford.edu/research/ai-education"
        }
      ],
      order: 6
    });
    
    // Scenario 7: Predictive Analytics for Dropout Prevention
    this.createScenario({
      title: "Predictive Analytics for Dropout Prevention",
      description: "A large public school system has implemented an AI-based predictive analytics program that identifies students at risk of dropping out. The system analyzes various data points including attendance records, grades, disciplinary incidents, and socioeconomic factors to flag students who might need additional support.\n\nThe school's intervention team uses these predictions to allocate resources and create personalized support plans. While graduation rates have improved since implementation, some parents and civil rights advocates have raised concerns about privacy, data security, and potential bias in how students are identified and assisted.",
      options: [
        "Yes - AI algorithms are analyzing student data to predict dropout risk",
        "Yes - Machine learning models are identifying patterns in student behavior",
        "Partially - The system uses some AI but relies heavily on traditional statistical methods",
        "No - This is standard data analysis without advanced AI capabilities",
        "Not sure - The distinction between complex analytics and AI is unclear here"
      ],
      aiUseAnswer: "This scenario describes an AI-based predictive analytics system. Modern dropout prevention tools typically use machine learning algorithms to identify complex patterns across multiple variables that might not be apparent through traditional statistical approaches.",
      sdgTags: ["Quality Education (SDG 4)", "Reduced Inequalities (SDG 10)"],
      relatedResources: [
        {
          title: "Ethical Considerations in Educational Data Mining",
          source: "International Educational Data Mining Society",
          type: "article",
          link: "https://educationaldatamining.org/resources/"
        },
        {
          title: "Privacy-Preserving Approaches to Predictive Analytics in Education",
          source: "Future of Privacy Forum",
          type: "whitepaper",
          link: "https://fpf.org/blog/category/k-12-education/"
        }
      ],
      order: 7
    });
    
    // Scenario 8: AI Writing Feedback Tools
    this.createScenario({
      title: "AI Writing Feedback Tools",
      description: "An English department has adopted an AI-powered writing feedback tool that analyzes student essays and provides immediate suggestions on grammar, style, organization, and content. Students submit drafts to the system and receive automated feedback before submitting their final work to teachers.\n\nSome students find the instant feedback helpful for improving their writing, while others feel the AI doesn't fully understand nuanced or creative approaches. Teachers have noticed improvements in technical aspects of writing but wonder if students are becoming overly dependent on the tool rather than developing their own editing skills.",
      options: [
        "Yes - Natural language processing AI is analyzing and providing feedback on writing",
        "Yes - The system uses machine learning to evaluate various aspects of written work",
        "Partially - The tool likely combines predefined rules with some AI capabilities",
        "No - This is primarily automated grammar checking without true AI understanding",
        "Not sure - The sophistication of the writing analysis is unclear"
      ],
      aiUseAnswer: "This scenario describes an AI-powered writing feedback system. Modern writing assessment tools typically use natural language processing and machine learning to analyze multiple dimensions of writing beyond simple grammar checking, including structure, style, and content relevance.",
      sdgTags: ["Quality Education (SDG 4)", "Reduced Inequalities (SDG 10)"],
      relatedResources: [
        {
          title: "AI Feedback and Writing Skill Development",
          source: "International Literacy Association",
          type: "research",
          link: "https://www.literacyworldwide.org/resources"
        },
        {
          title: "Balancing Automated and Human Feedback in Writing Instruction",
          source: "National Council of Teachers of English",
          type: "guide",
          link: "https://ncte.org/resources/"
        }
      ],
      order: 8
    });
    
    // Scenario 9: AI-Enhanced Science Labs
    this.createScenario({
      title: "AI-Enhanced Science Labs",
      description: "A science department has implemented AI-enhanced virtual laboratory experiences that allow students to conduct sophisticated experiments that would be too dangerous, expensive, or time-consuming in a traditional school lab. The simulations use AI to model realistic outcomes based on student inputs and can adapt the complexity based on student performance.\n\nMost students are excited about the opportunity to explore advanced concepts, but some teachers worry that students are missing out on developing hands-on laboratory skills. There are also questions about whether the simulations might oversimplify certain scientific phenomena or embed unintended biases in how scientific concepts are presented.",
      options: [
        "Yes - AI is powering the simulation and adapting to student interactions",
        "Yes - Machine learning models are generating realistic experimental outcomes",
        "Partially - There's some AI involvement but primarily pre-programmed simulations",
        "No - These are advanced graphics and physics engines but not true AI",
        "Not sure - It's difficult to determine the level of AI without technical details"
      ],
      aiUseAnswer: "This scenario describes AI-enhanced virtual laboratory simulations. Modern science simulations often use AI to create realistic, responsive environments that adapt to student actions and generate outcomes that follow scientific principles rather than simply playing back pre-recorded scenarios.",
      sdgTags: ["Quality Education (SDG 4)", "Reduced Inequalities (SDG 10)"],
      relatedResources: [
        {
          title: "Virtual vs. Physical Labs in Science Education",
          source: "National Science Teaching Association",
          type: "research",
          link: "https://www.nsta.org/resources"
        },
        {
          title: "Designing Inclusive AI-Based Science Learning Experiences",
          source: "Association for Science Education",
          type: "guide",
          link: "https://www.ase.org.uk/resources"
        }
      ],
      order: 9
    });
    
    // Scenario 10: AI Teacher Assistants
    this.createScenario({
      title: "AI Teacher Assistants",
      description: "A middle school is piloting AI-powered digital teaching assistants in several classrooms. These assistants help manage routine tasks like answering common student questions, providing additional explanations of concepts, tracking participation, and even helping with initial grading of objective assignments.\n\nTeachers report having more time for individualized instruction and creative activities, but some parents worry about the reduced human interaction and oversight. Questions have also been raised about data privacy, as the system collects detailed information about student interactions and performance to improve its responses.",
      options: [
        "Yes - The digital assistants use AI to respond to student questions and grade work",
        "Yes - Machine learning allows the system to improve over time based on interactions",
        "Partially - The assistants combine scripted responses with some AI capabilities",
        "No - These are primarily automated tools without sophisticated AI understanding",
        "Not sure - More information is needed about the technology behind the assistants"
      ],
      aiUseAnswer: "This scenario describes AI-powered digital teaching assistants. Modern educational AI assistants typically use natural language processing to understand and respond to student questions, machine learning to improve over time, and automated assessment capabilities—all of which are AI applications.",
      sdgTags: ["Quality Education (SDG 4)", "Reduced Inequalities (SDG 10)"],
      relatedResources: [
        {
          title: "The Role of AI Assistants in K-12 Classrooms",
          source: "International Society for Technology in Education",
          type: "article",
          link: "https://www.iste.org/areas-of-focus/AI-in-education"
        },
        {
          title: "Student Data Privacy Considerations for AI in Schools",
          source: "Student Data Privacy Consortium",
          type: "guide",
          link: "https://privacy.a4l.org/resources/"
        }
      ],
      order: 10
    });
  }
}

export const storage = new MemStorage();
