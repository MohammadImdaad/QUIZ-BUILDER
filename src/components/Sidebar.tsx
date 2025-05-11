
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, LayoutDashboard, BookOpen, Settings, User, LogOut } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, profile } = useAuth();

  const navItems = [
    { label: 'Home', icon: <Home size={20} />, path: '/home' },
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { label: 'My Quizzes', icon: <BookOpen size={20} />, path: '/my-quizzes' },
    { label: 'Preferences', icon: <User size={20} />, path: '/preferences' },
    { label: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="h-screen bg-quiz-gradient text-white w-64 flex flex-col py-6">
      <div className="px-6 mb-8">
        <h1 className="text-2xl font-bold">QuizCraft</h1>
        <p className="text-sm opacity-80">Build beautiful quizzes</p>
      </div>
      
      <div className="flex items-center px-6 mb-8 gap-4">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
          <span className="text-quiz-orange font-bold text-lg">{profile?.fullName.charAt(0) || 'U'}</span>
        </div>
        <div>
          <h3 className="font-medium">{profile?.fullName || 'User'}</h3>
          <p className="text-xs opacity-80">{profile?.username || '@user'}</p>
        </div>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2 px-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-white bg-opacity-20'
                    : 'hover:bg-white hover:bg-opacity-10'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="px-6 mt-auto">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 text-white opacity-80 hover:opacity-100 transition-opacity"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
