import { authenticateUser, registerUser } from "@/app/services/cosmosDBService";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const action = req.nextUrl.searchParams.get("action");

  try {
    if (action === "register") {
      const user = await registerUser(username, password);
      return NextResponse.json(user, { status: 201 });
    } 
    if (action === "login") {
      const { token, userId } = await authenticateUser(username, password);
      return NextResponse.json({ token, userId }, { status: 200 });
    }  
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
