export interface VoiceRecording {
  id: number;
  filename: string;
  timestamp: string;
  language: string;
  transcript: string;
  audioUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: number;
  recordingId: number;
  title: string;
  transcript: string;
  department: string;
  urgency: string;
  isResolved: boolean;
  resolvedAt: string | null;
  resolvedBy: string | null;
  isFalseAlarm: boolean;
  isLatest: boolean;
  isPlaying?: boolean;
  createdAt: string;
  updatedAt: string;
  recording: VoiceRecording;
}

export interface Department {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface ClassificationResult {
  title: string;
  department: string;
  urgency: string;
  isFalseAlarm: boolean;
  summary: string;
}

export interface TranscriptionResult {
  text: string;
  language: string;
}

export type AIProvider = "gpt" | "gemini";

export type UrgencyLevel = "High Priority" | "Medium Priority" | "General Task";

export type DepartmentType =
  | "Emergency Medical Team"
  | "Fire Safety Team"
  | "Security Team"
  | "Facilities Team"
  | "Administration Team"
  | "Housekeeping Team"
  | "IT Support Team"
  | "Maintenance Team";
