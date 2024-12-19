import { getUserHabits } from "@/app/services/cosmosDBService";
import { getHealthTips, getPersonalSuggestions } from "@/app/services/openAIService";
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

    const { prompt } = await req.json();
    const tips = await getHealthTips(prompt);
    return NextResponse.json({ tips }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 401 });
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
    const suggestions = await getPersonalSuggestions(habits);
    return NextResponse.json({ suggestions }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 401 });
  }
}
