import { addUserHabit, getUserHabits } from "@/app/services/cosmosDBService";
import jwt from "jsonwebtoken";
import { type NextRequest, NextResponse } from "next/server";

const jwtSecret = process.env.JWT_SECRET || "";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    const habit = { ...await req.json(), userId };
    const addedHabit = await addUserHabit(habit);
    return NextResponse.json(addedHabit, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    const habits = await getUserHabits(userId);
    return NextResponse.json(habits, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
