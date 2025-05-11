
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

const Participate: React.FC = () => {
  const [joinCode, setJoinCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setIsLoading(true);
    try {
      // Fetch public quizzes
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('is_public', true);

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

        setQuizzes(quizzesWithCounts);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quizzes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinQuiz = async () => {
    if (!joinCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a quiz code",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('code', joinCode.trim().toUpperCase())
        .single();

      if (error || !data) {
        toast({
          title: "Error",
          description: "Invalid quiz code. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Joining "${data.title}" quiz`,
      });
      navigate(`/take-quiz/${data.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join quiz",
        variant: "destructive",
      });
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Participate in a Quiz</h1>

        {/* Join by code section */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Join with a Code</h2>
          <div className="flex gap-4">
            <Input
              placeholder="Enter quiz code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="max-w-md"
            />
            <Button 
              onClick={handleJoinQuiz}
              className="bg-quiz-gradient"
            >
              Join Quiz
            </Button>
          </div>
        </div>

        {/* Search section */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search for quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Available quizzes section */}
        <h2 className="text-xl font-semibold mb-4">Available Quizzes</h2>
        {isLoading ? (
          <div className="text-center py-10">
            <p>Loading quizzes...</p>
          </div>
        ) : filteredQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredQuizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-2">{quiz.title}</h3>
                <p className="text-gray-600 mb-4">{quiz.description}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      Join Code: <span className="font-medium">{quiz.code}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {quiz._count?.questions || 0} questions • {quiz._count?.attempts || 0} participants
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      toast({
                        title: "Success",
                        description: `Joining "${quiz.title}" quiz`,
                      });
                      navigate(`/take-quiz/${quiz.id}`);
                    }}
                    className="bg-quiz-gradient"
                  >
                    Take Quiz
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 shadow text-center">
            <h3 className="text-xl font-medium mb-2">No matching quizzes found</h3>
            <p className="text-gray-600">Try a different search term or join with a code.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Participate;
