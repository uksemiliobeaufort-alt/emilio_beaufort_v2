"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from '@/lib/auth';


function Alert({ message }: { message: string }) {
  if (!message) return null;
  const isSuccess = message.includes('✅');
  return (
    <div className={`p-3 rounded-lg text-sm ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {message}
    </div>
  );
}




export default function AdminDebug() {
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [activeEmails, setActiveEmails] = useState<string[]>([]);
  const [testEmail, setTestEmail] = useState('admin@beaufort.app');
  const [testPassword, setTestPassword] = useState('admin123');
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [addUserResult, setAddUserResult] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [users, emails] = await Promise.allSettled([
        auth.listAdminUsers(),
        auth.getActiveAdminEmails()
      ]);
      
      // Handle users result
      if (users.status === 'fulfilled') {
        setAdminUsers(users.value);
      } else {
        console.error('Failed to load admin users:', users.reason);
        setAdminUsers([]);
      }
      
      // Handle emails result
      if (emails.status === 'fulfilled') {
        setActiveEmails(emails.value);
      } else {
        console.error('Failed to load admin emails:', emails.reason);
        setActiveEmails([]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setAdminUsers([]);
      setActiveEmails([]);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      const user = await auth.login(testEmail, testPassword);
      setTestResult(`✅ Success: Logged in as ${user.email}`);
      
      // Logout immediately after test
      await auth.logout();
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addNewAdmin = async () => {
    if (!newEmail || !newPassword) {
      setAddUserResult('❌ Please provide both email and password');
      return;
    }

    try {
      const success = await auth.addAdminUser(newEmail, newPassword);
      if (success) {
        setAddUserResult(`✅ Admin user created: ${newEmail}`);
        setNewEmail('');
        setNewPassword('');
        await loadData(); // Refresh the list
      } else {
        setAddUserResult('❌ Failed to create admin user');
      }
    } catch (error: any) {
      setAddUserResult(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Real-Time Admin Debug Panel</h1>
          <p className="text-gray-600">Test authentication and manage admin users dynamically</p>
        </div>

        {/* Admin Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Available Admin Users ({adminUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adminUsers.length > 0 ? (
                adminUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{user.email}</div>
                      <div className="text-sm text-gray-500">
                        Active: {user.is_active ? '✅' : '❌'} | 
                        Created: {new Date(user.created_at).toLocaleDateString()} |
                        Last Login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">ID: {user.id?.substring(0, 8)}...</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No admin users found. Please run the database migrations.
                </div>
              )}
              
              <Button onClick={loadData} variant="outline" className="w-full">
                🔄 Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Active Emails */}
        <Card>
          <CardHeader>
            <CardTitle>Active Admin Emails (Real-time)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeEmails.length > 0 ? (
                activeEmails.map((email, index) => (
                  <div key={index} className="p-2 bg-green-50 rounded border-l-4 border-green-400">
                    <code className="text-green-800">{email}</code>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No active admin emails found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Login Test */}
        <Card>
          <CardHeader>
            <CardTitle>Test Login (No Supabase Auth)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test-email">Email</Label>
                  <Input
                    id="test-email"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="admin@beaufort.app"
                  />
                </div>
                <div>
                  <Label htmlFor="test-password">Password</Label>
                  <Input
                    id="test-password"
                    type="password"
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                    placeholder="admin123"
                  />
                </div>
              </div>
              
              <Button onClick={testLogin} disabled={loading} className="w-full">
                {loading ? '🔄 Testing...' : '🧪 Test Login'}
              </Button>
                <Alert message={testResult} />{/* ----changed code here--- */}
              
            </div>

          </CardContent>
        </Card>

        {/* Add New Admin */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Admin User (Real-time)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-email">New Admin Email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="newadmin@beaufort.app"
                  />
                </div>
                <div>
                  <Label htmlFor="new-password">Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="secure123"
                  />
                </div>
              </div>
              
              <Button onClick={addNewAdmin} className="w-full">
                ➕ Add Admin User
              </Button>
              
              <Alert message={addUserResult} />
            </div>
          </CardContent>
        </Card>

        {/* Available Credentials */}
        <Card>
          <CardHeader>
            <CardTitle>🔑 Available Test Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Primary Admin</h4>
                <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                  <div className="text-sm">Email: <code>admin@beaufort.app</code></div>
                  <div className="text-sm">Password: <code>admin123</code></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Alternative Admins</h4>
                <div className="bg-gray-50 p-3 rounded space-y-1">
                  <div className="text-sm">📧 <code>test@beaufort.app</code> | 🔐 <code>test123</code></div>
                  <div className="text-sm">📧 <code>demo@beaufort.app</code> | 🔐 <code>demo123</code></div>
                  <div className="text-sm">📧 <code>support@beaufort.app</code> | 🔐 <code>support123</code></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>📊 System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">{adminUsers.filter(u => u.is_active).length}</div>
                <div className="text-sm text-green-800">Active Admins</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">{adminUsers.length}</div>
                <div className="text-sm text-blue-800">Total Admins</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded">
                <div className="text-2xl font-bold text-purple-600">✅</div>
                <div className="text-sm text-purple-800">No Supabase Auth</div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium mb-1">1. Apply Database Migrations</h4>
                <p>Run these SQL scripts in your Supabase SQL Editor:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><code>20240327000000_fix_admin_authentication.sql</code></li>
                  <li><code>20240327000002_improve_admin_system.sql</code></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">2. Test Real-time Authentication</h4>
                <p>Use the test form above to verify credentials work correctly.</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">3. Add New Admins Dynamically</h4>
                <p>Use the "Add New Admin User" section to create new credentials on the fly.</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">4. Go to Login Page</h4>
                <p>Once verified, use any of the credentials at <code>/admin/login</code></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 


