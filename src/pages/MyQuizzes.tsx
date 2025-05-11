
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '../components/ui/use-toast';

interface Quiz {
  id: string;
  title: string;
  description: string;
  code: string;
  creator_id: string;
  is_public: boolean;
  created_at: string;
  time_limit: number | null;
  _count?: {
    questions: number;
    attempts: number;
  }
}

interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  completed: boolean;
  started_at: string;
  completed_at: string;
  quiz: Quiz;
}

const MyQuizzes: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [createdQuizzes, setCreatedQuizzes] = useState<Quiz[]>([]);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCreatedQuizzes();
      fetchAttemptedQuizzes();
    }
  }, [user]);

  const fetchCreatedQuizzes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('creator_id', user.id);

      if (error) {
        throw error;
      }

      if (data) {
        // For each quiz, fetch the number of questions and attempts
        const quizzesWithCounts = await Promise.all(
          data.map(async (quiz) => {
            // Get question count
            const { count: questionCount, error: questionError } = await supabase
              .from('questions')
              .select('*', { count: 'exact', head: true })
              .eq('quiz_id', quiz.id);

            // Get attempts count
            const { count: attemptCount, error: attemptError } = await supabase
              .from('quiz_attempts')
              .select('*', { count: 'exact', head: true })
              .eq('quiz_id', quiz.id);

            return {
              ...quiz,
              _count: {
                questions: questionCount || 0,
                attempts: attemptCount || 0
              }
            };
          })
        );

        setCreatedQuizzes(quizzesWithCounts);
      }
    } catch (error) {
      console.error('Error fetching created quizzes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your created quizzes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttemptedQuizzes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
          *,
          quiz:quizzes (
            id,
            title,
            description,
            created_at,
            code
          )
        `)
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('completed_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setAttemptedQuizzes(data as unknown as QuizAttempt[]);
      }
    } catch (error) {
      console.error('Error fetching attempted quizzes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your attempted quizzes',
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Quizzes</h1>
          <Button 
            onClick={() => navigate('/create-quiz')}
            className="bg-quiz-gradient"
          >
            Create New Quiz
          </Button>
        </div>

        <Tabs defaultValue="created">
          <TabsList className="mb-8">
            <TabsTrigger value="created">Created Quizzes</TabsTrigger>
            <TabsTrigger value="attempted">Attempted Quizzes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="created">
            {isLoading ? (
              <div className="text-center py-10">
                <p>Loading your quizzes...</p>
              </div>
            ) : createdQuizzes.length > 0 ? (
              <div className="space-y-4">
                {createdQuizzes.map((quiz) => (
                  <div 
                    key={quiz.id} 
                    className="bg-white rounded-xl p-6 shadow flex justify-between items-center hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-quiz-gradient bg-opacity-10 p-3 rounded-full">
                        <Lightbulb className="text-quiz-orange" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{quiz.title}</h3>
                        <p className="text-gray-600 text-sm">{quiz.description}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <span className="text-gray-500">
                            Code: <span className="font-medium">{quiz.code}</span>
                          </span>
                          <span className="text-gray-500">
                            Participants: <span className="font-medium">{quiz._count?.attempts || 0}</span>
                          </span>
                          <span className="text-gray-500">
                            Questions: <span className="font-medium">{quiz._count?.questions || 0}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/edit-quiz/${quiz.id}`)}>
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 shadow text-center">
                <h3 className="text-xl font-medium mb-2">No quizzes created yet</h3>
                <p className="text-gray-600 mb-6">Start creating your first quiz now!</p>
                <Button 
                  onClick={() => navigate('/create-quiz')}
                  className="bg-quiz-gradient"
                >
                  Create Quiz
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="attempted">
            {attemptedQuizzes.length > 0 ? (
              <div className="space-y-4">
                {attemptedQuizzes.map((attempt) => (
                  <div 
                    key={attempt.id} 
                    className="bg-white rounded-xl p-6 shadow hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg">{attempt.quiz.title}</h3>
                        <p className="text-gray-600 text-sm">{attempt.quiz.description}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <span className="text-gray-500">
                            Completed: <span className="font-medium">
                              {new Date(attempt.completed_at).toLocaleDateString()}
                            </span>
                          </span>
                          <span className="text-quiz-teal font-medium">
                            Score: {attempt.score}%
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => navigate(`/take-quiz/${attempt.quiz_id}`)}
                        className="bg-quiz-gradient"
                      >
                        Retry Quiz
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 shadow text-center">
                <h3 className="text-xl font-medium mb-2">Quiz history</h3>
                <p className="text-gray-600 mb-6">You haven't attempted any quizzes yet.</p>
                <Button 
                  onClick={() => navigate('/participate')}
                  className="bg-quiz-gradient"
                >
                  Take a Quiz
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyQuizzes;
