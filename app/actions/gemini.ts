'use server';

import { GoogleGenAI } from '@google/genai';

export async function generateGeminiInsights(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-flash-latest';

    const result = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const responseText = result.text;
    
    // Clean up markdown code blocks if present
    const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      const data = JSON.parse(jsonString);
      return { success: true, data };
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return { success: false, error: 'Failed to parse AI response' };
    }
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return { success: false, error: error.message || 'Failed to generate insights' };
  }
}
