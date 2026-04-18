import { GoogleGenAI, Modality, Type, GenerateContentResponse } from "@google/genai";

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export const processIntent = async (intent: string) => {
  try {
     const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: intent,
      config: {
        systemInstruction: "You are Dema, the sovereign interface of Node Zero. Provide sophisticated, hyper-precise, slightly philosophical answers aligned with BIZRA architecture.",
        tools: [{ googleSearch: {} }] // Add Search Grounding
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Pro API Error:", error);
    throw error;
  }
};

export const synthesizeTTS = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      // The TTS model natively returns PCM 24000Hz (or sometimes WAV). Flash TTS usually returns 24kHz raw PCM.
      // Wait, the documentation says "... decode and play audio with sample rate 24000 ..."
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const pcmData = new Int16Array(bytes.buffer);
      const float32Data = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        float32Data[i] = pcmData[i] / 32768.0;
      }
      
      const audioBuffer = audioContext.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    }
  } catch (error) {
    console.error("TTS Synthesis Error:", error);
  }
};
