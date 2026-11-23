import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { getDashboardPath } from "@/lib/roles"

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  return NextResponse.redirect(
    new URL(getDashboardPath(session.user.role), request.url)
  )
}
