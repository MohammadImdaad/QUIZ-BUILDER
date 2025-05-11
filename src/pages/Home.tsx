
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Lightbulb, Users } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {profile?.fullName || 'User'}!</h1>
          <p className="text-gray-600">What would you like to do today?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Quiz Card */}
          <div 
            onClick={() => navigate('/create-quiz')}
            className="quiz-card group"
          >
            <div className="bg-quiz-gradient bg-opacity-10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Lightbulb className="text-quiz-orange" />
            </div>
            <h2 className="text-xl font-semibold mb-2 group-hover:text-quiz-orange transition-colors">
              Create a Quiz
            </h2>
            <p className="text-gray-600 mb-4">
              Craft engaging quizzes with multiple question types and share them with others.
            </p>
            <div className="flex justify-end">
              <div className="text-sm font-medium text-quiz-teal">Get Started →</div>
            </div>
          </div>

          {/* Participate Quiz Card */}
          <div 
            onClick={() => navigate('/participate')}
            className="quiz-card group"
          >
            <div className="bg-quiz-gradient bg-opacity-10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Users className="text-quiz-orange" />
            </div>
            <h2 className="text-xl font-semibold mb-2 group-hover:text-quiz-orange transition-colors">
              Participate in a Quiz
            </h2>
            <p className="text-gray-600 mb-4">
              Join quizzes using a code and test your knowledge on various topics.
            </p>
            <div className="flex justify-end">
              <div className="text-sm font-medium text-quiz-teal">Join Now →</div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Web Development Basics</p>
                    <p className="text-sm text-gray-600">Created 2 days ago</p>
                  </div>
                  <div className="text-quiz-teal">24 participants</div>
                </div>
              </div>
              <div className="border-b pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Science Quiz</p>
                    <p className="text-sm text-gray-600">Attempted yesterday</p>
                  </div>
                  <div className="text-quiz-teal">Score: 80%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
