import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { ArrowLeft, Brain, Zap, Target, Box, BookOpen, Layers, Heart, Search, Filter, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Leaderboard from "@/components/Leaderboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TestResult {
  id: string;
  created_at: string;
  reaction_score: number;
  pattern_score: number;
  memory_score: number;
  spatial_score: number | null;
  verbal_score: number | null;
  multitask_score: number | null;
  personality_type: string;
}

interface FavoriteGame {
  id: string;
  game_id: string;
  games: {
    title: string;
    description: string;
    tags: string[];
  };
}

const Profile = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [favorites, setFavorites] = useState<FavoriteGame[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<FavoriteGame[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    if (!session?.user) return;

    setLoading(true);
    try {
      // Fetch test results
      const { data: results, error: resultsError } = await supabase
        .from("skill_tests")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (resultsError) throw resultsError;
      setTestResults(results || []);

      // Fetch favorites
      const { data: favs, error: favsError } = await supabase
        .from("user_favorites")
        .select(`
          id,
          game_id,
          games (
            title,
            description,
            tags
          )
        `)
        .eq("user_id", session.user.id);

      if (favsError) throw favsError;
      setFavorites(favs || []);
      setFilteredFavorites(favs || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "Could not load your profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = favorites;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (fav) =>
          fav.games.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fav.games.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tag
    if (selectedTag !== "all") {
      filtered = filtered.filter((fav) =>
        fav.games.tags.includes(selectedTag)
      );
    }

    setFilteredFavorites(filtered);
  }, [searchQuery, selectedTag, favorites]);

  const getAllTags = () => {
    const tags = new Set<string>();
    favorites.forEach((fav) => {
      fav.games.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  };

  const handleShareProfile = async () => {
    const latestTest = testResults[0];
    const shareText = latestTest 
      ? `Check out my Gaming DNA! I'm a ${latestTest.personality_type}! 🎮🧠`
      : `Check out my Gaming DNA profile! 🎮🧠`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Gaming DNA Profile",
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
      toast({
        title: "Copied to clipboard!",
        description: "Share your Gaming DNA profile with friends!",
      });
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("id", favoriteId);

      if (error) throw error;

      setFavorites(favorites.filter(f => f.id !== favoriteId));
      toast({
        title: "Removed",
        description: "Game removed from favorites",
      });
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast({
        title: "Error",
        description: "Could not remove favorite",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>

          {testResults.length > 0 && (
            <Button
              variant="outline"
              onClick={handleShareProfile}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share Profile
            </Button>
          )}
        </div>

        <h1 className="text-4xl font-bold text-foreground">Your Profile</h1>

        {/* Test History */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Test History</h2>
          {testResults.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No tests taken yet. Take your first test!</p>
              <Button
                onClick={() => navigate("/")}
                className="mt-4 bg-gradient-to-r from-primary to-secondary text-white"
              >
                Take Test
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {testResults.map((result) => (
                <Card key={result.id} className="p-6 bg-gradient-to-b from-card to-card/50 border-2 border-primary/20">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{result.personality_type}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(result.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-sm">Reaction: {Math.round(result.reaction_score)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-secondary" />
                      <span className="text-sm">Pattern: {Math.round(result.pattern_score)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-accent" />
                      <span className="text-sm">Memory: {Math.round(result.memory_score)}%</span>
                    </div>
                    {result.spatial_score && (
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-primary" />
                        <span className="text-sm">Spatial: {Math.round(result.spatial_score)}%</span>
                      </div>
                    )}
                    {result.verbal_score && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-secondary" />
                        <span className="text-sm">Verbal: {Math.round(result.verbal_score)}%</span>
                      </div>
                    )}
                    {result.multitask_score && (
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-accent" />
                        <span className="text-sm">Multitask: {Math.round(result.multitask_score)}%</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboards */}
        <Leaderboard />

        {/* Favorite Games */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Favorite Games</h2>
          
          {favorites.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No favorite games yet</p>
            </Card>
          ) : (
            <>
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search games..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {getAllTags().map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Games Grid */}
              {filteredFavorites.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No games match your search</p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredFavorites.map((fav) => (
                <Card key={fav.id} className="p-6 bg-gradient-to-b from-card to-card/50 border-2 border-primary/20">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-foreground">{fav.games.title}</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveFavorite(fav.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{fav.games.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {fav.games.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
