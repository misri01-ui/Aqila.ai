import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface GenerationOptions {
  prompt: string;
  aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  highQuality?: boolean;
  baseImage?: string; // base64 encoded string
}

export async function generateImage(options: GenerationOptions): Promise<string> {
  const { prompt, aspectRatio = "1:1", highQuality = false, baseImage } = options;
  
  // Gemini 2.5 Flash is the primary multimodal model for generation in this SDK version
  const modelName = highQuality ? "gemini-3.1-flash-image-preview" : "gemini-2.5-flash-image";
  
  // Enforce high contrast and high detail in the prompt system-wide
  const enhancedPrompt = `High quality image, professional contrast, vibrant colors, sharp focus, 4k resolution. Request: ${prompt}`;

  try {
    const parts: any[] = [{ text: enhancedPrompt }];
    
    if (baseImage) {
      parts.unshift({
        inlineData: {
          data: baseImage.split(",")[1] || baseImage,
          mimeType: "image/png",
        }
      });
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        // @ts-ignore - imageConfig is valid for the selected models
        imageConfig: {
          aspectRatio,
          ...(highQuality ? { imageSize: "1K" } : {})
        }
      }
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No response from AI candidates");
    }

    const parts_out = candidates[0].content?.parts;
    if (!parts_out) {
      throw new Error("Response candidate has no content parts");
    }

    const imagePart = parts_out.find(p => p.inlineData);
    if (!imagePart || !imagePart.inlineData) {
      throw new Error("AI did not return an image part. The model may have returned text instead.");
    }

    return `data:image/png;base64,${imagePart.inlineData.data}`;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
}
