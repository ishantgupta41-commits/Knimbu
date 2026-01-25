"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
      style={{ backgroundColor: "#F9FDF7" }}
    >
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center justify-center">
          <img src="/knimbu-logo.png" alt="Knimbu" className="h-24 w-auto" />
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
