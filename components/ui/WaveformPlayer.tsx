import React, { useEffect, useRef } from 'react';

interface WaveformPlayerProps {
  audioUrl: string;
  isPlaying: boolean;
  onEnded?: () => void;
}

const WIDTH = 300;
const HEIGHT = 48;

export const WaveformPlayer: React.FC<WaveformPlayerProps> = ({ audioUrl, isPlaying, onEnded }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // Load audio buffer once
  useEffect(() => {
    let isMounted = true;
    const loadAudio = async () => {
      if (!audioUrl) return;
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      if (isMounted) bufferRef.current = audioBuffer;
    };
    loadAudio();
    return () => {
      isMounted = false;
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      cancelAnimationFrame(animationRef.current!);
    };
  }, [audioUrl]);

  // Handle playback
  useEffect(() => {
    if (!isPlaying || !bufferRef.current || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const source = ctx.createBufferSource();
    source.buffer = bufferRef.current;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);
    analyser.connect(ctx.destination);
    sourceRef.current = source;
    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;
    source.start();
    source.onended = () => {
      if (onEnded) onEnded();
    };
    draw();
    return () => {
      source.stop();
      source.disconnect();
      analyser.disconnect();
      cancelAnimationFrame(animationRef.current!);
    };
    // eslint-disable-next-line
  }, [isPlaying]);

  // Stop playback when isPlaying becomes false
  useEffect(() => {
    if (!isPlaying && sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    // eslint-disable-next-line
  }, [isPlaying]);

  // Draw waveform
  const draw = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    if (!canvas || !analyser || !dataArray) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    analyser.getByteTimeDomainData(dataArray);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.beginPath();
    const sliceWidth = WIDTH / dataArray.length;
    let x = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * HEIGHT) / 2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.lineTo(WIDTH, HEIGHT / 2);
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2;
    ctx.stroke();
    animationRef.current = requestAnimationFrame(draw);
  };

  return <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{ width: '100%', height: 48, background: '#f8fafc', borderRadius: 8 }} />;
}; 