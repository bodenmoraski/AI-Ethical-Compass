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
          link: "#"
        },
        {
          title: "Video: Digital Equity in AI-Enhanced Learning",
          source: "ISTE",
          type: "video",
          link: "#"
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
          link: "#"
        },
        {
          title: "Algorithmic Bias in Face Recognition Technologies",
          source: "MIT Media Lab",
          type: "research",
          link: "#"
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
          link: "#"
        },
        {
          title: "Balancing Safety and Academic Freedom Online",
          source: "Center for Digital Education",
          type: "guide",
          link: "#"
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
          link: "#"
        },
        {
          title: "Equity Considerations in Automated Admissions Systems",
          source: "Education Policy Institute",
          type: "research",
          link: "#"
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
          link: "#"
        },
        {
          title: "Balancing Accommodation and Assessment Integrity",
          source: "Association of Test Publishers",
          type: "whitepaper",
          link: "#"
        }
      ],
      order: 5
    });
  }
}

export const storage = new MemStorage();
