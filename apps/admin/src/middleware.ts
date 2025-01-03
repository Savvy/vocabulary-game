import { auth } from "./lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isAuthenticated = req.auth?.user
    const isLoginPage = req.nextUrl.pathname === "/login"
    const isApiAuthRoute = req.nextUrl.pathname.startsWith("/api/auth")

    // Allow API auth routes to pass through
    if (isApiAuthRoute) {
        return NextResponse.next()
    }

    // Redirect unauthenticated users to login
    if (!isAuthenticated && !isLoginPage) {
        const redirectUrl = new URL("/login", req.url)
        redirectUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
        return Response.redirect(redirectUrl)
    }

    // Redirect authenticated users away from login
    if (isAuthenticated && isLoginPage) {
        return Response.redirect(new URL("/", req.url))
    }

    return NextResponse.next()
})

// Protect all routes except static assets and auth-related paths
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
    ],
} 