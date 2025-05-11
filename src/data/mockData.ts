
export type Quiz = {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  questions: Question[];
  joinCode: string;
  participants: number;
  createdAt: string;
};

export type Question = {
  id: string;
  text: string;
  options: Option[];
  correctOptionId: string;
};

export type Option = {
  id: string;
  text: string;
};

export type QuizAttempt = {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  attemptedAt: string;
};

// Sample quiz data
export const mockQuizzes: Quiz[] = [
  {
    id: "quiz_1",
    title: "Web Development Basics",
    description: "Test your knowledge of HTML, CSS, and JavaScript",
    createdBy: "1",
    participants: 24,
    joinCode: "WEB123",
    createdAt: "2023-09-15",
    questions: [
      {
        id: "q1_1",
        text: "What does HTML stand for?",
        options: [
          { id: "o1_1", text: "Hyper Text Markup Language" },
          { id: "o1_2", text: "High Technical Modern Language" },
          { id: "o1_3", text: "Hyper Transfer Markup Language" },
          { id: "o1_4", text: "Home Tool Markup Language" }
        ],
        correctOptionId: "o1_1"
      },
      {
        id: "q1_2",
        text: "Which property is used to change the background color in CSS?",
        options: [
          { id: "o2_1", text: "color" },
          { id: "o2_2", text: "bgcolor" },
          { id: "o2_3", text: "background-color" },
          { id: "o2_4", text: "background" }
        ],
        correctOptionId: "o2_3"
      }
    ]
  },
  {
    id: "quiz_2",
    title: "General Knowledge",
    description: "Test your general knowledge",
    createdBy: "1",
    participants: 18,
    joinCode: "GK456",
    createdAt: "2023-10-01",
    questions: [
      {
        id: "q2_1",
        text: "What is the capital of France?",
        options: [
          { id: "o1_1", text: "London" },
          { id: "o1_2", text: "Berlin" },
          { id: "o1_3", text: "Madrid" },
          { id: "o1_4", text: "Paris" }
        ],
        correctOptionId: "o1_4"
      }
    ]
  },
  {
    id: "quiz_3",
    title: "Science Quiz",
    description: "Test your scientific knowledge",
    createdBy: "1",
    participants: 12,
    joinCode: "SCI789",
    createdAt: "2023-10-15",
    questions: [
      {
        id: "q3_1",
        text: "What is the chemical symbol for gold?",
        options: [
          { id: "o1_1", text: "Go" },
          { id: "o1_2", text: "Au" },
          { id: "o1_3", text: "Gd" },
          { id: "o1_4", text: "Ag" }
        ],
        correctOptionId: "o1_2"
      }
    ]
  }
];

export const mockAttempts: QuizAttempt[] = [
  {
    id: "attempt_1",
    quizId: "quiz_1",
    userId: "1",
    score: 8,
    totalQuestions: 10,
    attemptedAt: "2023-09-20"
  },
  {
    id: "attempt_2",
    quizId: "quiz_2",
    userId: "1",
    score: 7,
    totalQuestions: 8,
    attemptedAt: "2023-10-05"
  }
];

export function getQuizzesCreatedByUser(userId: string): Quiz[] {
  return mockQuizzes.filter(quiz => quiz.createdBy === userId);
}

export function getQuizAttemptsByUser(userId: string): QuizAttempt[] {
  return mockAttempts.filter(attempt => attempt.userId === userId);
}

export function getQuizById(quizId: string): Quiz | undefined {
  return mockQuizzes.find(quiz => quiz.id === quizId);
}

export function getQuizByCode(code: string): Quiz | undefined {
  return mockQuizzes.find(quiz => quiz.joinCode === code);
}

// Mock statistics
export const mockStatistics = {
  totalQuizzes: 5,
  totalAttempts: 15,
  averageScore: 78,
  bestCategory: "Science",
  recentActivity: [
    { date: "Oct 15", action: "Created quiz", title: "Science Quiz" },
    { date: "Oct 10", action: "Attempted quiz", title: "Geography Basics" },
    { date: "Oct 5", action: "Created quiz", title: "Math Fundamentals" }
  ],
  quizzesByCategory: [
    { category: "Science", count: 2 },
    { category: "History", count: 1 },
    { category: "Math", count: 1 },
    { category: "Geography", count: 1 }
  ],
  performanceOverTime: [
    { month: "Jul", score: 65 },
    { month: "Aug", score: 70 },
    { month: "Sep", score: 75 },
    { month: "Oct", score: 85 }
  ]
};
