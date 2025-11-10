import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Grid3x3 } from "lucide-react";

interface PatternGameProps {
  onComplete: (score: number) => void;
}

const PatternGame = ({ onComplete }: PatternGameProps) => {
  const [stage, setStage] = useState<"intro" | "showing" | "playing" | "results">("intro");
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [currentShowIndex, setCurrentShowIndex] = useState(0);
  const maxRounds = 5;

  const generatePattern = (length: number) => {
    return Array.from({ length }, () => Math.floor(Math.random() * 16));
  };

  const startRound = () => {
    const patternLength = round + 3; // Start with 4, increase each round
    const newPattern = generatePattern(patternLength);
    setPattern(newPattern);
    setUserPattern([]);
    setCurrentShowIndex(0);
    setStage("showing");
  };

  useEffect(() => {
    if (stage === "showing" && currentShowIndex < pattern.length) {
      const timer = setTimeout(() => {
        setCurrentShowIndex(currentShowIndex + 1);
      }, 700);
      return () => clearTimeout(timer);
    } else if (stage === "showing" && currentShowIndex >= pattern.length) {
      setTimeout(() => {
        setStage("playing");
      }, 500);
    }
  }, [stage, currentShowIndex, pattern.length]);

  const handleCellClick = (index: number) => {
    if (stage !== "playing") return;

    const newUserPattern = [...userPattern, index];
    setUserPattern(newUserPattern);

    // Check if current click is wrong
    const currentIndex = newUserPattern.length - 1;
    if (newUserPattern[currentIndex] !== pattern[currentIndex]) {
      // Wrong click - no points for this round
      if (round >= maxRounds) {
        setStage("results");
        setTimeout(() => onComplete(score), 1500);
      } else {
        setRound(round + 1);
        setTimeout(startRound, 1000);
      }
      return;
    }

    // Check if pattern completed successfully
    if (newUserPattern.length === pattern.length) {
      const newScore = score + 20;
      setScore(newScore);

      if (round >= maxRounds) {
        setStage("results");
        setTimeout(() => onComplete(newScore), 1500);
      } else {
        setRound(round + 1);
        setTimeout(startRound, 1000);
      }
    }
  };

  return (
    <div className="text-center space-y-6">
      {stage === "intro" && (
        <>
          <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/70 rounded-2xl flex items-center justify-center mx-auto">
            <Grid3x3 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Pattern Recognition</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Watch the pattern light up, then repeat it! The patterns get longer each round.
          </p>
          <Button
            size="lg"
            onClick={startRound}
            className="bg-secondary text-white px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Start Test
          </Button>
        </>
      )}

      {(stage === "showing" || stage === "playing") && (
        <div className="space-y-4">
          <p className="text-lg font-semibold text-foreground">
            {stage === "showing" ? "Watch carefully..." : "Repeat the pattern!"}
          </p>
          <p className="text-sm text-muted-foreground">
            Round {round} of {maxRounds} • Pattern length: {pattern.length}
          </p>
          <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
            {Array.from({ length: 16 }).map((_, index) => {
              const isCurrentlyShowing = stage === "showing" && currentShowIndex > 0 && pattern[currentShowIndex - 1] === index;
              const wasClicked = userPattern.includes(index);
              const isCorrectClick = wasClicked && userPattern.indexOf(index) < pattern.length && pattern[userPattern.indexOf(index)] === index;
              const isWrongClick = wasClicked && !isCorrectClick;
              
              return (
                <button
                  key={index}
                  onClick={() => handleCellClick(index)}
                  disabled={stage === "showing"}
                  className={`aspect-square rounded-lg transition-all duration-200 ${
                    isCurrentlyShowing
                      ? "bg-gradient-to-br from-secondary to-secondary/70 scale-110 shadow-lg"
                      : isWrongClick
                      ? "bg-red-500/60 scale-95"
                      : isCorrectClick
                      ? "bg-green-500/40 scale-95"
                      : "bg-muted hover:bg-primary/20"
                  } ${stage === "playing" ? "cursor-pointer" : "cursor-not-allowed"}`}
                />
              );
            })}
          </div>
        </div>
      )}

      {stage === "results" && (
        <div className="py-8 space-y-4">
          <div className="w-32 h-32 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center mx-auto animate-pulse">
            <span className="text-4xl">🧠</span>
          </div>
          <p className="text-2xl font-bold text-foreground">Sharp Mind!</p>
          <p className="text-lg text-muted-foreground">Score: {score}%</p>
        </div>
      )}
    </div>
  );
};

export default PatternGame;
