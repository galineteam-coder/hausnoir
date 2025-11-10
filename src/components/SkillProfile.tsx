import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkillScores } from "@/pages/Index";
import { Brain, Zap, Target, Sparkles, Share2, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SkillProfileProps {
  scores: SkillScores;
  onRestart: () => void;
}

interface Game {
  title: string;
  description: string;
  matchScore: number;
  tags: string[];
}

const SkillProfile = ({ scores, onRestart }: SkillProfileProps) => {
  const getPersonalityType = () => {
    const { reaction, pattern, memory } = scores;
    
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
    if (memory >= 70) return {
      name: "The Memory Champion",
      description: "Your memory skills are outstanding! You'll love games with rich stories and complex mechanics.",
      icon: "🎯📚",
    };
    
    return {
      name: "The Balanced Player",
      description: "You have a well-rounded cognitive profile. You can enjoy a wide variety of game types!",
      icon: "🌟🎮",
    };
  };

  const getRecommendedGames = (): Game[] => {
    const games: Game[] = [];
    const { reaction, pattern, memory } = scores;

    if (reaction >= 60) {
      games.push({
        title: "Rocket League",
        description: "Fast-paced car soccer requiring split-second decisions and quick reflexes.",
        matchScore: reaction,
        tags: ["Action", "Multiplayer", "Sports"],
      });
    }

    if (pattern >= 60) {
      games.push({
        title: "Portal 2",
        description: "Mind-bending puzzles that reward analytical thinking and spatial reasoning.",
        matchScore: pattern,
        tags: ["Puzzle", "Strategy", "Singleplayer"],
      });
    }

    if (memory >= 60) {
      games.push({
        title: "The Witness",
        description: "Exploration and puzzle game with interconnected mysteries to remember and solve.",
        matchScore: memory,
        tags: ["Puzzle", "Exploration", "Singleplayer"],
      });
    }

    if (reaction >= 50 && pattern >= 50) {
      games.push({
        title: "Overwatch 2",
        description: "Team-based shooter combining quick reflexes with strategic hero selection.",
        matchScore: Math.round((reaction + pattern) / 2),
        tags: ["Action", "Strategy", "Multiplayer"],
      });
    }

    if (memory >= 50 && pattern >= 50) {
      games.push({
        title: "Civilization VI",
        description: "Deep strategy game rewarding long-term planning and pattern recognition.",
        matchScore: Math.round((memory + pattern) / 2),
        tags: ["Strategy", "Singleplayer", "Turn-based"],
      });
    }

    return games.sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);
  };

  const personality = getPersonalityType();
  const recommendedGames = getRecommendedGames();

  return (
    <div className="min-h-screen bg-background p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary px-6 py-3 rounded-full text-white shadow-lg">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Your Skill DNA Profile</span>
          </div>
        </div>

        {/* Personality Type */}
        <Card className="p-8 text-center space-y-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-2 border-primary/20">
          <div className="text-6xl">{personality.icon}</div>
          <h2 className="text-3xl font-bold text-foreground">{personality.name}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{personality.description}</p>
        </Card>

        {/* Skill Breakdown */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4 bg-gradient-to-b from-card to-card/50 border-2 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Reaction Speed</h3>
                <p className="text-2xl font-bold text-primary">{Math.round(scores.reaction)}%</p>
              </div>
            </div>
            <Progress value={scores.reaction} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {scores.reaction >= 70 ? "Lightning fast!" : scores.reaction >= 50 ? "Quick reflexes!" : "Thoughtful player!"}
            </p>
          </Card>

          <Card className="p-6 space-y-4 bg-gradient-to-b from-card to-card/50 border-2 border-secondary/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/70 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Pattern Recognition</h3>
                <p className="text-2xl font-bold text-secondary">{Math.round(scores.pattern)}%</p>
              </div>
            </div>
            <Progress value={scores.pattern} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {scores.pattern >= 70 ? "Master analyst!" : scores.pattern >= 50 ? "Sharp thinker!" : "Creative mind!"}
            </p>
          </Card>

          <Card className="p-6 space-y-4 bg-gradient-to-b from-card to-card/50 border-2 border-accent/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/70 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Memory</h3>
                <p className="text-2xl font-bold text-accent">{Math.round(scores.memory)}%</p>
              </div>
            </div>
            <Progress value={scores.memory} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {scores.memory >= 70 ? "Incredible recall!" : scores.memory >= 50 ? "Strong memory!" : "In-the-moment!"}
            </p>
          </Card>
        </div>

        {/* Recommended Games */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-foreground">Games Perfect For You</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {recommendedGames.map((game, index) => (
              <Card
                key={index}
                className="p-6 space-y-4 bg-gradient-to-b from-card to-card/50 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xl font-bold text-foreground">{game.title}</h3>
                    <p className="text-muted-foreground">{game.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {game.matchScore}%
                    </div>
                    <div className="text-xs text-muted-foreground">Match</div>
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
            onClick={() => {
              // In a real app, this would share the profile
              alert("Sharing feature coming soon! 🎉");
            }}
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
