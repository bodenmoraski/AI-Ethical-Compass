import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Trophy, Medal, Award, Brain, Heart, Sparkles, Users, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  id: number;
  user_email: string;
  username: string;
  category: string;
  score: number;
  rank_position: number;
  metrics: {
    perspectives_count: number;
    avg_quality_score: number;
    likes_received: number;
    scenarios_created: number;
    helpful_ratings: number;
    quality_scores: number[];
  };
  period_start: string;
  period_end: string;
}

interface Achievement {
  type: string;
  name: string;
  description: string;
  icon: string;
  levels: {
    bronze: { threshold: number; description: string };
    silver: { threshold: number; description: string };
    gold: { threshold: number; description: string };
    platinum: { threshold: number; description: string };
  };
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all_time');

  useEffect(() => {
    fetchLeaderboard();
    fetchAchievements();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`/api/leaderboard?period=${period}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      const achievementsResponse = await fetch('/api/achievements');
      if (achievementsResponse.ok) {
        const achievementDefs = await achievementsResponse.json();
        setAchievements(achievementDefs);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const recalculateLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard', { method: 'POST' });
      if (response.ok) {
        fetchLeaderboard();
      }
    } catch (error) {
      console.error('Error recalculating leaderboard:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Community Leaderboard</h1>
          <p className="text-gray-600">
            Recognizing thoughtful contributors who make our community better through quality ethical reasoning.
          </p>
        </div>

        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="leaderboard">Rankings</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="leaderboard" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <Button
                  variant={period === 'all_time' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod('all_time')}
                >
                  All Time
                </Button>
                <Button
                  variant={period === 'monthly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod('monthly')}
                >
                  This Month
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={recalculateLeaderboard}
              >
                Refresh Rankings
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading leaderboard...</div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No rankings available yet. Start contributing to appear on the leaderboard!
              </div>
            ) : (
              <div>
                {leaderboard.map((entry) => (
                  <Card key={entry.id} className="mb-4">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center">
                            {getRankIcon(entry.rank_position)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{entry.username}</h3>
                            <p className="text-sm text-gray-600">
                              {entry.metrics.perspectives_count} perspectives • 
                              {entry.metrics.scenarios_created} scenarios created
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{entry.score}</div>
                          <div className="text-sm text-gray-500">points</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Available Achievements</h2>
              <p className="text-gray-600">
                Earn badges by demonstrating different aspects of ethical reasoning and community participation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <Card key={achievement.type} className="p-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">{achievement.icon}</div>
                    <h3 className="font-semibold text-sm">{achievement.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                  </div>
                </Card>
              ))}
            </div>

            {achievements.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Loading achievements...
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 