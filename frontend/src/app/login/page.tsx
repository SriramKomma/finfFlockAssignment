"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, Code2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to login. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      
      {/* Left Panel - Branding & Aesthetics */}
      <div className="relative hidden h-full flex-col bg-zinc-900 p-10 text-white lg:flex justify-between overflow-hidden">
        {/* Abstract Glowing Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-zinc-900/50" />
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[10%] -right-[10%] w-[400px] h-[400px] rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />

        <div className="relative z-20 flex items-center text-2xl font-bold tracking-tight">
          <CheckCircle2 className="mr-3 h-8 w-8 text-indigo-500" />
          TaskMaster PRO
        </div>
        
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-4">
            <div className="flex gap-2 text-indigo-400">
              <Code2 className="h-6 w-6" />
            </div>
            <p className="text-xl font-medium leading-relaxed text-zinc-100 italic">
              "This platform completely revolutionized how our engineering teams organize sprints and track daily productivity. The analytics are unparalleled."
            </p>
            <footer className="text-sm font-medium text-zinc-400">
              Sofia Martinez, Lead Product Manager
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="lg:p-8 flex items-center justify-center relative min-h-screen lg:min-h-0 bg-background">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
        
        <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[380px] px-8 sm:px-0 relative z-10">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to securely access your workspace.
            </p>
          </div>

          <div className="grid gap-6">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start p-3 rounded-lg shadow-sm">
                    <AlertCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-foreground/80">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="h-11 bg-muted/20 border-border/50 focus-visible:ring-indigo-500/50"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-foreground/80">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="h-11 bg-muted/20 border-border/50 focus-visible:ring-indigo-500/50"
                  />
                </div>
                <Button className="h-11 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-900/20 transition-all font-medium" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Authenticating..." : "Sign In"}
                </Button>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 text-muted-foreground/70 font-medium">
                  Don't have an account?
                </span>
              </div>
            </div>

            <Link href="/signup" className="w-full">
              <Button variant="outline" className="w-full h-11 border-border/50 hover:bg-muted/30">
                Create new workspace
              </Button>
            </Link>
          </div>
          
          <p className="px-8 text-center text-xs text-muted-foreground/60">
            By clicking continue, you agree to our{" "}
            <span className="underline underline-offset-4 hover:text-primary cursor-pointer">Terms of Service</span> and{" "}
            <span className="underline underline-offset-4 hover:text-primary cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
