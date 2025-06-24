# 🤖 AI Ethical Compass - Teaching Responsible AI Use

> **Empowering students and educators to navigate the complex ethical landscape of artificial intelligence in education**

## 🌟 Mission & Vision

**AI Ethical Compass** was developed with a clear mission: to help high school students and educators develop critical thinking skills regarding the ethical, responsible, and inclusive use of Artificial Intelligence.

In a world where AI increasingly influences education and daily life, it's essential that young people and educators learn to navigate complex ethical questions about how these technologies should be used.

### 🎯 Challenge Themes We Address

- **Digital Inclusion**: Examining how AI tools can either promote or hinder digital inclusion in educational contexts
- **Responsible Digital Citizenship**: Confronting questions about responsible AI use, transparency, disclosure, and ethical frameworks

### 🌍 UN Sustainable Development Goals Alignment

Our platform aligns with multiple UN Sustainable Development Goals:

- **SDG 4: Quality Education** - Promoting critical analysis of how AI can enhance or detract from quality education
- **SDG 10: Reduced Inequalities** - Exploring how AI can amplify or reduce inequalities in educational settings
- **SDG 9: Industry, Innovation and Infrastructure** - Balancing AI innovation with responsible development
- **SDG 16: Peace, Justice and Strong Institutions** - Promoting ethical frameworks and responsible governance

## ✨ Key Features

### 🎓 **Interactive Learning Experience**
- **10+ Curated AI Ethics Scenarios** covering real-world educational dilemmas
- **4-Step Learning Process**: Identify → Evaluate → Share → Explore
- **Guided Ethical Evaluation** with structured questions and frameworks
- **Community Perspective Sharing** with anonymous contributions
- **AI-Powered Content Moderation** ensuring appropriate discussions

### 👨‍🏫 **Comprehensive Teacher Dashboard**
- **Class Management**: Create, organize, and manage multiple classes
- **Assignment Creation**: Design AI ethics assignments with rubrics
- **Student Management**: Track enrollment, progress, and engagement
- **Real-time Classroom Monitoring**: Live activity tracking and analytics
- **Content Moderation Tools**: Manage discussions and submissions
- **Analytics & Insights**: Detailed engagement and performance metrics

### 🌐 **Global Accessibility**
- **7 Language Support**: English, Spanish, French, German, Chinese, Arabic, Italian
- **WCAG 2.1 AA Compliance**: Full accessibility features
- **Responsive Design**: Works on all devices and screen sizes
- **Accessibility Controls**: Font size, high contrast, screen reader support

### 🏆 **Advanced Gamification**
- **6-Tier Achievement System**: Bronze, Silver, Gold, Platinum levels
- **Community Leaderboards**: Recognizing thoughtful contributors
- **Reputation Scoring**: Quality-based ranking system
- **Progress Tracking**: Individual learning journey monitoring

### 🤖 **AI-Powered Features**
- **Content Moderation**: AI analysis of perspectives and scenarios
- **Quality Assessment**: Automated evaluation of ethical reasoning
- **Bias Detection**: Identifying potential biases in content
- **Smart Ranking**: Intelligent sorting of community perspectives

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** for component library
- **React Query** for data fetching
- **React Router** for navigation
- **i18next** for internationalization

### Backend Stack
- **Vercel Serverless Functions** for API endpoints
- **Supabase** for database and authentication
- **PostgreSQL** for data storage
- **OpenAI API** for AI analysis features

### Key Components
- **Authentication System**: Supabase Auth with role-based access
- **Real-time Features**: WebSocket connections for live updates
- **Content Moderation**: AI-powered filtering and analysis
- **Analytics Engine**: Comprehensive tracking and reporting
- **Gamification System**: Achievement and leaderboard mechanics

## 📊 Database Schema

### Core Tables
```sql
-- Users and authentication
users (id, email, username, role, created_at)

-- Learning content
scenarios (id, title, description, category, difficulty_level)
perspectives (id, scenario_id, author_name, content, moderation_status)

-- Teacher features
classes (id, name, teacher_id, class_code, subject, grade_level)
assignments (id, class_id, title, description, due_date, points_possible)
class_enrollments (class_id, student_id, enrollment_date)

-- Gamification
user_achievements (user_email, achievement_type, achievement_level)
leaderboard_entries (user_email, username, score, rank_position)

-- Analytics
user_progress (user_id, scenario_id, completed, time_spent)
student_engagement (class_id, student_id, engagement_score)
realtime_activities (type, class_id, user_id, timestamp)
```

## 🎮 User Experience Flow

### For Students
1. **Explore Scenarios** - Browse curated AI ethics dilemmas
2. **Identify AI Use** - Determine if and how AI is being used
3. **Evaluate Ethics** - Consider implications, benefits, and risks
4. **Share Perspectives** - Contribute anonymous thoughts
5. **Explore Community** - View diverse viewpoints from others
6. **Track Progress** - Monitor learning journey and achievements

### For Teachers
1. **Create Classes** - Set up virtual classrooms with unique codes
2. **Manage Students** - Enroll students and track participation
3. **Design Assignments** - Create AI ethics assessments
4. **Monitor Engagement** - Real-time classroom activity tracking
5. **Moderate Content** - Review and manage student submissions
6. **Analyze Performance** - Detailed analytics and insights

## 🔧 API Endpoints

### Core Learning APIs
- `GET /api/scenarios` - Fetch all scenarios
- `POST /api/perspectives` - Submit new perspective
- `GET /api/perspective-rankings` - Get ranked perspectives
- `GET /api/user-progress` - Track learning progress

### Teacher Dashboard APIs
- `GET /api/teacher?action=classes` - Fetch teacher's classes
- `POST /api/teacher?action=classes` - Create new class
- `GET /api/teacher?action=assignments` - Get class assignments
- `POST /api/teacher?action=assignments` - Create assignment
- `GET /api/teacher?action=students` - Get class students

### Gamification APIs
- `GET /api/leaderboard` - Community rankings
- `GET /api/achievements` - Available achievements
- `POST /api/achievements` - Check and award achievements

### Real-time APIs
- `GET /api/realtime-classroom?action=activities` - Live classroom activities
- `GET /api/realtime-classroom?action=engagement` - Student engagement data
- `GET /api/realtime-classroom?action=stats` - Live statistics

## 🌍 Internationalization

The platform supports 7 languages with full translations:
- 🇺🇸 English (default)
- 🇪🇸 Spanish (Español)
- 🇫🇷 French (Français)
- 🇩🇪 German (Deutsch)
- 🇨🇳 Chinese (中文)
- 🇦🇪 Arabic (العربية)
- 🇮🇹 Italian (Italiano)

## ♿ Accessibility Features

- **WCAG 2.1 AA Compliance** throughout the application
- **Keyboard Navigation** support for all features
- **Screen Reader** compatibility with ARIA labels
- **High Contrast Mode** for visual accessibility
- **Font Size Controls** for readability
- **Color Blind Friendly** design considerations

## 📈 Performance Optimizations

- **React Query** for efficient data caching and synchronization
- **Code Splitting** for faster initial load times
- **Image Optimization** with lazy loading
- **Debounced Loading States** to prevent UI flickering
- **Memoized Components** to reduce unnecessary re-renders
- **Optimized Database Queries** with proper indexing

## 🔒 Security Features

- **Row Level Security (RLS)** policies in Supabase
- **JWT Authentication** with proper token validation
- **Content Moderation** to prevent inappropriate content
- **Rate Limiting** on API endpoints
- **Input Validation** with Zod schemas
- **CORS Configuration** for secure cross-origin requests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ISTE+ASCD** for the AI Innovator Challenge 2025
- **Supabase** for the excellent backend platform
- **Vercel** for seamless deployment
- **OpenAI** for AI analysis capabilities
- **The Open Source Community** for amazing tools and libraries
- **Benji Beall & Roshan Kshirsagar** for help throughout

## 📞 Support

- **Documentation**: [docs.ethical-ai-compass.com](https://docs.ethical-ai-compass.com)
- **Issues**: [GitHub Issues](https://github.com/bodenmoraski/AI-Ethical-Compass/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/ethical-ai-platform/discussions)
- **Email**: support@aiethicalcompass.com (for just just email bodenmoraski@gmail.com)

---

**Made with ❤️ for the future of ethical AI education** 