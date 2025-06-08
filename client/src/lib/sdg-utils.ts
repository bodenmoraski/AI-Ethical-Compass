// Helper to extract SDG number from tag
export const getNormalizedSdgNumber = (tag: string): string => {
  // If it's already just a number as string, return it
  if (/^\d+$/.test(tag)) return tag;
  // If it's in the format "Quality Education (SDG 4)", extract the number
  const match = tag.match(/SDG\s*(\d+)/i);
  return match ? match[1] : tag;
};

// Helper to get scenario-specific relevance
export const getRelevance = (sdgNumber: string, scenarioTitle: string): string => {
  const relevanceMap: Record<string, Record<string, string>> = {
    "4": {
      "AI-Generated Essay": "This scenario directly impacts educational integrity and learning outcomes, particularly for students from diverse backgrounds. It raises questions about the role of AI in academic work and its effects on genuine learning and skill development.",
      "Facial Recognition": "This scenario examines how surveillance technologies in educational settings affect student privacy and learning environment, potentially impacting educational access and quality.",
      "AI Content Moderation": "This scenario explores how AI moderation affects academic discourse and educational content accessibility, potentially influencing the quality and inclusivity of education.",
      "AI in College Admissions": "This scenario directly relates to educational access and equity in higher education, examining how AI-driven decisions impact educational opportunities.",
      "Accessibility AI Tools": "This scenario focuses on how AI can enhance educational accessibility while maintaining academic standards and ensuring quality learning experiences.",
      "AI-Powered Tutoring": "This scenario examines how AI tutoring systems can provide personalized education while ensuring quality learning outcomes for all students.",
      "default": "This scenario examines how AI technologies impact educational quality, access, and equity in learning environments."
    },
    "10": {
      "AI-Generated Essay": "This scenario highlights potential inequalities in access to AI tools and their impact on academic performance, particularly affecting students from different socioeconomic backgrounds.",
      "Facial Recognition": "This scenario raises concerns about bias in surveillance systems and their disproportionate impact on different student populations.",
      "AI Content Moderation": "This scenario examines how automated content moderation might affect diverse voices and perspectives in educational discourse.",
      "AI in College Admissions": "This scenario directly addresses equality in educational opportunities and the potential for AI to either reduce or amplify existing inequalities in college admissions.",
      "Accessibility AI Tools": "This scenario explores how AI tools can help reduce educational inequalities while ensuring fair access to learning resources.",
      "AI-Powered Tutoring": "This scenario examines how AI tutoring can democratize access to personalized education while addressing potential disparities.",
      "default": "This scenario examines how AI implementation might affect equality and fairness in educational settings."
    },
    "16": {
      "default": "This scenario examines how AI implementation affects institutional integrity, transparency, and justice in educational settings."
    },
    "9": {
      "default": "This scenario explores how AI innovation in education can be balanced with responsible development and inclusive access."
    }
  };

  // If the SDG number doesn't exist in our map, return a generic message
  if (!relevanceMap[sdgNumber]) {
    return `This scenario relates to Sustainable Development Goal ${sdgNumber} and its impact on education.`;
  }

  // If we have a specific message for this scenario, use it
  if (relevanceMap[sdgNumber][scenarioTitle]) {
    return relevanceMap[sdgNumber][scenarioTitle];
  }

  // Otherwise, use the default message for this SDG
  return relevanceMap[sdgNumber].default;
}; 