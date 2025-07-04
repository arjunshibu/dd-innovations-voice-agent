import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(request: NextRequest) {
  try {
    const { id, isResolved, department, urgency, isFalseAlarm } =
      await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Alert ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (typeof isResolved === "boolean") {
      updateData.isResolved = isResolved;
      if (isResolved) {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = department || "System";
      } else {
        updateData.resolvedAt = null;
        updateData.resolvedBy = null;
      }
    }

    if (department) {
      updateData.department = department;
    }

    if (urgency) {
      updateData.urgency = urgency;
    }

    if (typeof isFalseAlarm === "boolean") {
      updateData.isFalseAlarm = isFalseAlarm;
    }

    const alert = await prisma.alert.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        recording: true,
      },
    });

    return NextResponse.json(alert);
  } catch (error) {
    console.error("Error updating alert:", error);
    return NextResponse.json(
      { error: "Failed to update alert" },
      { status: 500 }
    );
  }
}
