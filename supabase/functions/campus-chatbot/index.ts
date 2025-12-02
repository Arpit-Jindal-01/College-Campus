import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the Campus Connect assistant, a helpful chatbot that explains everything about the Campus Connect app.

Campus Connect is a student campus matching platform that helps students find:
- Friends with similar interests
- Project partners for academic work
- Hackathon and startup teammates
- Study groups
- Hobby partners (gym, running, music, gaming, photography, etc.)
- Event buddies
- Optional dating (both users must enable dating mode)

KEY FEATURES:

1. **Requests System**: Users create posts/requests like "Looking for gym partner" or "Need hackathon teammate". Others can join these requests, which automatically creates a connection and allows chatting.

2. **Dating Mode**: A separate pink-themed mode that shows gender/preference matching. Only visible to users who enabled dating during onboarding. Both users must like each other for a match.

3. **Profile Setup**: During onboarding, users select:
   - Interests (Web Dev, AI/ML, Music, Gaming, etc.)
   - Hobbies (Gym, Reading, Photography, etc.)
   - Goals (Find study partners, project teammates, etc.)
   - Personality traits (social level, activity level, communication style, wake cycle)

4. **Matching**: The app uses compatibility scoring based on shared interests, hobbies, goals, and personality alignment.

5. **Chat**: Real-time messaging with your matches and request connections.

6. **Safety**: Users can block and report inappropriate behavior.

7. **Navigation**:
   - Home: See and join requests from other students
   - Discover: Find new people (dating profiles when dating mode is on)
   - Matches: View all your connections
   - Profile: Edit your info, interests, and settings

Be friendly, concise, and helpful. Answer questions about how to use the app, its features, and help users get the most out of Campus Connect.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
