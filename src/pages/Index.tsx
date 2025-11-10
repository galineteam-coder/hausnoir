import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Zap, Target, Sparkles, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import MicroGamesTest from "@/components/MicroGamesTest";
import SkillProfile from "@/components/SkillProfile";

export interface SkillScores {
  reaction: number;
  pattern: number;
  memory: number;
  spatial?: number;
  verbal?: number;
  multitask?: number;
}

const Index = () => {
  const [stage, setStage] = useState<"landing" | "testing" | "results">("landing");
  const [skillScores, setSkillScores] = useState<SkillScores | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleTestComplete = (scores: SkillScores) => {
    setSkillScores(scores);
    setStage("results");
  };

  const handleRestart = () => {
    setStage("landing");
    setSkillScores(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setStage("landing");
    setSkillScores(null);
  };

  if (stage === "testing") {
    return <MicroGamesTest onComplete={handleTestComplete} />;
  }

  if (stage === "results" && skillScores) {
    return <SkillProfile scores={skillScores} onRestart={handleRestart} session={session} />;
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header with Auth */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-end gap-2">
          {session ? (
            <>
              <Button
                variant="outline"
                onClick={() => navigate("/profile")}
                className="gap-2"
              >
                <User className="w-4 h-4" />
                Profile
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-primary to-secondary text-white"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 animate-pulse" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-primary/20 shadow-lg">
              <Sparkles className="w-5 h-5 text-accent animate-pulse" />
              <span className="text-sm font-semibold text-foreground">Discover Your Gaming DNA</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
              Find Games That Fit
              <br />
              <span className="text-foreground">Your Brain</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Not what's trending. Not what's advertised. Games that match your natural cognitive strengths.
            </p>

            <Button
              size="lg"
              onClick={() => setStage("testing")}
              className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-6 text-lg rounded-full shadow-[0_0_30px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_50px_hsl(var(--primary)/0.5)] hover:scale-105 transition-all duration-300"
            >
              <Brain className="w-6 h-6 mr-2" />
              Start Your Brain Test
            </Button>

            <p className="text-sm text-muted-foreground">
              Takes 3 minutes • Fun & playful • Zero judgment
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-8 text-center space-y-4 bg-gradient-to-b from-card to-card/50 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Play Mini-Games</h3>
            <p className="text-muted-foreground">
              Quick, fun tests that measure your natural cognitive abilities — no pressure, just play!
            </p>
          </Card>

          <Card className="p-8 text-center space-y-4 bg-gradient-to-b from-card to-card/50 border-2 border-secondary/20 hover:border-secondary/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/70 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Get Your Skill DNA</h3>
            <p className="text-muted-foreground">
              We map your unique cognitive profile — your hidden strengths that make you, you.
            </p>
          </Card>

          <Card className="p-8 text-center space-y-4 bg-gradient-to-b from-card to-card/50 border-2 border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Target className="w-8 h-8 text-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Discover Perfect Matches</h3>
            <p className="text-muted-foreground">
              Get personalized game recommendations that fit your natural playing style.
            </p>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-3xl mx-auto p-12 text-center space-y-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-2 border-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Ready to Find Your Perfect Games?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of players who've discovered games they never knew they'd love.
          </p>
          <Button
            size="lg"
            onClick={() => setStage("testing")}
            className="bg-gradient-to-r from-secondary to-accent text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <Sparkles className="w-6 h-6 mr-2" />
            Begin Your Journey
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Index;
