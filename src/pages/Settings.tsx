
import React from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { useToast } from '../components/ui/use-toast';

const Settings: React.FC = () => {
  const { toast } = useToast();
  
  const handleSaveSettings = () => {
    toast({
      title: "Success",
      description: "Settings saved successfully!",
    });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <Switch />
              </div>
              
              <div>
                <Button 
                  variant="outline" 
                  className="text-red-500 border-red-500 hover:bg-red-50"
                  onClick={() => {
                    toast({
                      title: "Info",
                      description: "Password reset email sent",
                    });
                  }}
                >
                  Change Password
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Public Profile</h3>
                  <p className="text-sm text-gray-500">Allow others to see your profile</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Show Quiz Results</h3>
                  <p className="text-sm text-gray-500">Show your quiz results to others</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Allow Quiz Invitations</h3>
                  <p className="text-sm text-gray-500">Allow others to invite you to quizzes</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Download all your quiz data and personal information</p>
              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Info",
                      description: "Preparing data download...",
                    });
                  }}
                >
                  Export Quiz Data
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Info",
                      description: "Preparing account data download...",
                    });
                  }}
                >
                  Export Account Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-red-500 mb-1">Delete Account</h3>
                <p className="text-sm text-gray-500 mb-3">Permanently delete your account and all data</p>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    toast({
                      title: "Warning",
                      description: "Account deletion is not implemented in this demo",
                      variant: "destructive",
                    });
                  }}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end mb-8">
          <Button 
            onClick={handleSaveSettings}
            className="bg-quiz-gradient"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
