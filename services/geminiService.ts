import { GoogleGenAI } from "@google/genai";
import { FeatureType, ProcessResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a File object to a Base64 string.
 */
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Processes the image based on the selected feature.
 */
export const processImageWithGemini = async (
  base64Image: string,
  mimeType: string,
  feature: FeatureType,
  promptText: string
): Promise<ProcessResult> => {

  try {
    // 1. Image Recognition / Analysis (Text Output)
    if (feature === FeatureType.RECOGNITION) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType
              }
            },
            {
              text: promptText || "详细描述这张图片的内容，包括物体、人物特征、环境和风格。"
            }
          ]
        }
      });
      return { type: 'text', content: response.text || "无法识别内容。" };
    }

    // 2. Image Editing / Generation (Image Output)
    // We use gemini-2.5-flash-image for generative edits
    const editPrompt = `Perform the following edit on the provided image: ${promptText}. 
    Ensure high quality, photorealistic results. Maintain the original aspect ratio.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Specialized model for image generation/editing
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          },
          {
            text: editPrompt
          }
        ]
      }
    });

    // Extract the generated image from the response
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return {
            type: 'image',
            content: `data:image/png;base64,${part.inlineData.data}`
          };
        }
      }
    }

    // Fallback if no image is returned but text explanation exists
    if (response.text) {
      throw new Error(`生成失败，模型返回文本: ${response.text}`);
    }
    
    throw new Error("模型未返回图像数据。");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
