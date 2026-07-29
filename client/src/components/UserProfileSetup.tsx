import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../lib/auth';

interface UserProfileSetupProps {
  open: boolean;
  onComplete?: () => void;
}

export default function UserProfileSetup({ open, onComplete }: UserProfileSetupProps) {
  const { user, createUserProfile } = useAuth();
  const [username, setUsername] = useState(
    user?.user_metadata?.username || user?.email?.split('@')[0]?.replace(/[^a-zA-Z0-9_]/g, '_') || ''
  );
  const [institution, setInstitution] = useState(
    user?.user_metadata?.institution_name || ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(trimmed)) {
      setError('Username must be 3–30 characters (letters, numbers, underscores).');
      return;
    }

    setLoading(true);
    setError(null);
    const { error: createError } = await createUserProfile(trimmed, institution.trim() || undefined);
    setLoading(false);

    if (createError) {
      setError(createError.message || 'Failed to create profile');
      return;
    }

    onComplete?.();
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Finish setting up your profile</DialogTitle>
          <DialogDescription>
            Choose a username so your perspectives and classroom activity can be attributed correctly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="setup-username">Username *</Label>
            <Input
              id="setup-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="setup-institution">Institution (optional)</Label>
            <Input
              id="setup-institution"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="School or organization"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
