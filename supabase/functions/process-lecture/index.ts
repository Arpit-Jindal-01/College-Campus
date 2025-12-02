// File: supabase/functions/process-lecture/index.ts
// This is the backend function that handles audio transcription and note generation.
// Audio is passed as base64 in the request body (audioBase64 field).
// Transcription model: whisper-1
// LLM model: gpt-4o-mini

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lectureId, audioBase64, subject, topic, teacherName, className } = await req.json();
    
    console.log('Processing lecture:', { lectureId, subject, topic, audioLength: audioBase64?.length });

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured. Please add it in the Secrets panel.');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Validate audio data is present
    if (!audioBase64 || audioBase64.length < 100) {
      throw new Error('No audio data provided. Please record or upload audio first.');
    }

    // Update status to transcribing
    await supabase
      .from('lectures')
      .update({ status: 'transcribing' })
      .eq('id', lectureId);

    // ============================================
    // STEP 1: Transcribe audio using OpenAI Whisper
    // ============================================
    console.log('Starting Whisper transcription with model: whisper-1');
    
    // Convert base64 to binary
    const binaryString = atob(audioBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create form data for Whisper API
    const formData = new FormData();
    const audioBlob = new Blob([bytes], { type: 'audio/webm' });
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!whisperResponse.ok) {
      const errorData = await whisperResponse.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || `Whisper API error: ${whisperResponse.status}`;
      console.error('Whisper API error:', whisperResponse.status, errorMessage);
      
      // Provide specific error messages
      if (whisperResponse.status === 429 || errorData?.error?.code === 'insufficient_quota') {
        throw new Error('OpenAI API quota exceeded. Please check your billing at platform.openai.com and add credits.');
      }
      if (whisperResponse.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY in the Secrets panel.');
      }
      throw new Error(`Transcription failed: ${errorMessage}`);
    }

    const whisperData = await whisperResponse.json();
    const transcript = whisperData.text;
    
    if (!transcript || transcript.trim().length < 10) {
      throw new Error('Transcription returned empty or too short. The audio may be silent or corrupted.');
    }
    
    console.log('Whisper transcription complete, transcript length:', transcript.length);

    // Update status to summarizing with transcript
    await supabase
      .from('lectures')
      .update({ status: 'summarizing', transcript })
      .eq('id', lectureId);

    // ============================================
    // STEP 2: Generate study materials using GPT from REAL transcript
    // ============================================
    console.log('Generating study materials from transcript using GPT-4o-mini...');

    const systemPrompt = `You are an expert educational content creator. Based on the provided lecture transcript, create comprehensive study materials.

IMPORTANT: Your response must be ONLY valid JSON with this exact structure (no markdown code blocks, no extra text):
{
  "summary": "A concise 5-10 line summary of the main points from the transcript",
  "detailedNotes": "Well-structured notes with headings (##), subheadings (###), bullet points, definitions, and examples. Use markdown formatting. At least 500 words.",
  "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5", "Point 6", "Point 7"],
  "questions": [
    {"id": "q1", "type": "short", "question": "...", "correctAnswer": "..."},
    {"id": "q2", "type": "short", "question": "...", "correctAnswer": "..."},
    {"id": "q3", "type": "short", "question": "...", "correctAnswer": "..."},
    {"id": "q4", "type": "mcq", "question": "...", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": "Option A"},
    {"id": "q5", "type": "mcq", "question": "...", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": "Option B"},
    {"id": "q6", "type": "mcq", "question": "...", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": "Option C"}
  ],
  "tasks": [
    {"id": "t1", "task": "...", "completed": false},
    {"id": "t2", "task": "...", "completed": false},
    {"id": "t3", "task": "...", "completed": false},
    {"id": "t4", "task": "...", "completed": false},
    {"id": "t5", "task": "...", "completed": false}
  ]
}

Requirements:
- Base ALL content on the actual transcript provided - do NOT make up information
- Generate at least 7 key points from the lecture content
- Generate exactly 3 short answer questions and 3 MCQs (6 total)
- Generate exactly 5 actionable study tasks
- Use simple language that students can understand
- Support English, Hindi, or Hinglish based on the transcript language`;

    const userContent = `Subject: ${subject}
Topic: ${topic}
${teacherName ? `Teacher: ${teacherName}` : ''}
${className ? `Class: ${className}` : ''}

LECTURE TRANSCRIPT:
${transcript}

Generate comprehensive study materials based on this transcript.`;

    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!gptResponse.ok) {
      const errorData = await gptResponse.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || `GPT API error: ${gptResponse.status}`;
      console.error('GPT API error:', gptResponse.status, errorMessage);
      
      if (gptResponse.status === 429 || errorData?.error?.code === 'insufficient_quota') {
        throw new Error('OpenAI API quota exceeded. Please check your billing at platform.openai.com.');
      }
      throw new Error(`Content generation failed: ${errorMessage}`);
    }

    const gptData = await gptResponse.json();
    const contentText = gptData.choices?.[0]?.message?.content || '';
    
    console.log('GPT content generated, parsing JSON...');

    // Parse the JSON response
    let parsedContent;
    try {
      // Try to extract JSON from potential markdown code blocks
      const jsonMatch = contentText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : contentText;
      parsedContent = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw content (first 1000 chars):', contentText.substring(0, 1000));
      throw new Error('Failed to parse AI response. The model returned invalid JSON.');
    }

    // Validate required fields
    if (!parsedContent.summary || !parsedContent.detailedNotes) {
      throw new Error('AI response missing required fields (summary or detailedNotes).');
    }

    // ============================================
    // STEP 3: Save to database
    // ============================================
    const { error: updateError } = await supabase
      .from('lectures')
      .update({
        status: 'completed',
        transcript,
        summary: parsedContent.summary,
        detailed_notes: parsedContent.detailedNotes,
        key_points: Array.isArray(parsedContent.keyPoints) ? parsedContent.keyPoints : [],
        questions: Array.isArray(parsedContent.questions) ? parsedContent.questions : [],
        tasks: Array.isArray(parsedContent.tasks) ? parsedContent.tasks : [],
      })
      .eq('id', lectureId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to save lecture data to database.');
    }

    console.log('Lecture processing complete! Transcript-based notes generated successfully.');

    return new Response(
      JSON.stringify({ 
        success: true, 
        lectureId,
        status: 'completed',
        transcriptLength: transcript.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error processing lecture:', errorMessage);
    
    // Update lecture status to failed with error message
    try {
      const body = await req.clone().json();
      const { lectureId } = body;
      if (lectureId) {
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
        
        await supabase
          .from('lectures')
          .update({ 
            status: 'failed',
            error_message: errorMessage
          })
          .eq('id', lectureId);
      }
    } catch (e) {
      console.error('Failed to update lecture status:', e);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
