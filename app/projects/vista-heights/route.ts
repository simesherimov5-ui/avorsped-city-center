import { NextResponse } from "next/server";

/** The old address of Станбена Куќа: it moves for good to its new address (a 308, so the old links keep working). */
export function GET(request: Request) {
  return NextResponse.redirect(new URL("/projects/stanbena-kukja", request.url), 308);
}
