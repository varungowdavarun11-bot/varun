import { GoogleGenAI, Modality } from "@google/genai";

// Initialize the client. In a real production app, ensure this key is guarded.
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    // We will throw specifically so the UI can catch it if needed, 
    // though the provided instructions assume the key is available.
  }
  return new GoogleGenAI({ apiKey: apiKey });
};

export const generateAnswer = async (
  context: string,
  question: string,
  chatHistory: { role: string; parts: { text: string }[] }[] = []
): Promise<string> => {
  const ai = getClient();
  
  // We use the flash model for fast text generation
  // "Context" here mimics RAG by just dumping the text into the prompt 
  // since Gemini 2.5 Flash has a huge context window.
  const model = "gemini-2.5-flash";
  
  const systemInstruction = `You are a helpful and knowledgeable teaching assistant. 
  You have access to the following document content provided by the user. 
  Answer the user's questions strictly based on this content. 
  If the answer is not in the document, state that clearly.
  Keep answers concise and educational.
  
  DOCUMENT CONTENT:
  ${context.substring(0, 900000)} // Safety cap, though 1M is limit
  `;

  try {
    const response = await ai.models.generateContent({
        model,
        contents: [
            ...chatHistory.map(msg => ({
                role: msg.role,
                parts: msg.parts
            })),
            {
                role: 'user',
                parts: [{ text: question }]
            }
        ],
        config: {
            systemInstruction,
        }
    });

    return response.text || "I couldn't generate an answer.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  const ai = getClient();
  const model = "gemini-2.5-flash-preview-tts";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
};
