import { NextResponse, NextRequest } from "next/server";
import { database } from "@/lib/database";
import { getServerSession } from "next-auth";
import authOptions  from "@/lib/auth";

async function GET() {
  try {
    const products =await  database.product.findMany({});
    if (!products || products.length === 0) {
      return NextResponse.json({ error: "Products not found" }, { status: 500 });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: `${error}` }, { status: 500 });
  }
}


async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role == "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const {name, description, variants, imageURL}= await req.json();
    if (!name || !description || variants|| variants?.length === 0 || !imageURL) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const product = await database.product.create({
      data: {
        name,
        description,
        variants,
        imageURL,
      },
    });

    return NextResponse.json({ message: "Product created", product }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: `${error}` }, { status: 500 });
  }
}

export { GET , POST };