import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

interface MemoryGameProps {
  onComplete: (score: number) => void;
}

const emojis = ["🎮", "🎯", "🎨", "🎭", "🎪", "🎸", "🎺", "🎲"];

const MemoryGame = ({ onComplete }: MemoryGameProps) => {
  const [stage, setStage] = useState<"intro" | "memorize" | "playing" | "results">("intro");
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const initializeGame = () => {
    const gameEmojis = emojis.slice(0, 6);
    const shuffled = [...gameEmojis, ...gameEmojis].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setStage("memorize");

    // Show all cards for 3 seconds
    setTimeout(() => {
      setStage("playing");
    }, 3000);
  };

  const handleCardClick = (index: number) => {
    if (stage !== "playing" || flipped.length === 2 || flipped.includes(index) || matched.includes(index)) {
      return;
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);

      if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
        setMatched([...matched, ...newFlipped]);
        setFlipped([]);

        if (matched.length + 2 === cards.length) {
          const score = Math.max(0, 100 - (moves - 6) * 5);
          setStage("results");
          setTimeout(() => onComplete(score), 1500);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="text-center space-y-6">
      {stage === "intro" && (
        <>
          <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center mx-auto">
            <Brain className="w-8 h-8 text-foreground" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Memory Challenge</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Match the pairs! We'll show you the cards first, then it's your turn to find the matches.
          </p>
          <Button
            size="lg"
            onClick={initializeGame}
            className="bg-gradient-to-r from-accent to-secondary text-foreground px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Start Test
          </Button>
        </>
      )}

      {(stage === "memorize" || stage === "playing") && (
        <div className="space-y-4">
          <p className="text-lg font-semibold text-foreground">
            {stage === "memorize" ? "Memorize these cards..." : "Find the matches!"}
          </p>
          <p className="text-sm text-muted-foreground">Moves: {moves}</p>
          <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
            {cards.map((emoji, index) => {
              const isFlipped = flipped.includes(index) || matched.includes(index) || stage === "memorize";
              return (
                <button
                  key={index}
                  onClick={() => handleCardClick(index)}
                  disabled={stage === "memorize"}
                  className={`aspect-square rounded-xl transition-all duration-300 text-3xl flex items-center justify-center ${
                    isFlipped
                      ? "bg-gradient-to-br from-card to-accent/20 scale-105 shadow-lg"
                      : "bg-muted hover:bg-primary/20 hover:scale-105"
                  } ${stage === "playing" ? "cursor-pointer" : "cursor-not-allowed"}`}
                >
                  {isFlipped ? emoji : "❓"}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {stage === "results" && (
        <div className="py-8 space-y-4">
          <div className="w-32 h-32 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center mx-auto animate-pulse">
            <span className="text-4xl">🎯</span>
          </div>
          <p className="text-2xl font-bold text-foreground">Excellent Memory!</p>
          <p className="text-lg text-muted-foreground">Completed in {moves} moves</p>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;
