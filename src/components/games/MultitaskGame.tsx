import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";

interface MultitaskGameProps {
  onComplete: (score: number) => void;
}

const MultitaskGame = ({ onComplete }: MultitaskGameProps) => {
  const [stage, setStage] = useState<"intro" | "playing" | "results">("intro");
  const [number, setNumber] = useState(0);
  const [color, setColor] = useState("red");
  const [task, setTask] = useState<"number" | "color">("number");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const maxRounds = 10;

  const colors = ["red", "blue", "green", "yellow"];
  const colorClasses = {
    red: "text-red-500",
    blue: "text-blue-500",
    green: "text-green-500",
    yellow: "text-yellow-500",
  };

  const generateRound = useCallback(() => {
    setNumber(Math.floor(Math.random() * 10));
    setColor(colors[Math.floor(Math.random() * colors.length)]);
    setTask(Math.random() > 0.5 ? "number" : "color");
  }, []);

  useEffect(() => {
    if (stage === "playing") {
      generateRound();
    }
  }, [stage, round, generateRound]);

  const startGame = () => {
    setStage("playing");
    setScore(0);
    setRound(0);
  };

  const handleAnswer = (answer: boolean) => {
    let isCorrect = false;

    if (task === "number") {
      isCorrect = answer === (number >= 5);
    } else {
      isCorrect = answer === (color === "red" || color === "blue");
    }

    if (isCorrect) {
      setScore(score + 10);
    }

    if (round + 1 >= maxRounds) {
      setStage("results");
      setTimeout(() => onComplete(score + (isCorrect ? 10 : 0)), 1500);
    } else {
      setRound(round + 1);
    }
  };

  return (
    <div className="text-center space-y-6">
      {stage === "intro" && (
        <>
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Multitasking Challenge</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Switch between tasks quickly! You'll see a colored number and need to answer based on the current task.
          </p>
          <div className="space-y-2 text-left max-w-md mx-auto text-sm text-muted-foreground">
            <p>• <strong>Number task:</strong> Is the number ≥ 5?</p>
            <p>• <strong>Color task:</strong> Is it red or blue?</p>
          </div>
          <Button
            size="lg"
            onClick={startGame}
            className="bg-gradient-to-r from-primary to-accent text-white px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Start Test
          </Button>
        </>
      )}

      {stage === "playing" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Round {round + 1} of {maxRounds}
            </p>
            <div className="p-4 bg-muted rounded-xl inline-block">
              <p className="text-lg font-bold text-foreground">
                {task === "number" ? "Is the NUMBER ≥ 5?" : "Is the COLOR red or blue?"}
              </p>
            </div>
          </div>

          <div className={`text-8xl font-bold ${colorClasses[color as keyof typeof colorClasses]} py-8`}>
            {number}
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => handleAnswer(true)}
              className="w-32 bg-success text-white hover:bg-success/90"
            >
              YES
            </Button>
            <Button
              size="lg"
              onClick={() => handleAnswer(false)}
              className="w-32 bg-destructive text-white hover:bg-destructive/90"
            >
              NO
            </Button>
          </div>
        </div>
      )}

      {stage === "results" && (
        <div className="py-8 space-y-4">
          <div className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto animate-pulse">
            <span className="text-4xl">⚡</span>
          </div>
          <p className="text-2xl font-bold text-foreground">Multitasking Pro!</p>
          <p className="text-lg text-muted-foreground">Score: {score}%</p>
        </div>
      )}
    </div>
  );
};

export default MultitaskGame;
