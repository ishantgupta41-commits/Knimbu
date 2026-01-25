"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
  isLoading: boolean
  userId: string | null
  userName: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Dummy credentials with different user IDs
const DUMMY_USERS = [
  {
    email: "admin@knimbu.com",
    password: "password123",
    userId: "user-admin-001",
    name: "Admin User"
  },
  {
    email: "john@knimbu.com",
    password: "password123",
    userId: "user-john-002",
    name: "John Doe"
  },
  {
    email: "sarah@knimbu.com",
    password: "password123",
    userId: "user-sarah-003",
    name: "Sarah Smith"
  }
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const authStatus = localStorage.getItem("knimbu_auth")
    const storedUserId = localStorage.getItem("knimbu_user_id")
    const storedUserName = localStorage.getItem("knimbu_user_name")
    
    if (authStatus === "true" && storedUserId) {
      setIsAuthenticated(true)
      setUserId(storedUserId)
      setUserName(storedUserName)
    }
    setIsLoading(false)
  }, [])

  const login = (email: string, password: string): boolean => {
    // Check against dummy users
    const user = DUMMY_USERS.find(u => u.email === email && u.password === password)
    
    if (user) {
      setIsAuthenticated(true)
      setUserId(user.userId)
      setUserName(user.name)
      localStorage.setItem("knimbu_auth", "true")
      localStorage.setItem("knimbu_user_id", user.userId)
      localStorage.setItem("knimbu_user_name", user.name)
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUserId(null)
    setUserName(null)
    localStorage.removeItem("knimbu_auth")
    localStorage.removeItem("knimbu_user_id")
    localStorage.removeItem("knimbu_user_name")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading, userId, userName }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
