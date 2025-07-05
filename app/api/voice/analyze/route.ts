import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/db";
import { transcribeAudio, classifyEmergency } from "@/lib/ai-services";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioBlob = formData.get("audio") as Blob;
    const provider = (formData.get("provider") as string) || "gpt";

    if (!audioBlob) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Create output directory if it doesn't exist
    const outputDir = join(process.cwd(), "public", "recordings");
    await mkdir(outputDir, { recursive: true });

    // Generate sequential filename
    const timestamp = Date.now();
    const filename = `recording_${timestamp}.wav`;
    const filePath = join(outputDir, filename);

    // Convert blob to buffer and save file
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    // Transcribe audio using ElevenLabs
    const { text: transcript, language } = await transcribeAudio(audioBlob);

    // Classify the emergency using AI
    const classification = await classifyEmergency(
      transcript,
      language,
      provider as "gpt" | "gemini"
    );

    // If department or urgency is 'Unclear', set language to 'Unclear'
    const finalLanguage =
      classification.department === "Unclear" ||
      classification.urgency === "Unclear"
        ? "Unclear"
        : language;

    // Calculate duration (you might want to get this from the audio metadata)
    const duration = "0:30"; // This should be calculated from actual audio duration

    // Save to database
    const recording = await prisma.voiceRecording.create({
      data: {
        filename,
        duration,
        language: finalLanguage,
        transcript,
        audioUrl: `/recordings/${filename}`,
      },
    });

    // Create alert
    const alert = await prisma.alert.create({
      data: {
        recordingId: recording.id,
        title: classification.title,
        transcript,
        department: classification.department,
        urgency: classification.urgency,
        isFalseAlarm: classification.isFalseAlarm,
        isLatest: true,
        AITranslation_Logic: classification.AITranslation_Logic || null,
      },
    });

    // Update all other alerts to not be latest
    await prisma.alert.updateMany({
      where: {
        id: { not: alert.id },
      },
      data: {
        isLatest: false,
      },
    });

    return NextResponse.json({
      success: true,
      recording,
      alert,
      classification,
    });
  } catch (error) {
    console.error("Voice analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze voice recording" },
      { status: 500 }
    );
  }
}
