import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Box } from "lucide-react";

interface SpatialGameProps {
  onComplete: (score: number) => void;
}

type Shape = "square" | "circle" | "triangle";
type Rotation = 0 | 90 | 180 | 270;

interface ShapeData {
  shape: Shape;
  rotation: Rotation;
  color: string;
}

const SpatialGame = ({ onComplete }: SpatialGameProps) => {
  const [stage, setStage] = useState<"intro" | "showing" | "testing" | "results">("intro");
  const [targetShape, setTargetShape] = useState<ShapeData | null>(null);
  const [options, setOptions] = useState<ShapeData[]>([]);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const maxRounds = 5;

  const shapes: Shape[] = ["square", "circle", "triangle"];
  const rotations: Rotation[] = [0, 90, 180, 270];
  const colors = ["bg-primary", "bg-secondary", "bg-accent"];

  const generateShape = (): ShapeData => ({
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    rotation: rotations[Math.floor(Math.random() * rotations.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
  });

  const startRound = () => {
    const target = generateShape();
    setTargetShape(target);
    
    // Generate 3 wrong options and 1 correct (rotated)
    const wrongOptions = Array.from({ length: 3 }, () => {
      const wrongShape = generateShape();
      // Make sure it's different from target
      while (wrongShape.shape === target.shape && wrongShape.rotation === target.rotation) {
        wrongShape.shape = shapes[Math.floor(Math.random() * shapes.length)];
      }
      return wrongShape;
    });

    const correctOption = {
      ...target,
      rotation: ((target.rotation + 90) % 360) as Rotation,
    };

    const allOptions = [...wrongOptions, correctOption].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setStage("showing");

    setTimeout(() => setStage("testing"), 2000);
  };

  const handleAnswer = (selectedShape: ShapeData) => {
    if (!targetShape) return;

    const isCorrect =
      selectedShape.shape === targetShape.shape &&
      selectedShape.rotation === ((targetShape.rotation + 90) % 360);

    if (isCorrect) {
      setScore(score + 20);
    }

    if (round >= maxRounds) {
      setStage("results");
      setTimeout(() => onComplete(score + (isCorrect ? 20 : 0)), 1500);
    } else {
      setRound(round + 1);
      setTimeout(startRound, 1000);
    }
  };

  const renderShape = (shapeData: ShapeData, size: string = "w-20 h-20") => {
    const { shape, rotation, color } = shapeData;

    if (shape === "circle") {
      return <div className={`${size} ${color} rounded-full`} />;
    }
    if (shape === "square") {
      return (
        <div
          className={`${size} ${color}`}
          style={{ transform: `rotate(${rotation}deg)` }}
        />
      );
    }
    // triangle
    return (
      <div
        className={`${size} ${color}`}
        style={{
          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          transform: `rotate(${rotation}deg)`,
        }}
      />
    );
  };

  return (
    <div className="text-center space-y-6">
      {stage === "intro" && (
        <>
          <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mx-auto">
            <Box className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Spatial Reasoning</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            You'll see a shape, then find the same shape rotated 90° clockwise. Test your visual-spatial skills!
          </p>
          <Button
            size="lg"
            onClick={startRound}
            className="bg-gradient-to-r from-accent to-primary text-white px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Start Test
          </Button>
        </>
      )}

      {stage === "showing" && targetShape && (
        <div className="py-8 space-y-4">
          <p className="text-lg font-semibold text-foreground">Remember this shape:</p>
          <p className="text-sm text-muted-foreground">Round {round} of {maxRounds}</p>
          <div className="flex justify-center items-center min-h-[120px]">
            {renderShape(targetShape)}
          </div>
          <p className="text-muted-foreground">Find it rotated 90° clockwise...</p>
        </div>
      )}

      {stage === "testing" && (
        <div className="space-y-6">
          <p className="text-lg font-semibold text-foreground">Which shape matches?</p>
          <p className="text-sm text-muted-foreground">Round {round} of {maxRounds}</p>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="p-6 rounded-xl bg-muted hover:bg-primary/20 transition-all duration-300 hover:scale-105 flex items-center justify-center min-h-[120px]"
              >
                {renderShape(option)}
              </button>
            ))}
          </div>
        </div>
      )}

      {stage === "results" && (
        <div className="py-8 space-y-4">
          <div className="w-32 h-32 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center mx-auto animate-pulse">
            <span className="text-4xl">🎯</span>
          </div>
          <p className="text-2xl font-bold text-foreground">Spatial Master!</p>
          <p className="text-lg text-muted-foreground">Score: {score}%</p>
        </div>
      )}
    </div>
  );
};

export default SpatialGame;
