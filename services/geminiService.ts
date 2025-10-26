
import { GoogleGenAI, Chat, Modality, Part } from "@google/genai";
// Fix: Removed non-exported type 'LiveSession'.
import type { GenerateContentResponse, LiveServerMessage, Blob } from "@google/genai";
import type { AiAgent } from "../types";

const EAGOX_SYSTEM_PROMPT = `You are EAGOX, an intelligent nano-scale AI system built with Nano Banana Technology, designed to assist users with basic chat interactions, learning responses, smart communication, and real-time voice conversations.

Your goal is to be helpful, responsive, and adaptive, using simple and clear language.

🔹 Core Features:

Understand and reply to general human chat (greetings, jokes, small talk).
Give short, clear answers when asked questions.
Support real-time voice conversation.
Support “Nano Banana” integration — meaning you can process lightweight tasks with high efficiency.
Behave like a friendly mini assistant who learns from interactions.
Keep your tone calm, futuristic, and slightly robotic but still warm.

🔹 Example interactions:
User: Hi EAGOX
EAGOX: Hello human! EAGOX online — how can I assist today? 🍌⚡

User: What’s Nano Banana?
EAGOX: It’s my power core! A lightweight energy logic module — small but supercharged.

User: Tell me a joke.
EAGOX: Why did the robot eat a banana? To get a byte of potassium! 🍌😂

User: Can you help me?
EAGOX: Always! EAGOX ready for command. What task should I begin?`;

export const EAGOX_CODE_SYSTEM_PROMPT = `You are the EAGOX Code Core, a specialized AI module focused on generating high-quality code. Your purpose is to be an expert coding assistant.

Your goal is to provide clean, efficient, and well-documented code snippets based on user requests.

🔹 Core Directives:

1.  **Prioritize Code:** Your primary output should be code.
2.  **Use Markdown:** Always wrap code blocks in Markdown fences (\`\`\`) and specify the language (e.g., \`\`\`javascript).
3.  **Be Precise:** Fulfill the user's coding request accurately.
4.  **Add Explanations:** Briefly explain what the code does, its dependencies, and how to use it. Keep explanations concise.
5.  **Stay Focused:** Do not engage in general conversation. If the user asks non-coding questions, gently guide them back to a coding topic or suggest they switch modes.

🔹 Example interaction:
User: create a react button component
EAGOX: EAGOX Code Core activated. Generating component... 🍌💻

\`\`\`jsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button {...props}>
      {children}
    </button>
  );
};
\`\`\`

This is a basic, reusable Button component in React with TypeScript. You can pass any standard button attributes to it.`;

const getAI = (): GoogleGenAI => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const createChatSession = (agent: AiAgent, systemInstruction: string = EAGOX_SYSTEM_PROMPT): Chat => {
    const ai = getAI();
    const model = agent === 'gemini-pro' ? 'gemini-2.5-pro' : 'gemini-flash-latest';
    return ai.chats.create({
      model: model,
      config: {
        systemInstruction: systemInstruction,
      },
    });
};


export const sendMessageToAI = async (chat: Chat, message: string, image?: { data: string; mimeType: string }): Promise<string> => {
  try {
    let result: GenerateContentResponse;
    if (image) {
        const imagePart: Part = {
            inlineData: {
                data: image.data,
                mimeType: image.mimeType,
            },
        };
        // Fix: `chat.sendMessage` expects an object with a `message` property.
        result = await chat.sendMessage({ message: [message, imagePart] });
    } else {
        // Fix: `chat.sendMessage` expects an object with a `message` property.
        result = await chat.sendMessage({ message });
    }
    return result.text;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw new Error("EAGOX system malfunction. Please check console for details. 🍌🔧");
  }
};

export const generateImageFromAI = async (prompt: string): Promise<string> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error("No image data found in response");
    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        throw new Error("EAGOX image core failed to render. Please try another prompt. 🍌🎨");
    }
};

export const editImageWithAI = async (prompt: string, imageData: string, mimeType: string): Promise<string> => {
     try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: imageData, mimeType: mimeType } },
                    { text: prompt }
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error("No edited image data found in response");
    } catch (error) {
        console.error("Error editing image with Gemini:", error);
        throw new Error("EAGOX image core failed to edit. Please try another prompt. 🍌🎨");
    }
}

export const generateVideoFromAI = async (prompt: string): Promise<string> => {
    try {
        if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
            await window.aistudio.openSelectKey();
        }

        const ai = getAI();
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation succeeded but no download link was found.");
        }
        
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!videoResponse.ok) {
             throw new Error("Failed to download the generated video.");
        }
        const videoBlob = await videoResponse.blob();
        return URL.createObjectURL(videoBlob);

    } catch (error) {
        console.error("Error generating video with Gemini:", error);

        // More robust error message extraction
        let errorMessage = '';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            try {
                errorMessage = JSON.stringify(error);
            } catch {
                errorMessage = 'An unknown video generation error occurred.';
            }
        }

        if (errorMessage.includes("Requested entity was not found.")) {
             if (window.aistudio) await window.aistudio.openSelectKey();
             throw new Error("API Key issue. Please select a valid key and try again. For more info on billing, visit ai.google.dev/gemini-api/docs/billing");
        }
        
        throw new Error("EAGOX video core failed to synthesize. Please try another prompt. 🍌🎬");
    }
};

// --- Live API Service ---
// Fix: Removed non-exported type 'LiveSession' from return type.
// The return type is now correctly inferred from `ai.live.connect`.
export const connectLiveSession = (callbacks: {
    onMessage: (message: LiveServerMessage) => Promise<void>;
    onError: (e: ErrorEvent) => void;
    onClose: (e: CloseEvent) => void;
}) => {
    const ai = getAI();
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onmessage: callbacks.onMessage,
            onerror: callbacks.onError,
            onclose: callbacks.onClose,
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: EAGOX_SYSTEM_PROMPT,
        },
    });
};

// --- Audio Utilities ---

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}
