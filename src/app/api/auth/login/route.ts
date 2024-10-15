import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/spotify";

export async function GET() {
  return NextResponse.redirect(getAuthUrl());
}
