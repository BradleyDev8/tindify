import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/spotify";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const tokens = await getAccessToken(code);
    // In a real application, you'd want to securely store these tokens
    // For this example, we'll just set them as cookies
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set("access_token", tokens.access_token, {
      httpOnly: true,
      secure: true,
    });
    response.cookies.set("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: true,
    });
    return response;
  }

  return NextResponse.redirect(new URL("/error", request.url));
}
