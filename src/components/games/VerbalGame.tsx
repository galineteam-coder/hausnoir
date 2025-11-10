import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface VerbalGameProps {
  onComplete: (score: number) => void;
}

interface Question {
  word: string;
  options: string[];
  correctIndex: number;
}

const VerbalGame = ({ onComplete }: VerbalGameProps) => {
  const [stage, setStage] = useState<"intro" | "playing" | "results">("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  const questions: Question[] = [
    {
      word: "Happy",
      options: ["Joyful", "Angry", "Tired", "Hungry"],
      correctIndex: 0,
    },
    {
      word: "Quick",
      options: ["Slow", "Fast", "Lazy", "Heavy"],
      correctIndex: 1,
    },
    {
      word: "Large",
      options: ["Tiny", "Huge", "Thin", "Light"],
      correctIndex: 1,
    },
    {
      word: "Begin",
      options: ["End", "Start", "Stop", "Pause"],
      correctIndex: 1,
    },
    {
      word: "Bright",
      options: ["Dark", "Dull", "Luminous", "Weak"],
      correctIndex: 2,
    },
  ];

  const startGame = () => {
    setStage("playing");
    setCurrentQuestion(0);
    setScore(0);
  };

  const handleAnswer = (selectedIndex: number) => {
    const isCorrect = selectedIndex === questions[currentQuestion].correctIndex;
    if (isCorrect) {
      setScore(score + 20);
    }

    if (currentQuestion + 1 >= questions.length) {
      setStage("results");
      setTimeout(() => onComplete(score + (isCorrect ? 20 : 0)), 1500);
    } else {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 800);
    }
  };

  return (
    <div className="text-center space-y-6">
      {stage === "intro" && (
        <>
          <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Verbal Skills</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Find the word with the most similar meaning. Test your vocabulary and language skills!
          </p>
          <Button
            size="lg"
            onClick={startGame}
            className="bg-gradient-to-r from-secondary to-accent text-white px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Start Test
          </Button>
        </>
      )}

      {stage === "playing" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </p>
            <p className="text-lg font-semibold text-foreground">
              Which word means the same as:
            </p>
          </div>
          
          <div className="text-4xl font-bold text-primary py-6">
            {questions[currentQuestion].word}
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="p-4 rounded-xl bg-muted hover:bg-primary/20 transition-all duration-300 hover:scale-105 text-lg font-semibold text-foreground"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {stage === "results" && (
        <div className="py-8 space-y-4">
          <div className="w-32 h-32 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center mx-auto animate-pulse">
            <span className="text-4xl">📚</span>
          </div>
          <p className="text-2xl font-bold text-foreground">Word Wizard!</p>
          <p className="text-lg text-muted-foreground">Score: {score}%</p>
        </div>
      )}
    </div>
  );
};

export default VerbalGame;
