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
  const maxRounds = 4;

  const generatePattern = (length: number) => {
    return Array.from({ length }, () => Math.floor(Math.random() * 9));
  };

  const startRound = () => {
    const newPattern = generatePattern(round + 2); // Start with 3, increase each round
    setPattern(newPattern);
    setUserPattern([]);
    setStage("showing");

    setTimeout(() => {
      setStage("playing");
    }, (newPattern.length + 1) * 600);
  };

  const handleCellClick = (index: number) => {
    if (stage !== "playing") return;

    const newUserPattern = [...userPattern, index];
    setUserPattern(newUserPattern);

    if (newUserPattern.length === pattern.length) {
      const correct = pattern.every((val, i) => val === newUserPattern[i]);
      const newScore = score + (correct ? 25 : 0);
      setScore(newScore);

      if (round >= maxRounds) {
        setStage("results");
        setTimeout(() => onComplete(newScore), 1500);
      } else {
        setRound(round + 1);
        setTimeout(startRound, 1500);
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
            {stage === "showing" ? "Watch carefully..." : "Now you try!"}
          </p>
          <p className="text-sm text-muted-foreground">Round {round} of {maxRounds}</p>
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
            {Array.from({ length: 9 }).map((_, index) => {
              const isShowing = stage === "showing" && pattern[userPattern.length] === index;
              const wasClicked = userPattern.includes(index);
              return (
                <button
                  key={index}
                  onClick={() => handleCellClick(index)}
                  disabled={stage === "showing"}
                  className={`aspect-square rounded-xl transition-all duration-300 ${
                    isShowing
                      ? "bg-gradient-to-br from-secondary to-secondary/70 scale-110 shadow-lg"
                      : wasClicked
                      ? "bg-primary/40 scale-95"
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
