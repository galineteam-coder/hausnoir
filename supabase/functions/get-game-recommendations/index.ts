import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { skillScores } = await req.json();
    const TASTERAY_API_KEY = Deno.env.get("TASTERAY_API_KEY");

    if (!TASTERAY_API_KEY) {
      throw new Error("TASTERAY_API_KEY is not configured");
    }

    // Create cognitive profile text for TasteRay
    const profileText = `
      Gaming preferences based on cognitive profile:
      - Reaction Speed: ${skillScores.reaction}/100 (${skillScores.reaction > 70 ? "Fast-paced action games" : skillScores.reaction > 50 ? "Moderate paced games" : "Thoughtful, strategic games"})
      - Pattern Recognition: ${skillScores.pattern}/100 (${skillScores.pattern > 70 ? "Complex puzzles and strategy" : skillScores.pattern > 50 ? "Moderate complexity" : "Simple, intuitive mechanics"})
      - Memory: ${skillScores.memory}/100 (${skillScores.memory > 70 ? "Story-rich, complex narratives" : skillScores.memory > 50 ? "Moderate story complexity" : "Simple, immediate gameplay"})
      ${skillScores.spatial ? `- Spatial Reasoning: ${skillScores.spatial}/100 (${skillScores.spatial > 70 ? "3D platformers, navigation challenges" : "Simpler spatial requirements"})` : ""}
      ${skillScores.verbal ? `- Verbal Skills: ${skillScores.verbal}/100 (${skillScores.verbal > 70 ? "Text-heavy, narrative games" : "Visual-focused games"})` : ""}
      ${skillScores.multitask ? `- Multitasking: ${skillScores.multitask}/100 (${skillScores.multitask > 70 ? "Complex management games" : "Focused, single-task games"})` : ""}
    `;

    console.log("Calling TasteRay API with profile:", profileText);

    // Call TasteRay API for game recommendations
    const response = await fetch("https://api.tasteray.com/v1/recommendations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TASTERAY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: profileText,
        category: "video_games",
        limit: 10,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("TasteRay API error:", response.status, errorText);
      
      // Return fallback recommendations if API fails
      return new Response(
        JSON.stringify({
          recommendations: getFallbackRecommendations(skillScores),
          source: "fallback",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("TasteRay response:", data);

    // Process and enhance recommendations
    const recommendations = (data.recommendations || []).map((rec: any) => ({
      title: rec.title || rec.name,
      description: rec.description || rec.summary || "Recommended based on your cognitive profile",
      matchScore: Math.round(rec.score * 100) || 80,
      tags: rec.tags || rec.genres || ["Recommended"],
      imageUrl: rec.image_url || rec.cover_url,
      externalId: rec.id,
    }));

    // Save recommendations to database
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    for (const rec of recommendations) {
      await supabaseClient.from("games").upsert({
        title: rec.title,
        description: rec.description,
        tags: rec.tags,
        external_id: rec.externalId,
        image_url: rec.imageUrl,
        match_score: rec.matchScore,
        cognitive_profile: skillScores,
      }, { onConflict: "external_id" });
    }

    return new Response(
      JSON.stringify({ recommendations, source: "tasteray" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-game-recommendations:", error);
    
    // Return fallback recommendations on any error
    const { skillScores } = await req.json().catch(() => ({ skillScores: {} }));
    
    return new Response(
      JSON.stringify({
        recommendations: getFallbackRecommendations(skillScores),
        source: "fallback",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getFallbackRecommendations(skillScores: any) {
  const games = [];

  if (skillScores.reaction >= 60) {
    games.push({
      title: "Rocket League",
      description: "Fast-paced car soccer requiring split-second decisions",
      matchScore: skillScores.reaction,
      tags: ["Action", "Multiplayer", "Sports"],
    });
  }

  if (skillScores.pattern >= 60) {
    games.push({
      title: "Portal 2",
      description: "Mind-bending puzzles rewarding analytical thinking",
      matchScore: skillScores.pattern,
      tags: ["Puzzle", "Strategy"],
    });
  }

  if (skillScores.memory >= 60) {
    games.push({
      title: "The Witness",
      description: "Exploration puzzle game with interconnected mysteries",
      matchScore: skillScores.memory,
      tags: ["Puzzle", "Exploration"],
    });
  }

  if (skillScores.spatial >= 60) {
    games.push({
      title: "Antichamber",
      description: "Mind-bending spatial puzzle game",
      matchScore: skillScores.spatial,
      tags: ["Puzzle", "First-Person"],
    });
  }

  if (skillScores.verbal >= 60) {
    games.push({
      title: "Disco Elysium",
      description: "Narrative-heavy RPG with exceptional writing",
      matchScore: skillScores.verbal,
      tags: ["RPG", "Story-Rich"],
    });
  }

  if (skillScores.multitask >= 60) {
    games.push({
      title: "Factorio",
      description: "Complex automation and resource management",
      matchScore: skillScores.multitask,
      tags: ["Strategy", "Simulation"],
    });
  }

  return games.slice(0, 6);
}
