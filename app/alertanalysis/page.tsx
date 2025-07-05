"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mic, MicOff, Play, Pause, Cpu, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { WaveformPlayer } from '@/components/ui/WaveformPlayer'

// Function to generate automatic titles based on transcript and department
function generateTitle(transcript: string, department: string): string {
  const lowerTranscript = transcript.toLowerCase()

  if (lowerTranscript.includes("fire") || lowerTranscript.includes("smoke") || lowerTranscript.includes("burning")) {
    if (lowerTranscript.includes("warehouse")) return "Fire Alert at Warehouse Building"
    if (lowerTranscript.includes("kitchen")) return "Kitchen Fire Emergency"
    if (lowerTranscript.includes("elevator")) return "Fire Emergency Near Elevator"
    return "Fire Safety Alert"
  }

  if (
    lowerTranscript.includes("medical") ||
    lowerTranscript.includes("hurt") ||
    lowerTranscript.includes("injured") ||
    lowerTranscript.includes("चिकित्सा") ||
    lowerTranscript.includes("सिर दर्द")
  ) {
    if (lowerTranscript.includes("chest")) return "Medical Emergency - Chest Pain"
    if (lowerTranscript.includes("head") || lowerTranscript.includes("सिर")) return "Medical Alert - Head Injury"
    return "Medical Emergency Alert"
  }

  if (
    lowerTranscript.includes("security") ||
    lowerTranscript.includes("suspicious") ||
    lowerTranscript.includes("intruder")
  ) {
    if (lowerTranscript.includes("parking")) return "Security Alert - Parking Area"
    if (lowerTranscript.includes("entrance")) return "Security Breach at Main Entrance"
    return "Security Alert"
  }

  if (lowerTranscript.includes("water") || lowerTranscript.includes("leak") || lowerTranscript.includes("flooding")) {
    if (lowerTranscript.includes("basement")) return "Water Leak in Basement"
    if (lowerTranscript.includes("bathroom")) return "Plumbing Issue - Restroom"
    return "Facilities Alert - Water Issue"
  }

  if (
    lowerTranscript.includes("power") ||
    lowerTranscript.includes("electricity") ||
    lowerTranscript.includes("outage")
  ) {
    return "Power Outage Alert"
  }

  if (
    lowerTranscript.includes("air conditioning") ||
    lowerTranscript.includes("hvac") ||
    lowerTranscript.includes("temperature")
  ) {
    if (lowerTranscript.includes("conference")) return "HVAC Issue - Conference Room"
    return "Climate Control Alert"
  }

  if (
    lowerTranscript.includes("false alarm") ||
    lowerTranscript.includes("never mind") ||
    lowerTranscript.includes("okay now")
  ) {
    return "False Alarm Report"
  }

  if (lowerTranscript.includes("elevator") && !lowerTranscript.includes("fire")) {
    return "Elevator Malfunction Alert"
  }

  if (lowerTranscript.includes("slip") || lowerTranscript.includes("fall") || lowerTranscript.includes("accident")) {
    return "Accident Report - Slip and Fall"
  }

  // Default based on department
  return `${department} Alert`
}

interface Recording {
  id: number
  timestamp: string
  language: string
  isPlaying: boolean
  audioUrl?: string
  department?: string
  transcript?: string
  AITranslation_Logic?: {
    translatedReport: string;
    followUpQuestions: string[];
    routingExplanation: string;
  };
}

// Waveform component
function Waveform({ isRecording }: { isRecording: boolean }) {
  const [bars, setBars] = useState(Array(20).fill(0))

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setBars((prev) => prev.map(() => Math.random() * 100))
      }, 100)
      return () => clearInterval(interval)
    } else {
      setBars(Array(20).fill(0))
    }
  }, [isRecording])

  return (
    <div className="flex items-center justify-center space-x-1 h-20">
      {bars.map((height, index) => (
        <div
          key={index}
          className="bg-primary rounded-full transition-all duration-100"
          style={{
            width: "4px",
            height: isRecording ? `${Math.max(height, 10)}%` : "10%",
            opacity: isRecording ? 0.7 + height / 200 : 0.3,
          }}
        />
      ))}
    </div>
  )
}

function formatToIST(dateString: string) {
  const date = new Date(dateString);
  // Convert to IST (UTC+5:30)
  const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
  // Format: 05 July 2024, 03:35 PM
  return istDate.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  }).replace(',', '').replace(/(\d{2}):(\d{2}) ([AP]M)/, (m, h, min, ampm) => `${h}:${min} ${ampm}`);
}

export default function AlertAnalysisPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRefs = useRef<{ [id: number]: HTMLAudioElement | null }>({})

  // Load recordings on component mount
  useEffect(() => {
    fetchRecordings()
  }, [])

  const fetchRecordings = async () => {
    try {
      const response = await fetch('/api/alerts/list')
      const alerts = await response.json()
      
      const recordingsData: Recording[] = alerts.map((alert: any) => ({
        id: alert.id,
        timestamp: new Date(alert.recording.timestamp).toLocaleString("en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2}:\d{2})/, "$3-$2-$1 $4"),
        language: alert.recording.language,
        isPlaying: false,
        audioUrl: alert.recording.audioUrl,
        department: alert.department,
        transcript: alert.transcript,
        AITranslation_Logic: alert.AITranslation_Logic,
      }))
      
      setRecordings(recordingsData)
    } catch (error) {
      console.error('Error fetching recordings:', error)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await processRecording(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingStartTime(new Date())
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Error accessing microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processRecording = async (audioBlob: Blob) => {
    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob)
      formData.append('provider', 'gpt') // or 'gemini'
      
      const response = await fetch('/api/voice/analyze', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Failed to analyze recording')
      }
      
      // Refresh recordings list
      await fetchRecordings()
    } catch (error) {
      console.error('Error processing recording:', error)
      alert('Error processing recording. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleRecording = () => {
    if (!isRecording) {
      startRecording()
    } else {
      stopRecording()
    }
  }

  const handlePlayback = (id: number, audioUrl?: string) => {
    setRecordings(prev =>
      prev.map(rec =>
        rec.id === id
          ? { ...rec, isPlaying: !rec.isPlaying }
          : { ...rec, isPlaying: false }
      )
    )
    // Pause all other audios
    Object.entries(audioRefs.current).forEach(([key, audio]) => {
      if (Number(key) !== id && audio) audio.pause();
    });
    const audio = audioRefs.current[id];
    if (audio) {
      if (audio.paused) {
        audio.currentTime = 0;
        audio.play();
      } else {
        audio.pause();
      }
    }
  }

  const handleAudioEnded = (id: number) => {
    setRecordings(prev =>
      prev.map(rec =>
        rec.id === id ? { ...rec, isPlaying: false } : rec
      )
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Mobile Header - Back button on top */}
          <div className="md:hidden mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>

          {/* Header Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div className="flex items-center space-x-3">
                  <Image
                    src="/ddlogo.png"
                    alt="DD Innovations Logo"
                    width={100}
                    height={70}
                    className="w-16 h-auto md:w-20 md:h-auto object-contain"
                  />
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                      Intelligent Voice Alert Analysis System
                    </h1>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                {/* Status Indicator */}
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-sm text-gray-600 hidden md:block">Device Online</span>
                </div>

                {/* Device Info */}
                <div className="flex items-center space-x-3 border-l border-gray-200 pl-6">
                  <div className="bg-primary/10 rounded-full p-2">
                    <Cpu className="h-5 w-5 text-primary" />
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold text-gray-900">Jan Rakshak</p>
                    <p className="text-xs text-gray-600">North West Unit • JR108</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden">
              <div className="flex items-center space-x-3">
                <Image
                  src="/ddlogo.png"
                  alt="DD Innovations Logo"
                  width={60}
                  height={40}
                  className="w-12 h-auto object-contain"
                />
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Voice Alert Analysis</h1>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Device Info Card */}
          <div className="md:hidden mb-6">
            <Card className="bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <Cpu className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Jan Rakshak</p>
                      <p className="text-xs text-gray-600">North West Unit • JR108</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-600">Online</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Voice Recorder Section */}
          <Card className="mb-8 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-xl md:text-2xl text-gray-900">AI Voice Recorder</CardTitle>
              <p className="text-center text-gray-600">Real-time audio analysis with automatic language detection</p>
            </CardHeader>
            <CardContent className="text-center">
              {/* Waveform Visualization */}
              <div className="mb-8 bg-gray-50 rounded-lg p-6">
                <Waveform isRecording={isRecording} />
              </div>

              {/* Record Button */}
              <Button
                onClick={toggleRecording}
                size="lg"
                disabled={isProcessing}
                className={`rounded-full w-16 h-16 md:w-20 md:h-20 ${
                  isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : 
                  isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary/90"
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="h-6 w-6 md:h-8 md:w-8" />
                ) : (
                  <Mic className="h-6 w-6 md:h-8 md:w-8" />
                )}
              </Button>

              <p className="mt-4 text-gray-600">
                {isProcessing 
                  ? "Processing audio with AI..." 
                  : isRecording 
                    ? "Recording... Click to stop and auto-analyze" 
                    : "Click to start AI-powered recording"
                }
              </p>
            </CardContent>
          </Card>

          {/* Previous Recordings */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl text-gray-900">Previous Recordings</CardTitle>
              <p className="text-sm text-gray-600">Auto-analyzed audio recordings with language detection</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recordings.map((recording) => (
                  <Card key={recording.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePlayback(recording.id, recording.audioUrl)}
                            className="rounded-full w-10 h-10 p-0 flex-shrink-0"
                          >
                            {recording.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900">
                              {recording.department && recording.transcript 
                                ? generateTitle(recording.transcript, recording.department)
                                : `Recording ${recording.id}`
                              }
                            </p>
                            <p className="text-sm text-gray-600 truncate">{formatToIST(recording.timestamp)}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary self-start md:self-center">
                          {recording.language}
                        </Badge>
                      </div>
                      {/* Hidden Audio Element */}
                      <audio
                        ref={el => {
                          audioRefs.current[recording.id] = el;
                          return undefined;
                        }}
                        src={recording.audioUrl}
                        onEnded={() => handleAudioEnded(recording.id)}
                        style={{ display: 'none' }}
                      />
                      {/* Real Waveform Visualization for Playback */}
                      <WaveformPlayer
                        audioUrl={recording.audioUrl || ''}
                        isPlaying={!!recording.isPlaying}
                        onEnded={() => handleAudioEnded(recording.id)}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fixed Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">© 2025 Copyright DD Innovations. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
