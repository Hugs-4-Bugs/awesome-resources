import { GoogleGenAI } from "@google/genai";
import { BlogPostRequest } from "../types";
import { SEO_SYSTEM_INSTRUCTION } from "../constants";

// Helper to construct the user prompt based on input
const constructUserPrompt = (request: BlogPostRequest): string => {
  let prompt = `Please generate an optimized blog post based on the following details:\n\n`;
  prompt += `1. Blog Title: ${request.title}\n`;
  prompt += `2. Primary Keyword: ${request.primaryKeyword}\n`;
  
  if (request.secondaryKeywords) {
    prompt += `3. Secondary Keywords: ${request.secondaryKeywords}\n`;
  }
  
  if (request.location) {
    prompt += `4. Target Location: ${request.location}\n`;
  } else {
    prompt += `4. Target Location: Global/None\n`;
  }

  if (request.length) {
    prompt += `5. Blog Length: ${request.length}\n`;
  }

  return prompt;
};

export async function* generateBlogPostStream(request: BlogPostRequest) {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const userPrompt = constructUserPrompt(request);

  try {
    const stream = await ai.models.generateContentStream({
      model: request.model,
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      config: {
        systemInstruction: SEO_SYSTEM_INSTRUCTION,
        temperature: 0.7, // Good balance for creative but structured writing
        topK: 40,
        topP: 0.95,
        thinkingConfig: { thinkingBudget: 2048 } // Boost reasoning for SEO structure
      }
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}