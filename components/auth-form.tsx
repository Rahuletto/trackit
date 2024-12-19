'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "./ui/toaster"

export default function AuthForm({ setToken }: { setToken: (token: string) => void }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  const handleAuth = async (action: 'register' | 'login') => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/auth?action=${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Authentication failed')
      if (action === 'login') {
        localStorage.setItem("token", data.token)
        setToken(data.token)
      } else {
        toast({ title: "Registration successful", description: "Please log in with your new account" })
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: "Authentication Error", description: (error as Error).message, variant: "destructive" })
      } else {
        toast({ title: "Authentication Error", description: "An unknown error occurred", variant: "destructive" })
      }
    } finally {
      setIsLoading(false)
    }
  }
    
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Health Tracker</CardTitle>
          <CardDescription className="text-center">Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Username</label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={() => handleAuth('login')} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Sign In'}
          </Button>
          <Button onClick={() => handleAuth('register')} variant="outline" disabled={isLoading}>
            Register
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}