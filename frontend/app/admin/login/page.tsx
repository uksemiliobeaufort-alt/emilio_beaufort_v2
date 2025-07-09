"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, AuthError } from '@/lib/auth';
import { Loader2, Eye, EyeOff, Lock, CheckCircle2, AlertCircle, Home } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error';
  message: string;
}

const Alert = ({ type, message }: AlertProps) => {
  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;

  return (
    <div className={`${bgColor} ${textColor} p-4 rounded-lg flex items-start gap-3 text-sm mb-6`}>
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <p>{message}</p>
    </div>
  );
};

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState<AlertProps | null>(null);

  useEffect(() => {
    // Initialize auth state
    auth.init();
    
    // If already logged in, redirect to dashboard
    if (auth.isAdmin()) {
      router.replace('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const user = await auth.login(email, password);
      
      setAlert({
        type: 'success',
        message: `Welcome back, ${user.email}! Redirecting to dashboard...`
      });

      // Wait a moment to show the success message
      setTimeout(() => {
        router.replace('/admin/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      setAlert({
        type: 'error',
        message: error instanceof AuthError 
          ? error.message 
          : 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50">
      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/')}
          className="bg-white/90 hover:bg-white border-gray-200 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:translate-y-[-1px] text-gray-700 hover:text-gray-900"
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-gray-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gray-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="w-full max-w-md px-4 py-8 relative z-10">
        <div className="mb-8 text-center">
          <div className="inline-block p-4 rounded-full bg-black mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-serif mb-2 text-gray-900">Welcome Back</h1>
          <p className="text-sm text-gray-500">Sign in to access the admin panel</p>
        </div>

        <Card className="border border-gray-100 shadow-xl bg-white">
          <CardContent className="pt-6">
            {alert && <Alert type={alert.type} message={alert.message} />}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label 
                  htmlFor="email" 
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  disabled={loading}
                  className="h-11 px-4 transition-all duration-200 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-gray-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="h-11 px-4 transition-all duration-200 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-gray-300 pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-50 opacity-70 hover:opacity-100 transition-opacity"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-black hover:bg-gray-900 text-white transition-all duration-200 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 hover:translate-y-[-1px] font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Protected Admin Area
          </p>
        </div>
      </div>
    </div>
  );
} 