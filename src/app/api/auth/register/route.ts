import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 }
      );
    }
    const existingUser = await database.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }
    const user = await database.user.create({
      data: {
        email,
        password,
        name,
      },
    });

    return NextResponse.json(
      { message: "User created", user: user },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({error: "Internal server error"}, { status: 501 });
  }
}

export { POST };
