import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../lib/auth';
import { supabase } from '../../../lib/supabase-client';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Users,
  ArrowLeft,
  BookOpen
} from 'lucide-react';

export default function JoinClass() {
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Handle input change - auto-uppercase and validate
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    // Only allow alphanumeric characters
    const filtered = value.replace(/[^A-Z0-9]/g, '');
    // Limit to 6 characters
    setClassCode(filtered.slice(0, 6));
    // Clear error when user types
    if (error) setError(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate class code length
    if (classCode.length !== 6) {
      setError('Class code must be exactly 6 characters');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('You must be logged in to join a class');
      }
      
      // Make API request
      const response = await fetch('/api/student?action=join-class', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          class_code: classCode
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to join class');
      }
      
      // Success!
      toast({
        title: "Successfully Joined Class! 🎉",
        description: data.message || `You've been enrolled in ${data.class?.name}`,
      });
      
      // Navigate to dashboard with classes tab selected
      navigate('/dashboard?tab=classes');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      toast({
        title: "Failed to Join Class",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if code is valid
  const isCodeValid = classCode.length === 6;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Login Required
              </h3>
              <p className="text-gray-600 mb-4">
                Please log in to join a class
              </p>
              <Button onClick={() => navigate('/')}>
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="max-w-md mx-auto mb-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Main Card */}
      <Card className="max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <BookOpen className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Join a Class</CardTitle>
          <CardDescription className="text-center">
            Enter the 6-character class code provided by your teacher
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Class Code Input */}
            <div className="space-y-2">
              <Label htmlFor="classCode" className="text-sm font-medium">
                Class Code
              </Label>
              <div className="relative">
                <Input
                  id="classCode"
                  type="text"
                  placeholder="ABC123"
                  value={classCode}
                  onChange={handleInputChange}
                  maxLength={6}
                  className={`text-center text-2xl font-mono tracking-widest uppercase ${
                    error ? 'border-red-500' : ''
                  } ${isCodeValid ? 'border-green-500' : ''}`}
                  disabled={loading}
                  autoFocus
                  required
                  aria-describedby={error ? "code-error" : "code-help"}
                />
                {isCodeValid && !loading && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
              </div>
              
              {/* Helper Text */}
              <p id="code-help" className="text-sm text-gray-500 flex items-center gap-1">
                <span>{classCode.length}/6 characters</span>
                {classCode.length > 0 && classCode.length < 6 && (
                  <span className="text-amber-600">• Keep typing...</span>
                )}
                {isCodeValid && (
                  <span className="text-green-600 font-medium">• Ready!</span>
                )}
              </p>

              {/* Error Message */}
              {error && (
                <div 
                  id="code-error"
                  className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md"
                  role="alert"
                >
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full"
              disabled={!isCodeValid || loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Joining Class...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-5 w-5" />
                  Join Class
                </>
              )}
            </Button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              💡 Need help?
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ask your teacher for the class code</li>
              <li>• Class codes are 6 characters (letters and numbers)</li>
              <li>• Codes are not case-sensitive</li>
            </ul>
          </div>

          {/* Links */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              View My Classes
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/tutorial/user')}
              className="flex-1"
            >
              Tutorial
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Info */}
      <div className="max-w-md mx-auto mt-8 text-center text-sm text-gray-600">
        <p>
          Don't have a class code yet? Contact your teacher to get started.
        </p>
      </div>
    </div>
  );
}

