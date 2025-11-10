import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkillScores } from "@/pages/Index";
import { Brain, Zap, Target, Sparkles, Share2, RotateCcw, Box, BookOpen, Layers, Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SkillProfileProps {
  scores: SkillScores;
  onRestart: () => void;
  session: Session | null;
}

interface Game {
  title: string;
  description: string;
  matchScore: number;
  tags: string[];
  imageUrl?: string;
}

const SkillProfile = ({ scores, onRestart, session }: SkillProfileProps) => {
  const [recommendedGames, setRecommendedGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saveAndFetchRecommendations = async () => {
      setLoading(true);

      // Save test results if user is logged in
      if (session?.user) {
        try {
          setIsSaving(true);
          const { error } = await supabase.from("skill_tests").insert({
            user_id: session.user.id,
            reaction_score: scores.reaction,
            pattern_score: scores.pattern,
            memory_score: scores.memory,
            spatial_score: scores.spatial || null,
            verbal_score: scores.verbal || null,
            multitask_score: scores.multitask || null,
            personality_type: getPersonalityType().name,
          });

          if (error) {
            console.error("Error saving test results:", error);
            toast({
              title: "Save failed",
              description: "Couldn't save your results, but you can still see recommendations!",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Results saved!",
              description: "Your Skill DNA has been saved to your profile.",
            });
          }
        } catch (error) {
          console.error("Error saving results:", error);
        } finally {
          setIsSaving(false);
        }
      }

      // Fetch TasteRay recommendations
      try {
        const { data, error } = await supabase.functions.invoke("get-game-recommendations", {
          body: { skillScores: scores },
        });

        if (error) throw error;

        if (data?.recommendations) {
          setRecommendedGames(data.recommendations);
        } else {
          setRecommendedGames(getFallbackRecommendations());
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setRecommendedGames(getFallbackRecommendations());
      } finally {
        setLoading(false);
      }
    };

    saveAndFetchRecommendations();
  }, [scores, session]);

  const getPersonalityType = () => {
    const { reaction, pattern, memory, spatial, verbal, multitask } = scores;
    
    // Enhanced personality types considering all 6 skills
    if (reaction >= 70 && pattern >= 70 && (multitask || 0) >= 70) return {
      name: "The Strategic Commander",
      description: "Lightning reflexes, sharp analysis, and excellent multitasking. You dominate in competitive strategy games.",
      icon: "⚡🧠🎯",
    };
    
    if ((spatial || 0) >= 70 && pattern >= 70) return {
      name: "The Spatial Genius",
      description: "You excel at visualizing complex 3D spaces and patterns. Perfect for puzzle platformers and navigation challenges.",
      icon: "🎯🧩📐",
    };
    
    if ((verbal || 0) >= 70 && memory >= 70) return {
      name: "The Story Master",
      description: "Your language skills and memory make you perfect for narrative-rich RPGs and text adventures.",
      icon: "📚🎭💭",
    };
    
    if (reaction >= 70 && pattern >= 70) return {
      name: "The Quick Strategist",
      description: "You combine lightning-fast reflexes with sharp analytical thinking. You thrive in fast-paced tactical games.",
      icon: "⚡🧠",
    };
    
    if (memory >= 70 && pattern >= 70) return {
      name: "The Pattern Master",
      description: "You excel at spotting connections and remembering complex information. Perfect for puzzle and strategy games.",
      icon: "🎯🧩",
    };
    
    if (reaction >= 70) return {
      name: "The Reflex Champion",
      description: "Your reaction speed is impressive! You'll excel in action-packed, fast-paced gaming experiences.",
      icon: "⚡🎮",
    };
    
    if (pattern >= 70) return {
      name: "The Analytical Thinker",
      description: "You have a gift for understanding patterns and systems. Strategy and puzzle games are your playground.",
      icon: "🧠💡",
    };
    
    return {
      name: "The Balanced Player",
      description: "You have a well-rounded cognitive profile. You can enjoy a wide variety of game types!",
      icon: "🌟🎮",
    };
  };

  const getFallbackRecommendations = (): Game[] => {
    const games: Game[] = [];
    const { reaction, pattern, memory, spatial, verbal, multitask } = scores;

    if (reaction >= 60) {
      games.push({
        title: "Rocket League",
        description: "Fast-paced car soccer requiring split-second decisions",
        matchScore: reaction,
        tags: ["Action", "Multiplayer", "Sports"],
      });
    }

    if (pattern >= 60) {
      games.push({
        title: "Portal 2",
        description: "Mind-bending puzzles rewarding analytical thinking",
        matchScore: pattern,
        tags: ["Puzzle", "Strategy"],
      });
    }

    if (memory >= 60) {
      games.push({
        title: "The Witness",
        description: "Exploration puzzle game with interconnected mysteries",
        matchScore: memory,
        tags: ["Puzzle", "Exploration"],
      });
    }

    if ((spatial || 0) >= 60) {
      games.push({
        title: "Antichamber",
        description: "Mind-bending spatial puzzle game",
        matchScore: spatial || 0,
        tags: ["Puzzle", "First-Person"],
      });
    }

    if ((verbal || 0) >= 60) {
      games.push({
        title: "Disco Elysium",
        description: "Narrative-heavy RPG with exceptional writing",
        matchScore: verbal || 0,
        tags: ["RPG", "Story-Rich"],
      });
    }

    if ((multitask || 0) >= 60) {
      games.push({
        title: "Factorio",
        description: "Complex automation and resource management",
        matchScore: multitask || 0,
        tags: ["Strategy", "Simulation"],
      });
    }

    return games.sort((a, b) => b.matchScore - a.matchScore).slice(0, 6);
  };

  const handleShare = async () => {
    const shareText = `I just discovered my Gaming DNA! I'm a ${getPersonalityType().name}! Find out yours at GameDNA 🎮🧠`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Gaming DNA Profile",
          text: shareText,
          url: window.location.origin,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText} ${window.location.origin}`);
      toast({
        title: "Copied to clipboard!",
        description: "Share your Gaming DNA with friends!",
      });
    }
  };

  const handleSaveFavorite = async (gameTitle: string) => {
    if (!session?.user) {
      toast({
        title: "Sign in required",
        description: "Create an account to save favorite games!",
        variant: "destructive",
      });
      return;
    }

    try {
      // Find or create the game
      const { data: existingGame, error: findError } = await supabase
        .from("games")
        .select("id")
        .eq("title", gameTitle)
        .maybeSingle();

      if (findError) throw findError;

      let gameId = existingGame?.id;

      // If game doesn't exist, create it
      if (!gameId) {
        const gameData = recommendedGames.find(g => g.title === gameTitle);
        if (!gameData) return;

        const { data: newGame, error: createError } = await supabase
          .from("games")
          .insert({
            title: gameData.title,
            description: gameData.description,
            tags: gameData.tags,
            cognitive_profile: {},
          })
          .select("id")
          .single();

        if (createError) throw createError;
        gameId = newGame.id;
      }

      // Check if already favorited
      const { data: existingFav } = await supabase
        .from("user_favorites")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("game_id", gameId)
        .maybeSingle();

      if (existingFav) {
        // Remove from favorites
        const { error: deleteError } = await supabase
          .from("user_favorites")
          .delete()
          .eq("id", existingFav.id);

        if (deleteError) throw deleteError;

        toast({
          title: "Removed from favorites",
          description: `${gameTitle} has been removed from your favorites`,
        });
      } else {
        // Add to favorites
        const { error: insertError } = await supabase
          .from("user_favorites")
          .insert({
            user_id: session.user.id,
            game_id: gameId,
          });

        if (insertError) throw insertError;

        toast({
          title: "Added to favorites!",
          description: `${gameTitle} has been added to your favorites`,
        });
      }
    } catch (error) {
      console.error("Error saving favorite:", error);
      toast({
        title: "Error",
        description: "Could not save favorite",
        variant: "destructive",
      });
    }
  };

  const personality = getPersonalityType();

  return (
    <div className="min-h-screen bg-background p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary px-6 py-3 rounded-full text-white shadow-lg">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">
              {session ? "Your Skill DNA Profile" : "Your Skill DNA Profile (Sign in to save!)"}
            </span>
          </div>
        </div>

        {/* Personality Type */}
        <Card className="p-8 text-center space-y-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-2 border-primary/20">
          <div className="text-6xl">{personality.icon}</div>
          <h2 className="text-3xl font-bold text-foreground">{personality.name}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{personality.description}</p>
        </Card>

        {/* Skill Breakdown */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6 space-y-4 bg-gradient-to-b from-card to-card/50 border-2 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Reaction Speed</h3>
                <p className="text-2xl font-bold text-primary">{Math.round(scores.reaction)}%</p>
              </div>
            </div>
            <Progress value={scores.reaction} className="h-2" />
          </Card>

          <Card className="p-6 space-y-4 bg-gradient-to-b from-card to-card/50 border-2 border-secondary/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/70 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Pattern Recognition</h3>
                <p className="text-2xl font-bold text-secondary">{Math.round(scores.pattern)}%</p>
              </div>
            </div>
            <Progress value={scores.pattern} className="h-2" />
          </Card>

          <Card className="p-6 space-y-4 bg-gradient-to-b from-card to-card/50 border-2 border-accent/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/70 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Memory</h3>
                <p className="text-2xl font-bold text-accent">{Math.round(scores.memory)}%</p>
              </div>
            </div>
            <Progress value={scores.memory} className="h-2" />
          </Card>

          {scores.spatial !== undefined && (
            <Card className="p-6 space-y-4 bg-gradient-to-b from-card to-card/50 border-2 border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center">
                  <Box className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">Spatial Reasoning</h3>
                  <p className="text-2xl font-bold text-primary">{Math.round(scores.spatial)}%</p>
                </div>
              </div>
              <Progress value={scores.spatial} className="h-2" />
            </Card>
          )}

          {scores.verbal !== undefined && (
            <Card className="p-6 space-y-4 bg-gradient-to-b from-card to-card/50 border-2 border-secondary/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">Verbal Skills</h3>
                  <p className="text-2xl font-bold text-secondary">{Math.round(scores.verbal)}%</p>
                </div>
              </div>
              <Progress value={scores.verbal} className="h-2" />
            </Card>
          )}

          {scores.multitask !== undefined && (
            <Card className="p-6 space-y-4 bg-gradient-to-b from-card to-card/50 border-2 border-accent/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">Multitasking</h3>
                  <p className="text-2xl font-bold text-accent">{Math.round(scores.multitask)}%</p>
                </div>
              </div>
              <Progress value={scores.multitask} className="h-2" />
            </Card>
          )}
        </div>

        {/* Recommended Games */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-foreground">
            {loading ? "Finding Your Perfect Games..." : "Games Perfect For You"}
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {recommendedGames.map((game, index) => (
                <Card
                  key={index}
                  className="p-6 space-y-4 bg-gradient-to-b from-card to-card/50 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <h3 className="text-xl font-bold text-foreground">{game.title}</h3>
                      <p className="text-muted-foreground text-sm">{game.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          {game.matchScore}%
                        </div>
                        <div className="text-xs text-muted-foreground">Match</div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSaveFavorite(game.title)}
                        className="h-8 w-8 p-0"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {game.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            variant="outline"
            onClick={onRestart}
            className="px-8 rounded-full border-2 hover:bg-muted"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Take Test Again
          </Button>
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary text-white px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share My Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SkillProfile;
