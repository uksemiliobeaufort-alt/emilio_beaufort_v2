"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function TestEmailPage() {
  const [testEmail, setTestEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error("Please enter a test email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testEmail }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Test email sent successfully! Check your inbox.");
        console.log('Test email result:', result);
      } else {
        toast.error(result.error || "Failed to send test email");
        console.error('Test email error:', result);
      }
    } catch (error) {
      toast.error("Failed to send test email");
      console.error('Test email error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20 px-6 bg-gray-50">
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-6">Email Test</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Email Address
              </label>
              <Input
                type="email"
                placeholder="your-email@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Button
              onClick={handleTestEmail}
              disabled={isLoading || !testEmail}
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              {isLoading ? "Sending..." : "Send Test Email"}
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Setup Instructions:</h3>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Add EMAIL_USER and EMAIL_PASSWORD to .env.local</li>
              <li>2. For Gmail, use an App Password</li>
              <li>3. Enter your email above and test</li>
              <li>4. Check your inbox for the test email</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 