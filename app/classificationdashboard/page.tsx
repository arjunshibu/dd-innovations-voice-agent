"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Play,
  Pause,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Volume2,
  Bell,
  User,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { WaveformPlayer } from '@/components/ui/WaveformPlayer'

interface Alert {
  id: number
  recordingId: number
  title: string
  transcript: string
  department: string
  urgency: string
  isResolved: boolean
  resolvedAt: string | null
  resolvedBy: string | null
  isFalseAlarm: boolean
  isLatest: boolean
  isPlaying?: boolean
  createdAt: string
  recording: {
    id: number
    timestamp: string
    language: string
    audioUrl: string
  }
}

// Dummy notifications data
const dummyNotifications = [
  {
    id: 1,
    title: "New High Priority Alert",
    message: "Medical emergency reported in Building A",
    time: "2 minutes ago",
    type: "urgent",
  },
  {
    id: 2,
    title: "Alert Resolved",
    message: "Fire safety issue in Warehouse has been resolved",
    time: "15 minutes ago",
    type: "success",
  },
  {
    id: 3,
    title: "System Update",
    message: "Jan Rakshak JR108 firmware updated successfully",
    time: "1 hour ago",
    type: "info",
  },
  {
    id: 4,
    title: "New Recording",
    message: "Voice alert received from North West Unit",
    time: "2 hours ago",
    type: "info",
  },
]

// Function to generate automatic titles based on transcript
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

// Mock data for classified recordings with resolved status - 10 diverse scenarios
const mockClassifiedRecordings = [
  {
    id: 1,
    timestamp: "2024-01-15 13:45:10",
    language: "Hindi",
    transcript: "मुझे चिकित्सा सहायता की आवश्यकता है। मेरा सिर दर्द हो रहा है और मुझे चक्कर आ रहे हैं।",
    department: "Emergency Medical Team",
    urgency: "Medium Priority",
    isPlaying: false,
    isFalseAlarm: false,
    isResolved: false,
    resolvedBy: null,
    resolvedAt: null,
    isLatest: true,
  },
  {
    id: 2,
    timestamp: "2024-01-15 14:30:22",
    language: "English",
    transcript:
      "Emergency! There is a fire on the 3rd floor near the elevator. I can see smoke coming from the electrical room. Please send help immediately.",
    department: "Fire Safety Team",
    urgency: "High Priority",
    isPlaying: false,
    isFalseAlarm: false,
    isResolved: true,
    resolvedBy: "Fire Safety Team",
    resolvedAt: "2024-01-15 14:45:30",
    isLatest: false,
  },
  {
    id: 3,
    timestamp: "2024-01-15 12:20:05",
    language: "English",
    transcript:
      "The air conditioning in conference room B is not working properly. The temperature is very high and people are uncomfortable.",
    department: "Facilities Team",
    urgency: "General Task",
    isPlaying: false,
    isFalseAlarm: false,
    isResolved: true,
    resolvedBy: "Facilities Team",
    resolvedAt: "2024-01-15 13:15:20",
    isLatest: false,
  },
  {
    id: 4,
    timestamp: "2024-01-15 11:15:30",
    language: "English",
    transcript: "Never mind, false alarm. Everything is okay now. The smoke was just from the kitchen.",
    department: "Administration Team",
    urgency: "General Task",
    isPlaying: false,
    isFalseAlarm: true,
    isResolved: true,
    resolvedBy: "Administration Team",
    resolvedAt: "2024-01-15 11:20:15",
    isLatest: false,
  },
  {
    id: 5,
    timestamp: "2024-01-15 10:45:18",
    language: "English",
    transcript:
      "There's a suspicious person in the parking area who has been loitering for over an hour. They seem to be checking car doors.",
    department: "Security Team",
    urgency: "Medium Priority",
    isPlaying: false,
    isFalseAlarm: false,
    isResolved: true,
    resolvedBy: "Security Team",
    resolvedAt: "2024-01-15 11:00:25",
    isLatest: false,
  },
  {
    id: 6,
    timestamp: "2024-01-15 09:30:45",
    language: "English",
    transcript:
      "Someone has slipped and fallen in the main lobby near the entrance. They appear to be injured and need medical attention.",
    department: "Emergency Medical Team",
    urgency: "High Priority",
    isPlaying: false,
    isFalseAlarm: false,
    isResolved: true,
    resolvedBy: "Emergency Medical Team",
    resolvedAt: "2024-01-15 09:45:12",
    isLatest: false,
  },
  {
    id: 7,
    timestamp: "2024-01-15 08:15:33",
    language: "English",
    transcript: "The elevator on the second floor is stuck between floors. There are three people trapped inside.",
    department: "Maintenance Team",
    urgency: "High Priority",
    isPlaying: false,
    isFalseAlarm: false,
    isResolved: true,
    resolvedBy: "Maintenance Team",
    resolvedAt: "2024-01-15 08:45:20",
    isLatest: false,
  },
  {
    id: 8,
    timestamp: "2024-01-15 07:50:12",
    language: "English",
    transcript:
      "There's a water leak in the basement storage room. Water is spreading quickly and may damage equipment.",
    department: "Facilities Team",
    urgency: "Medium Priority",
    isPlaying: false,
    isFalseAlarm: false,
    isResolved: true,
    resolvedBy: "Facilities Team",
    resolvedAt: "2024-01-15 08:30:45",
    isLatest: false,
  },
  {
    id: 9,
    timestamp: "2024-01-15 07:20:08",
    language: "English",
    transcript: "Power outage in the east wing. All computers and lights are down. This is affecting our operations.",
    department: "IT Support Team",
    urgency: "Medium Priority",
    isPlaying: false,
    isFalseAlarm: false,
    isResolved: true,
    resolvedBy: "IT Support Team",
    resolvedAt: "2024-01-15 07:55:30",
    isLatest: false,
  },
  {
    id: 10,
    timestamp: "2024-01-15 06:45:22",
    language: "English",
    transcript: "There's a strong smell of gas in the kitchen area. Staff have been evacuated as a precaution.",
    department: "Fire Safety Team",
    urgency: "High Priority",
    isPlaying: false,
    isFalseAlarm: false,
    isResolved: true,
    resolvedBy: "Fire Safety Team",
    resolvedAt: "2024-01-15 07:10:15",
    isLatest: false,
  },
]

// Updated departments list
const departments = [
  "Emergency Medical Team",
  "General Health Team",
  "Fire Safety Team",
  "Security Team",
  "Facilities Team",
  "Administration Team",
  "Housekeeping Team",
  "IT Support Team",
  "Maintenance Team",
]

const urgencyLevels = ["High Priority", "Medium Priority", "General Task"]

// Audio playback waveform component
function PlaybackWaveform({ isPlaying }: { isPlaying: boolean }) {
  const [bars, setBars] = useState(Array(15).fill(0))

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setBars((prev) => prev.map(() => Math.random() * 80 + 20))
      }, 150)
      return () => clearInterval(interval)
    } else {
      setBars(Array(15).fill(20))
    }
  }, [isPlaying])

  return (
    <div className="flex items-center justify-center space-x-1 h-12">
      {bars.map((height, index) => (
        <div
          key={index}
          className="bg-primary rounded-full transition-all duration-150"
          style={{
            width: "3px",
            height: `${height}%`,
            opacity: isPlaying ? 0.6 + height / 200 : 0.4,
          }}
        />
      ))}
    </div>
  )
}

function getUrgencyIcon(urgency: string) {
  switch (urgency) {
    case "High Priority":
      return <AlertTriangle className="h-4 w-4" />
    case "Medium Priority":
      return <Clock className="h-4 w-4" />
    default:
      return <CheckCircle className="h-4 w-4" />
  }
}

function getUrgencyColor(urgency: string) {
  switch (urgency) {
    case "High Priority":
      return "bg-red-100 text-red-800 border-red-200"
    case "Medium Priority":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    default:
      return "bg-green-100 text-green-800 border-green-200"
  }
}

function getCardBorderColor(urgency: string, isFalseAlarm: boolean, isResolved: boolean) {
  if (isResolved) return "border-t-4 border-t-green-500"
  if (isFalseAlarm) return "border-t-4 border-t-gray-400"
  switch (urgency) {
    case "High Priority":
      return "border-t-4 border-t-red-500"
    case "Medium Priority":
      return "border-t-4 border-t-yellow-500"
    default:
      return "border-t-4 border-t-green-500"
  }
}

export default function ClassificationDashboard() {
  const [recordings, setRecordings] = useState<Alert[]>([])
  const [animationClass, setAnimationClass] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const audioRefs = useRef<{ [id: number]: HTMLAudioElement | null }>({})

  // Load alerts on component mount
  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts/list')
      const alerts = await response.json()
      setRecordings(alerts)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const newRecordingsCount = recordings.filter((r) => !r.isResolved && !r.isFalseAlarm).length

  // Sort recordings to put latest (animated) card first
  const sortedRecordings = [...recordings].sort((a, b) => {
    if (a.isLatest && !b.isLatest) return -1
    if (!a.isLatest && b.isLatest) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // Handle short animation for latest card
  useEffect(() => {
    const latestCard = recordings.find((r) => r.isLatest)
    if (latestCard) {
      setAnimationClass("animate-pulse ring-2 ring-primary/20")
      const timer = setTimeout(() => {
        setAnimationClass("")
      }, 2000) // 2 seconds animation
      return () => clearTimeout(timer)
    }
  }, [recordings])

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
  };

  const handleAudioEnded = (id: number) => {
    setRecordings(prev =>
      prev.map(rec =>
        rec.id === id ? { ...rec, isPlaying: false } : rec
      )
    );
  };

  const updateDepartment = async (id: number, department: string) => {
    try {
      const response = await fetch('/api/alerts/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, department }),
      })
      
      if (response.ok) {
        await fetchAlerts() // Refresh data
      }
    } catch (error) {
      console.error('Error updating department:', error)
    }
  }

  const updateUrgency = async (id: number, urgency: string) => {
    try {
      const response = await fetch('/api/alerts/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, urgency }),
      })
      
      if (response.ok) {
        await fetchAlerts() // Refresh data
      }
    } catch (error) {
      console.error('Error updating urgency:', error)
    }
  }

  const markAsResolved = async (id: number) => {
    try {
      const response = await fetch('/api/alerts/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isResolved: true }),
      })
      
      if (response.ok) {
        await fetchAlerts() // Refresh data
      }
    } catch (error) {
      console.error('Error marking as resolved:', error)
    }
  }

  const highPriorityCount = recordings.filter(a => a.urgency === "High Priority" && !a.isResolved).length;
  const mediumPriorityCount = recordings.filter(a => a.urgency === "Medium Priority" && !a.isResolved).length;
  const generalTaskCount = recordings.filter(a => a.urgency === "General Task" && !a.isResolved).length;
  const resolvedCount = recordings.filter(a => a.isResolved).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
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
                    Intelligent Alert Classification Dashboard
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Bell className="h-5 w-5 text-gray-600" />
                        {newRecordingsCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {newRecordingsCount}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-600 hidden lg:block">
                        {newRecordingsCount} new recording{newRecordingsCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-2">
                    <h3 className="font-semibold text-sm text-gray-900 mb-2">Recent Notifications</h3>
                    {dummyNotifications.map((notification) => (
                      <DropdownMenuItem key={notification.id} className="p-3 cursor-pointer">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                notification.type === "urgent"
                                  ? "bg-red-500"
                                  : notification.type === "success"
                                    ? "bg-green-500"
                                    : "bg-blue-500"
                              }`}
                            />
                            <span className="font-medium text-sm">{notification.title}</span>
                          </div>
                          <p className="text-xs text-gray-600 ml-4">{notification.message}</p>
                          <span className="text-xs text-gray-400 ml-4">{notification.time}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Info */}
              <div className="flex items-center space-x-3 border-l border-gray-200 pl-6">
                <div className="bg-primary/10 rounded-full p-2">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-gray-900">Atul Patel</p>
                  <p className="text-xs text-gray-600">SOS Management</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Image
                  src="/ddlogo.png"
                  alt="DD Innovations Logo"
                  width={60}
                  height={40}
                  className="w-12 h-auto object-contain"
                />
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Alert Dashboard</h1>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Mobile Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="h-5 w-5 text-gray-600" />
                      {newRecordingsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                          {newRecordingsCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72">
                    <div className="p-2">
                      <h3 className="font-semibold text-sm text-gray-900 mb-2">Notifications</h3>
                      {dummyNotifications.slice(0, 3).map((notification) => (
                        <DropdownMenuItem key={notification.id} className="p-2 cursor-pointer">
                          <div className="flex flex-col space-y-1">
                            <span className="font-medium text-xs">{notification.title}</span>
                            <p className="text-xs text-gray-600">{notification.message}</p>
                            <span className="text-xs text-gray-400">{notification.time}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile User */}
                <div className="bg-primary/10 rounded-full p-2">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-red-600">{highPriorityCount}</div>
              <div className="text-gray-700">High Priority</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{mediumPriorityCount}</div>
              <div className="text-gray-700">Medium Priority</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-green-600">{generalTaskCount}</div>
              <div className="text-gray-700">General Tasks</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-blue-600">{resolvedCount}</div>
              <div className="text-gray-700">Resolved</div>
            </CardContent>
          </Card>
        </div>

        {/* Classified Recordings */}
        <div className="space-y-6">
          {sortedRecordings.map((recording) => (
            <Card
              key={recording.id}
              className={`bg-white shadow-lg ${getCardBorderColor(recording.urgency, recording.isFalseAlarm, recording.isResolved)} ${
                recording.isLatest ? animationClass : ""
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-lg text-gray-900">
                      {generateTitle(recording.transcript, recording.department)}
                    </CardTitle>
                    {recording.isLatest && <Badge className="bg-primary text-white">New</Badge>}
                  </div>
                  <div className="flex items-center space-x-2">
                    {recording.isFalseAlarm && (
                      <Badge variant="destructive" className="bg-red-100 text-red-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        False Alarm
                      </Badge>
                    )}
                    {recording.isResolved && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Resolved
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 text-sm text-gray-600">
                  <span>{recording.recording.timestamp}</span>
                  <Badge variant="secondary" className="bg-primary/10 text-primary self-start">
                    {recording.recording.language}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Enhanced Audio Playback Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePlayback(recording.id, recording.recording.audioUrl)}
                        className="rounded-full w-10 h-10 p-0 bg-white hover:bg-primary/10"
                      >
                        {recording.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <div className="flex items-center space-x-2">
                        <Volume2 className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Audio Playback</span>
                      </div>
                    </div>

                  </div>

                  {/* Waveform Visualization */}
                  <WaveformPlayer
                    audioUrl={recording.recording.audioUrl || ''}
                    isPlaying={!!recording.isPlaying}
                    onEnded={() => handleAudioEnded(recording.id)}
                  />
                </div>

                {/* Transcript */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">AI Transcript:</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm md:text-base border border-gray-200">
                    {recording.transcript}
                  </p>
                </div>

                {/* Department and Urgency Controls */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department Assignment</label>
                    <Select
                      value={recording.department}
                      onValueChange={(value) => updateDepartment(recording.id, value)}
                      disabled={recording.isResolved}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Classification</label>
                    <Select
                      value={recording.urgency}
                      onValueChange={(value) => updateUrgency(recording.id, value)}
                      disabled={recording.isResolved}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {urgencyLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Resolution Section */}
                {recording.isResolved ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <h4 className="font-medium text-green-900">Issue Resolved</h4>
                    </div>
                    <p className="text-sm text-green-700">
                      Resolved by <span className="font-medium">{recording.resolvedBy}</span> at {recording.resolvedAt}
                    </p>
                  </div>
                ) : (
                  !recording.isFalseAlarm && (
                    <div className="flex justify-end">
                      <Button
                        onClick={() => markAsResolved(recording.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark as Resolved
                      </Button>
                    </div>
                  )
                )}

                {/* Current Classification Display */}
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 pt-2">
                  <Badge className={`${getUrgencyColor(recording.urgency)} border self-start`}>
                    {getUrgencyIcon(recording.urgency)}
                    <span className="ml-1">{recording.urgency}</span>
                  </Badge>
                  <Badge variant="outline" className="border-primary/20 text-primary self-start">
                    {recording.department}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
