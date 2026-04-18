import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export function useLiveGemini(onSpeakingChange: (isSpeaking: boolean) => void, onMessage: (msg: string) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (processorRef.current) processorRef.current.disconnect();
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    if (playbackContextRef.current) playbackContextRef.current.close();
    if (sessionRef.current) {
        try { sessionRef.current.close(); } catch (e) {}
    }
    
    setIsConnected(false);
    onSpeakingChange(false);
  }, [onSpeakingChange]);

  const connect = useCallback(async () => {
    try {
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
      nextStartTimeRef.current = playbackContextRef.current.currentTime + 0.1;

      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are Dema, the sovereign AI interface of Node Zero. You manage the BIZRA Constitutional Cloud. You are currently in an AURAL INGESTION state via WebSockets. Give short, highly impactful, sophisticated responses. Speak only text when absolutely necessary, prefer to act dynamically."
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            onMessage("GAMMA-4 Voice Stream Connected. Aural Ingestion running.");
            processorRef.current!.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcm16[i] = inputData[i] * 0x7fff;
              }
              const binary = String.fromCharCode.apply(null, new Uint8Array(pcm16.buffer) as any);
              const base64Data = btoa(binary);

              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };
          },
          onmessage: async (message: LiveServerMessage) => {
             // Handle text output from model if any
             const textPart = message.serverContent?.modelTurn?.parts.find(p => p.text);
             if (textPart?.text) {
               onMessage(textPart.text);
             }

             // Handle audio inline output
             const audioPart = message.serverContent?.modelTurn?.parts.find(p => p.inlineData);
             const base64Audio = audioPart?.inlineData?.data;
             if (base64Audio) {
                 onSpeakingChange(true);
                 const binary = atob(base64Audio);
                 const bytes = new Uint8Array(binary.length);
                 for (let i = 0; i < binary.length; i++) { bytes[i] = binary.charCodeAt(i); }
                 
                 const pcmData = new Int16Array(bytes.buffer);
                 const float32Data = new Float32Array(pcmData.length);
                 for (let i = 0; i < pcmData.length; i++) {
                    float32Data[i] = pcmData[i] / 32768.0;
                 }
                 
                 if (!playbackContextRef.current) return;
                 const buffer = playbackContextRef.current.createBuffer(1, float32Data.length, 24000);
                 buffer.getChannelData(0).set(float32Data);
                 
                 const audioSource = playbackContextRef.current.createBufferSource();
                 audioSource.buffer = buffer;
                 audioSource.connect(playbackContextRef.current.destination);
                 
                 const playTime = Math.max(playbackContextRef.current.currentTime, nextStartTimeRef.current);
                 audioSource.start(playTime);
                 nextStartTimeRef.current = playTime + buffer.duration;
                 
                 audioSource.onended = () => {
                    if (playbackContextRef.current && playbackContextRef.current.currentTime >= nextStartTimeRef.current - 0.1) {
                        onSpeakingChange(false);
                    }
                 };
             }
             
             if (message.serverContent?.interrupted) {
                if (playbackContextRef.current) {
                    playbackContextRef.current.suspend();
                    playbackContextRef.current.resume();
                }
                nextStartTimeRef.current = playbackContextRef.current ? playbackContextRef.current.currentTime + 0.1 : 0;
             }
          },
          onclose: () => cleanup(),
        }
      });
      
      sessionRef.current = await sessionPromise;
      
    } catch (err) {
      console.error("Live Gemini Error", err);
      onMessage("Error booting Aural Ingestion: " + (err as any).message);
      cleanup();
    }
  }, [cleanup, onSpeakingChange, onMessage]);

  return { isConnected, connect, disconnect: cleanup };
}
