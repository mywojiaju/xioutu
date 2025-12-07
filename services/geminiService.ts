import { GoogleGenAI } from "@google/genai";
import { FeatureType, ProcessResult } from '../types';

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
    // Robustly retrieve the API Key
    let apiKey = '';

    // 1. Check Vite environment (import.meta.env)
    // We use try-catch to allow running in environments where import.meta might be restricted
    try {
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        apiKey = import.meta.env.VITE_API_KEY || import.meta.env.API_KEY || '';
      }
    } catch (e) {
      // Ignore
    }

    // 2. Check process.env.API_KEY directly
    // This handles both Node/Vercel environments AND "Magic String Replacement" in bundlers.
    // We access it directly inside try-catch instead of checking `typeof process`.
    // If 'process' is undefined, this throws ReferenceError (caught).
    // If 'process.env.API_KEY' is replaced by a literal string (e.g. "AIza..."), it works perfectly.
    if (!apiKey) {
      try {
        // @ts-ignore
        apiKey = process.env.API_KEY; 
      } catch (e) {
        // Ignore
      }
    }

    if (!apiKey) {
      throw new Error("未检测到 API Key。如果您在本地使用 Vite，请在 .env 文件中配置 VITE_API_KEY；如果在 Vercel 部署，请配置 API_KEY 环境变量。");
    }

    // Initialize AI client
    const ai = new GoogleGenAI({ apiKey: apiKey });

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

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Rethrow with a user-friendly message if possible
    if (error.message.includes("API Key")) {
      throw error; // Keep original message for API key issues
    }
    throw new Error(error.message || "AI 处理服务暂时不可用，请稍后重试。");
  }
};