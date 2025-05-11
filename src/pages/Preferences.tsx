
import React from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';

const Preferences: React.FC = () => {
  const { profile } = useAuth();

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Preferences</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" defaultValue={profile?.fullName || ''} />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue={profile?.username || ''} disabled />
                <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" defaultValue={profile?.country || ''} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue={profile?.email || ''} type="email" />
              </div>
              <div>
                <Label htmlFor="contact">Contact Number</Label>
                <Input id="contact" defaultValue={profile?.contact || ''} />
              </div>
              <Button className="bg-quiz-gradient">Update Profile</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Quiz Invitations</h3>
                  <p className="text-sm text-gray-500">Get notified when you're invited to join a quiz</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Quiz Results</h3>
                  <p className="text-sm text-gray-500">Get notified when quiz results are available</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Quiz Activity</h3>
                  <p className="text-sm text-gray-500">Get notified about activity in your quizzes</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quiz Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Show Timer</h3>
                  <p className="text-sm text-gray-500">Display countdown timer during quizzes</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Show Correct Answers</h3>
                  <p className="text-sm text-gray-500">Show correct answers after quiz completion</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Dark Mode</h3>
                  <p className="text-sm text-gray-500">Use dark theme for quiz interface</p>
                </div>
                <Switch />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Preferences;
