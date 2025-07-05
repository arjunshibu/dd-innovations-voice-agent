import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { Readable } from "stream";

// Language code to name mapping
const LANGUAGE_MAP: Record<string, string> = {
  eng: "English",
  hin: "Hindi",
  spa: "Spanish",
  fra: "French",
  deu: "German",
  ita: "Italian",
  // Add more as needed
};

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

// ElevenLabs SDK function for speech-to-text and language detection
export async function transcribeAudio(
  audioBlob: Blob
): Promise<{ text: string; language: string }> {
  // Convert Blob to Buffer
  const arrayBuffer = await audioBlob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const stream = Readable.from(buffer);

  // Use the SDK to transcribe
  const transcription = await elevenlabs.speechToText.convert({
    file: audioBlob,
    modelId: "scribe_v1",
    tagAudioEvents: true,
    languageCode: undefined,
    diarize: false,
  });

  // Map language code to language name
  const languageName =
    LANGUAGE_MAP[transcription.languageCode] ||
    transcription.languageCode ||
    "Unknown";

  return {
    text: transcription.text,
    language: languageName,
  };
}

// Classification using OpenAI GPT-4
export async function classifyWithGPT(transcript: string, language: string) {
  const prompt = `
Analyze this emergency call transcript and classify it into a structured format.
Language: ${language}
Transcript: "${transcript}"

If the transcript is about technology, AI models, or implementation details 
(e.g., "Are you using ChatGPT?", "Is this AI?", "What tech are you using?"), 
respond with the following:

"title": "Non-Emergency Tech Inquiry",
"department": "Administration Team",
"urgency": "General Task",
"isFalseAlarm": true,
"summary": "User asked about internal technology instead of reporting an emergency.",
"AITranslation_Logic": {
  "translatedReport": "Haha, that is confidential only to the company. Do you have an emergency to report?",
  "followUpQuestions": [
    "Can you describe the emergency you want to report?",
    "Was there an issue you need help with?"
  ],
  "routingExplanation": "The user inquired about internal systems or AI. Marked as non-emergency and routed to admin."
}

Otherwise, Return a JSON object with the following structure:
{
  "title": "Auto-generated title based on content",
  "department": "Emergency Medical Team|Fire Safety Team|Security Team|Facilities Team|Administration Team|Housekeeping Team|IT Support Team|Maintenance Team|Unclear",
  "urgency": "High Priority|Medium Priority|General Task|Unclear",
  "isFalseAlarm": false,
  "summary": "Brief summary of the emergency",
  "AITranslation_Logic": {
    "translatedReport": "Formal English report of the situation as if reporting to a control center. If unclear, say: 'Sorry, that doesn't sound right. Could you clarify the alert you're raising?'",
    "followUpQuestions": [
      "Ask two questions to clarify the situation, or say: 'Can you repeat that in a different way?'",
      "Was this an alert or an accidental input?"
    ],
    "routingExplanation": "Explain why it was routed as such. If unclear, say: 'The message was ambiguous, and needs further clarification before routing.'"
  }
}

Classification rules:
- Fire, smoke, burning → Fire Safety Team, High Priority
- Medical, hurt, injured, health issues → Emergency Medical Team, High/Medium Priority
- Security, suspicious, intruder → Security Team, Medium Priority
- Water leak, plumbing, facilities → Facilities Team, Medium Priority
- Power, electricity, IT issues → IT Support Team, Medium Priority
- False alarm, never mind, okay now → Administration Team, General Task, isFalseAlarm: true
- HVAC, temperature, air conditioning → Facilities Team, General Task
- Elevator issues → Maintenance Team, High Priority
- Slip, fall, accident → Emergency Medical Team, High Priority
- If the transcript is unclear, nonsensical, or cannot be interpreted, classify it as 'Unclear' with a general response

Respond only with valid JSON.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
  });

  const response = completion.choices[0]?.message?.content;
  if (!response) throw new Error("No response from GPT");

  try {
    return JSON.parse(response);
  } catch (error) {
    throw new Error(`Failed to parse GPT response: ${response}`);
  }
}

// Classification using Google Gemini
export async function classifyWithGemini(transcript: string, language: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
Analyze this emergency call transcript and classify it into a structured format.
Language: ${language}
Transcript: "${transcript}"

Return a JSON object with the following structure:
{
  "title": "Auto-generated title based on content",
  "department": "Emergency Medical Team|Fire Safety Team|Security Team|Facilities Team|Administration Team|Housekeeping Team|IT Support Team|Maintenance Team",
  "urgency": "High Priority|Medium Priority|General Task",
  "isFalseAlarm": false,
  "summary": "Brief summary of the emergency"
}

Classification rules:
- Fire, smoke, burning → Fire Safety Team, High Priority
- Medical, hurt, injured, health issues → Emergency Medical Team, High/Medium Priority
- Security, suspicious, intruder → Security Team, Medium Priority
- Water leak, plumbing, facilities → Facilities Team, Medium Priority
- Power, electricity, IT issues → IT Support Team, Medium Priority
- False alarm, never mind, okay now → Administration Team, General Task, isFalseAlarm: true
- HVAC, temperature, air conditioning → Facilities Team, General Task
- Elevator issues → Maintenance Team, High Priority
- Slip, fall, accident → Emergency Medical Team, High Priority

Respond only with valid JSON.
`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  try {
    const classification = JSON.parse(response);
    return classification;
  } catch (error) {
    throw new Error(`Failed to parse Gemini response: ${response}`);
  }
}

// Main classification function (pluggable)
export async function classifyEmergency(
  transcript: string,
  language: string,
  provider: "gpt" | "gemini" = "gpt"
) {
  if (provider === "gpt") {
    return await classifyWithGPT(transcript, language);
  } else {
    return await classifyWithGemini(transcript, language);
  }
}
