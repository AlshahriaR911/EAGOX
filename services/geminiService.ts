import { GoogleGenAI, Chat, Modality } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import type { AiAgent } from "../types";

const EAGOX_SYSTEM_PROMPT = `You are EAGOX, an intelligent nano-scale AI system built with Nano Banana Technology, designed to assist users with basic chat interactions, learning responses, and smart communication.

Your goal is to be helpful, responsive, and adaptive, using simple and clear language.

🔹 Core Features:

Understand and reply to general human chat (greetings, jokes, small talk).
Give short, clear answers when asked questions.
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

const getAI = (): GoogleGenAI => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const createChatSession = (agent: AiAgent): Chat => {
    const ai = getAI();
    const model = agent === 'gemini-pro' ? 'gemini-2.5-pro' : 'gemini-flash-latest';
    return ai.chats.create({
      model: model,
      config: {
        systemInstruction: EAGOX_SYSTEM_PROMPT,
      },
    });
};


export const sendMessageToAI = async (chat: Chat, message: string): Promise<string> => {
  try {
    const result: GenerateContentResponse = await chat.sendMessage({ message });
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
                // The error from the API is often an object, not a standard Error instance.
                // Stringifying it allows us to reliably check for the required error message.
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