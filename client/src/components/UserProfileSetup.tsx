import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UserProfileSetupProps {
  email: string;
  onProfileComplete: (profile: any) => void;
}

const INSTITUTION_OPTIONS = [
  "Elementary School",
  "Middle School", 
  "High School",
  "Community College",
  "University",
  "Graduate School",
  "Professional Training",
  "Corporate Training",
  "Government Organization",
  "Non-profit Organization",
  "Self-studying",
  "Other",
  "Prefer not to say"
];

export default function UserProfileSetup({ email, onProfileComplete }: UserProfileSetupProps) {
  const [username, setUsername] = useState("");
  const [institution, setInstitution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  const validateUsername = (value: string) => {
    if (value.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (value.length > 30) {
      return "Username must be 30 characters or less";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    return "";
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setUsernameError(validateUsername(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateUsername(username);
    if (error) {
      setUsernameError(error);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest(
        "POST",
        "/api/user-profile",
        {
          email,
          username,
          institution: institution === "Prefer not to say" ? null : institution
        }
      );
      
      const profile = await response.json();
      
      toast({
        title: "Profile Created!",
        description: `Welcome, ${username}! Your profile has been set up successfully.`,
      });
      
      onProfileComplete(profile);
      
    } catch (error: any) {
      console.error("Profile setup error:", error);
      
      let errorMessage = "Failed to create profile. Please try again.";
      if (error.message.includes("Username is already taken")) {
        errorMessage = "This username is already taken. Please choose another.";
        setUsernameError("Username is already taken");
      }
      
      toast({
        title: "Setup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary-800">
            Complete Your Profile
          </CardTitle>
          <CardDescription>
            Set up your username and tell us about your institution to get started
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username *
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="Choose a username"
                className={usernameError ? "border-red-500" : ""}
                required
              />
              {usernameError && (
                <p className="text-sm text-red-600">{usernameError}</p>
              )}
              <p className="text-xs text-gray-600">
                This will be displayed when you share perspectives (not your email)
              </p>
            </div>

            {/* Institution Field */}
            <div className="space-y-2">
              <Label htmlFor="institution" className="text-sm font-medium">
                Institution Type
              </Label>
              <Select value={institution} onValueChange={setInstitution}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your institution type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {INSTITUTION_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-600">
                This helps us understand our user community (optional)
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !!usernameError || !username.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2">Setting up...</span>
                  <span className="material-icons animate-spin text-sm">refresh</span>
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>Your email: {email}</p>
            <p>This information can be updated later in your profile settings</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 