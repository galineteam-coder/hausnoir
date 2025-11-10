import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  created_at: string;
}

const Leaderboard = () => {
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({});
  const [loading, setLoading] = useState(true);

  const gameTypes = [
    { id: "reaction", name: "Reaction Speed", icon: "⚡" },
    { id: "pattern", name: "Pattern Recognition", icon: "🧩" },
    { id: "memory", name: "Memory", icon: "🎯" },
    { id: "spatial", name: "Spatial Reasoning", icon: "📐" },
    { id: "verbal", name: "Verbal Skills", icon: "📚" },
    { id: "multitask", name: "Multitasking", icon: "🔀" },
  ];

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    setLoading(true);
    try {
      const allLeaderboards: Record<string, LeaderboardEntry[]> = {};

      for (const gameType of gameTypes) {
        const { data, error } = await supabase
          .from("leaderboard")
          .select("id, username, score, created_at")
          .eq("game_type", gameType.id)
          .order("score", { ascending: false })
          .limit(10);

        if (error) throw error;
        allLeaderboards[gameType.id] = data || [];
      }

      setLeaderboards(allLeaderboards);
    } catch (error) {
      console.error("Error fetching leaderboards:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-700" />;
    return <span className="text-muted-foreground">#{rank}</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-foreground">Leaderboards</h2>
      
      <Tabs defaultValue="reaction" className="w-full">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6">
          {gameTypes.map((type) => (
            <TabsTrigger key={type.id} value={type.id} className="text-xs sm:text-sm">
              <span className="mr-1">{type.icon}</span>
              <span className="hidden sm:inline">{type.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {gameTypes.map((type) => (
          <TabsContent key={type.id} value={type.id}>
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 text-foreground">
                {type.icon} {type.name} Top 10
              </h3>
              
              {leaderboards[type.id]?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No scores yet. Be the first!
                </p>
              ) : (
                <div className="space-y-2">
                  {leaderboards[type.id]?.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-muted/50 to-transparent hover:from-primary/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 flex justify-center">
                          {getRankIcon(index + 1)}
                        </div>
                        <span className="font-semibold text-foreground">
                          {entry.username || "Anonymous"}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {Math.round(entry.score)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Leaderboard;
