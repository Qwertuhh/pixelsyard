import { NextResponse, NextRequest } from "next/server";
import { database } from "@/lib/database";

async function GET(req: NextRequest, props: { params: { id: string } }) {
    try {
        const id = props.params.id

        const product = await database.product.findUnique({
            where: {
                id
            }
        })
        if(!product) {
            console.log("Product not found");
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Product found", product }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: error }, { status: 500 });
    }
}

export { GET };