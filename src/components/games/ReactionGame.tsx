import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface ReactionGameProps {
  onComplete: (score: number) => void;
}

const ReactionGame = ({ onComplete }: ReactionGameProps) => {
  const [stage, setStage] = useState<"intro" | "waiting" | "ready" | "clicked" | "results">("intro");
  const [startTime, setStartTime] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const maxRounds = 5;

  const startRound = () => {
    setStage("waiting");
    const delay = Math.random() * 3000 + 1000; // 1-4 seconds
    setTimeout(() => {
      setStartTime(Date.now());
      setStage("ready");
    }, delay);
  };

  const handleClick = useCallback(() => {
    if (stage === "ready") {
      const reactionTime = Date.now() - startTime;
      const newTimes = [...reactionTimes, reactionTime];
      setReactionTimes(newTimes);

      if (round + 1 >= maxRounds) {
        setStage("results");
        const avgTime = newTimes.reduce((a, b) => a + b, 0) / newTimes.length;
        const score = Math.max(0, Math.min(100, 100 - (avgTime - 200) / 5));
        setTimeout(() => onComplete(Math.round(score)), 1500);
      } else {
        setRound(round + 1);
        setStage("clicked");
        setTimeout(startRound, 1000);
      }
    }
  }, [stage, startTime, reactionTimes, round, onComplete]);

  useEffect(() => {
    if (stage === "ready") {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [stage, handleClick]);

  return (
    <div className="text-center space-y-6">
      {stage === "intro" && (
        <>
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Reaction Speed Test</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Click as fast as you can when the screen turns green! We'll do {maxRounds} quick rounds.
          </p>
          <Button
            size="lg"
            onClick={startRound}
            className="bg-primary text-white px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Start Test
          </Button>
        </>
      )}

      {stage === "waiting" && (
        <div className="py-16 space-y-4">
          <div className="w-32 h-32 bg-destructive/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <span className="text-4xl">⏳</span>
          </div>
          <p className="text-2xl font-bold text-foreground">Get Ready...</p>
          <p className="text-muted-foreground">Round {round + 1} of {maxRounds}</p>
        </div>
      )}

      {stage === "ready" && (
        <div 
          className="py-16 space-y-4 cursor-pointer bg-success/20 rounded-2xl -m-8 md:-m-12 p-8 md:p-12 animate-pulse"
          onClick={handleClick}
        >
          <div className="w-32 h-32 bg-success rounded-full flex items-center justify-center mx-auto shadow-lg">
            <Zap className="w-16 h-16 text-white animate-pulse" />
          </div>
          <p className="text-3xl font-bold text-foreground">CLICK NOW!</p>
        </div>
      )}

      {stage === "clicked" && (
        <div className="py-16 space-y-4">
          <div className="w-32 h-32 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl">⚡</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {reactionTimes[reactionTimes.length - 1]}ms
          </p>
          <p className="text-muted-foreground">Great job!</p>
        </div>
      )}

      {stage === "results" && (
        <div className="py-16 space-y-4">
          <div className="w-32 h-32 bg-gradient-to-br from-success to-primary rounded-full flex items-center justify-center mx-auto animate-pulse">
            <span className="text-4xl">🎉</span>
          </div>
          <p className="text-2xl font-bold text-foreground">Amazing Reflexes!</p>
          <p className="text-lg text-muted-foreground">
            Average: {Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)}ms
          </p>
        </div>
      )}
    </div>
  );
};

export default ReactionGame;
