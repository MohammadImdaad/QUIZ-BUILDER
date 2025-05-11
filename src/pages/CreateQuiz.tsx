
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../components/ui/use-toast';
import { Card, CardContent } from '../components/ui/card';
import { Plus, Trash2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface QuestionForm {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
}

const CreateQuiz: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<QuestionForm[]>([
    {
      id: `q_${Date.now()}`,
      text: '',
      options: [
        { id: `o_${Date.now()}_1`, text: '' },
        { id: `o_${Date.now()}_2`, text: '' },
      ],
      correctOptionId: '',
    },
  ]);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAddQuestion = () => {
    const newQuestion: QuestionForm = {
      id: `q_${Date.now()}`,
      text: '',
      options: [
        { id: `o_${Date.now()}_1`, text: '' },
        { id: `o_${Date.now()}_2`, text: '' },
      ],
      correctOptionId: '',
    };

    setQuestions([...questions, newQuestion]);
  };

  const handleRemoveQuestion = (questionId: string) => {
    if (questions.length <= 1) {
      toast({
        title: "Error",
        description: "Quiz must have at least one question",
        variant: "destructive",
      });
      return;
    }
    
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleQuestionChange = (questionId: string, text: string) => {
    setQuestions(
      questions.map(q => 
        q.id === questionId ? { ...q, text } : q
      )
    );
  };

  const handleAddOption = (questionId: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [
              ...q.options,
              { id: `o_${Date.now()}`, text: '' }
            ]
          };
        }
        return q;
      })
    );
  };

  const handleRemoveOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          if (q.options.length <= 2) {
            toast({
              title: "Error",
              description: "Question must have at least two options",
              variant: "destructive",
            });
            return q;
          }
          
          // If removing the correct option, reset correctOptionId
          const newCorrectOptionId = 
            q.correctOptionId === optionId ? '' : q.correctOptionId;
          
          return {
            ...q,
            options: q.options.filter(o => o.id !== optionId),
            correctOptionId: newCorrectOptionId,
          };
        }
        return q;
      })
    );
  };

  const handleOptionChange = (questionId: string, optionId: string, text: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map(o => 
              o.id === optionId ? { ...o, text } : o
            )
          };
        }
        return q;
      })
    );
  };

  const handleSetCorrectOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map(q => 
        q.id === questionId ? { ...q, correctOptionId: optionId } : q
      )
    );
  };

  const handleSubmit = async () => {
    // Validate quiz data
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Quiz title is required",
        variant: "destructive",
      });
      return;
    }

    // Validate questions
    for (const question of questions) {
      if (!question.text.trim()) {
        toast({
          title: "Error",
          description: "All questions must have text",
          variant: "destructive",
        });
        return;
      }

      if (!question.correctOptionId) {
        toast({
          title: "Error",
          description: "Each question must have a correct answer selected",
          variant: "destructive",
        });
        return;
      }

      for (const option of question.options) {
        if (!option.text.trim()) {
          toast({
            title: "Error",
            description: "All options must have text",
            variant: "destructive",
          });
          return;
        }
      }
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a quiz",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First, insert the quiz
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title,
          description,
          creator_id: user.id,
          is_public: isPublic,
        })
        .select()
        .single();

      if (quizError) {
        throw quizError;
      }

      const quizId = quizData.id;
      
      // Then, insert each question
      for (const question of questions) {
        const questionData = {
          quiz_id: quizId,
          question: question.text,
          type: 'multiple_choice',
          options: question.options,
          correct_answer: question.correctOptionId,
        };

        const { error: questionError } = await supabase
          .from('questions')
          .insert(questionData);

        if (questionError) {
          throw questionError;
        }
      }

      toast({
        title: "Success",
        description: "Quiz created successfully!",
      });

      navigate('/my-quizzes');
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create quiz",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create a New Quiz</h1>

        {/* Quiz Details Section */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Quiz Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter quiz title"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter quiz description"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center">
                <label className="block text-sm font-medium mr-2">
                  Quiz Visibility
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="visibility"
                      checked={isPublic}
                      onChange={() => setIsPublic(true)}
                      className="mr-1"
                      disabled={isSubmitting}
                    />
                    <span>Public</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="visibility"
                      checked={!isPublic}
                      onChange={() => setIsPublic(false)}
                      className="mr-1"
                      disabled={isSubmitting}
                    />
                    <span>Private</span>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Questions</h2>
            <Button 
              onClick={handleAddQuestion}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isSubmitting}
            >
              <Plus size={16} />
              Add Question
            </Button>
          </div>

          {questions.map((question, qIndex) => (
            <Card key={question.id} className="mb-6">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium">Question {qIndex + 1}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveQuestion(question.id)}
                    disabled={isSubmitting}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                </div>

                <div className="mb-4">
                  <Input
                    value={question.text}
                    onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                    placeholder="Enter question text"
                    className="mb-2"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-medium">Options</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddOption(question.id)}
                      className="text-sm"
                      disabled={isSubmitting}
                    >
                      <Plus size={14} className="mr-1" />
                      Add Option
                    </Button>
                  </div>

                  {question.options.map((option) => (
                    <div key={option.id} className="flex items-center gap-3">
                      <input
                        type="radio"
                        id={option.id}
                        name={`correct_${question.id}`}
                        checked={question.correctOptionId === option.id}
                        onChange={() => handleSetCorrectOption(question.id, option.id)}
                        className="h-4 w-4 text-quiz-teal"
                        disabled={isSubmitting}
                      />
                      <Input
                        value={option.text}
                        onChange={(e) => handleOptionChange(question.id, option.id, e.target.value)}
                        placeholder="Enter option text"
                        className="flex-1"
                        disabled={isSubmitting}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOption(question.id, option.id)}
                        disabled={isSubmitting}
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <div className="text-xs text-gray-500">Select the radio button for the correct answer</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end mb-8">
          <Button 
            onClick={handleSubmit}
            className="bg-quiz-gradient flex items-center gap-2"
            disabled={isSubmitting}
          >
            <Save size={16} />
            {isSubmitting ? "Saving Quiz..." : "Save Quiz"}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default CreateQuiz;
