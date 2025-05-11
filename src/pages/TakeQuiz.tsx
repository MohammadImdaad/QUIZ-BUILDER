
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useToast } from '../components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../context/AuthContext';

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  question: string;
  type: string;
  options: Option[];
  correct_answer: string;
  quiz_id: string;
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  is_public: boolean;
  code: string;
  time_limit?: number;
  created_at: string;
}

const TakeQuiz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadQuiz(id);
    }
  }, [id]);

  const loadQuiz = async (quizId: string) => {
    setIsLoading(true);
    try {
      // Fetch quiz details
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizError || !quizData) {
        toast({
          title: "Error",
          description: "Quiz not found",
          variant: "destructive",
        });
        navigate('/participate');
        return;
      }

      // Fetch quiz questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId);

      if (questionsError) {
        toast({
          title: "Error",
          description: "Failed to load quiz questions",
          variant: "destructive",
        });
        navigate('/participate');
        return;
      }

      if (!questionsData || questionsData.length === 0) {
        toast({
          title: "Error",
          description: "This quiz has no questions",
          variant: "destructive",
        });
        navigate('/participate');
        return;
      }

      // Create an attempt record
      if (user) {
        const { data: attemptData, error: attemptError } = await supabase
          .from('quiz_attempts')
          .insert({
            quiz_id: quizId,
            user_id: user.id,
            started_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (attemptError) {
          console.error('Error creating attempt:', attemptError);
        } else if (attemptData) {
          setAttemptId(attemptData.id);
        }
      }

      // Process and set quiz data
      setQuiz(quizData as QuizData);
      
      // Process and convert question data with proper options typing
      const processedQuestions = questionsData.map((q: any) => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]')
      }));
      
      setQuestions(processedQuestions);
      setSelectedOptions(new Array(processedQuestions.length).fill(''));

    } catch (error) {
      console.error('Error loading quiz:', error);
      toast({
        title: "Error",
        description: "Failed to load quiz",
        variant: "destructive",
      });
      navigate('/participate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (optionId: string) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestionIndex] = optionId;
    setSelectedOptions(newSelectedOptions);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (questions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || !questions.length) return;
    
    // Calculate score
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (selectedOptions[index] === question.correct_answer) {
        correctAnswers++;
      }
    });
    
    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);
    
    toast({
      title: "Quiz Completed",
      description: `Your score: ${finalScore}%`,
    });

    // Update the attempt record if we have an attemptId
    if (attemptId && user) {
      try {
        const { error } = await supabase
          .from('quiz_attempts')
          .update({
            score: finalScore,
            completed: true,
            completed_at: new Date().toISOString(),
            answers: selectedOptions
          })
          .eq('id', attemptId);

        if (error) {
          console.error('Error updating attempt:', error);
        }
      } catch (error) {
        console.error('Error updating attempt:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-10">
          <p>Loading quiz...</p>
        </div>
      </Layout>
    );
  }

  if (!quiz || !questions.length) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-10">
          <p>Quiz not found</p>
          <Button onClick={() => navigate('/participate')} className="mt-4">
            Back to Quizzes
          </Button>
        </div>
      </Layout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
        <p className="text-gray-600 mb-8">{quiz.description}</p>

        {!showResults ? (
          <Card className="p-6">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h2>
              <div className="text-sm text-gray-500">
                {currentQuestionIndex + 1}/{questions.length}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedOptions[currentQuestionIndex] === option.id
                        ? 'bg-quiz-gradient text-white'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {option.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              {currentQuestionIndex < questions.length - 1 ? (
                <Button
                  className="bg-quiz-gradient"
                  onClick={handleNextQuestion}
                  disabled={!selectedOptions[currentQuestionIndex]}
                >
                  Next
                </Button>
              ) : (
                <Button
                  className="bg-quiz-gradient"
                  onClick={handleSubmit}
                  disabled={!selectedOptions[currentQuestionIndex]}
                >
                  Submit Quiz
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Quiz Results</h2>
            
            <div className="mb-6 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{score}%</div>
                <div className="text-gray-600">
                  {score >= 70 ? 'Great job!' : 'Keep practicing!'}
                </div>
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Your Answer</TableHead>
                  <TableHead>Correct Answer</TableHead>
                  <TableHead className="text-right">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question, index) => {
                  const selectedOption = question.options.find(
                    (o) => o.id === selectedOptions[index]
                  );
                  const correctOption = question.options.find(
                    (o) => o.id === question.correct_answer
                  );
                  const isCorrect = selectedOptions[index] === question.correct_answer;
                  
                  return (
                    <TableRow key={question.id}>
                      <TableCell className="font-medium">{question.question}</TableCell>
                      <TableCell>{selectedOption?.text || 'Not answered'}</TableCell>
                      <TableCell>{correctOption?.text}</TableCell>
                      <TableCell className="text-right">
                        {isCorrect ? (
                          <span className="text-green-600 font-medium">Correct</span>
                        ) : (
                          <span className="text-red-600 font-medium">Incorrect</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            <div className="mt-6 flex justify-center">
              <Button onClick={() => navigate('/participate')} className="bg-quiz-gradient">
                Back to Quizzes
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default TakeQuiz;
