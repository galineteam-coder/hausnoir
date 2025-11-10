import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ReactionGame from "./games/ReactionGame";
import PatternGame from "./games/PatternGame";
import MemoryGame from "./games/MemoryGame";
import SpatialGame from "./games/SpatialGame";
import VerbalGame from "./games/VerbalGame";
import MultitaskGame from "./games/MultitaskGame";
import { SkillScores } from "@/pages/Index";
import { Sparkles } from "lucide-react";

interface MicroGamesTestProps {
  onComplete: (scores: SkillScores) => void;
}

type GameType = "intro" | "reaction" | "pattern" | "memory" | "spatial" | "verbal" | "multitask" | "processing";

const MicroGamesTest = ({ onComplete }: MicroGamesTestProps) => {
  const [currentGame, setCurrentGame] = useState<GameType>("intro");
  const [scores, setScores] = useState<SkillScores>({
    reaction: 0,
    pattern: 0,
    memory: 0,
    spatial: 0,
    verbal: 0,
    multitask: 0,
  });
  const [gameIndex, setGameIndex] = useState(0);

  const games: GameType[] = ["intro", "reaction", "pattern", "memory", "spatial", "verbal", "multitask", "processing"];
  const progress = (gameIndex / (games.length - 1)) * 100;

  const handleGameComplete = (score: number) => {
    if (currentGame === "reaction") {
      setScores((prev) => ({ ...prev, reaction: score }));
      nextGame();
    } else if (currentGame === "pattern") {
      setScores((prev) => ({ ...prev, pattern: score }));
      nextGame();
    } else if (currentGame === "memory") {
      setScores((prev) => ({ ...prev, memory: score }));
      nextGame();
    } else if (currentGame === "spatial") {
      setScores((prev) => ({ ...prev, spatial: score }));
      nextGame();
    } else if (currentGame === "verbal") {
      setScores((prev) => ({ ...prev, verbal: score }));
      nextGame();
    } else if (currentGame === "multitask") {
      setScores((prev) => ({ ...prev, multitask: score }));
      nextGame();
    }
  };

  const nextGame = () => {
    const nextIndex = gameIndex + 1;
    if (nextIndex < games.length) {
      setGameIndex(nextIndex);
      setCurrentGame(games[nextIndex]);
    }
  };

  useEffect(() => {
    if (currentGame === "processing") {
      const timer = setTimeout(() => {
        onComplete(scores);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentGame, scores, onComplete]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Your Brain Test</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Game Content */}
        <Card className="p-8 md:p-12 bg-gradient-to-b from-card to-card/50 border-2 border-primary/20 shadow-xl">
          {currentGame === "intro" && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Let's Discover Your Skills!</h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                You'll play 6 quick mini-games. There are no wrong answers — just be yourself and have fun!
              </p>
              <div className="space-y-3 text-left max-w-md mx-auto">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <p className="text-muted-foreground">Each game takes about 30 seconds</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2" />
                  <p className="text-muted-foreground">Play naturally — no need to overthink</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                  <p className="text-muted-foreground">We celebrate every type of brain!</p>
                </div>
              </div>
              <Button
                size="lg"
                onClick={nextGame}
                className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                I'm Ready!
              </Button>
            </div>
          )}

          {currentGame === "reaction" && <ReactionGame onComplete={handleGameComplete} />}
          {currentGame === "pattern" && <PatternGame onComplete={handleGameComplete} />}
          {currentGame === "memory" && <MemoryGame onComplete={handleGameComplete} />}
          {currentGame === "spatial" && <SpatialGame onComplete={handleGameComplete} />}
          {currentGame === "verbal" && <VerbalGame onComplete={handleGameComplete} />}
          {currentGame === "multitask" && <MultitaskGame onComplete={handleGameComplete} />}

          {currentGame === "processing" && (
            <div className="text-center space-y-6 py-8">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-full animate-spin" style={{ animationDuration: "2s" }} />
                <div className="absolute inset-2 bg-card rounded-full flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Analyzing Your Skill DNA...</h2>
              <p className="text-lg text-muted-foreground">This is going to be amazing! ✨</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MicroGamesTest;
