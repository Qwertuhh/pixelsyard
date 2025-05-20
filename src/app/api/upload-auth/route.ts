import { getUploadAuthParams } from "@imagekit/next/server";
import { NextResponse } from "next/server";
export async function GET() {
  // The application logic to authenticate the user
  // If the user is not authenticated, you can return an error response

  const { token, expire, signature } = getUploadAuthParams({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
    // expire: 30 * 30,  //? The expiry time of the token in seconds, maximum 1 hour in the future
  });

  if (!token || !expire || !signature) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }

  return NextResponse.json({
    token,
    expire,
    signature,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  }, { status: 200 });
}
