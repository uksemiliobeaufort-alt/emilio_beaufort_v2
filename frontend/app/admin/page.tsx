"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [traffic, setTraffic] = useState<{ date: string; pageViews: string }[] | null>(null);
  const [loadingTraffic, setLoadingTraffic] = useState(true);
  const [trafficError, setTrafficError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  const fetchTraffic = () => {
    setLoadingTraffic(true);
    setTrafficError(null);
    fetch(`/api/admin/analytics?startDate=${startDate}&endDate=${endDate}`)
      .then(res => res.json())
      .then(res => {
        if (res.data) {
          setTraffic(res.data);
        } else {
          setTrafficError(res.error || 'Failed to fetch analytics');
        }
        setLoadingTraffic(false);
      })
      .catch(err => {
        setTrafficError(err.message || 'Failed to fetch analytics');
        setLoadingTraffic(false);
      });
  };

  useEffect(() => {
    setMounted(true);
    fetchTraffic();
    // eslint-disable-next-line
  }, []);

  const handleDateChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
  };

  const handleApply = () => {
    fetchTraffic();
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Admin Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">Welcome to the Emilio Beaufort Admin Panel</p>
            {/* Website Traffic Section */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Website Traffic</h3>
              <div className="flex flex-col md:flex-row items-center gap-2 mb-4">
                <label className="text-green-900 text-sm">Start Date:
                  <input type="date" value={startDate} onChange={handleDateChange(setStartDate)} className="ml-2 border rounded px-2 py-1" />
                </label>
                <label className="text-green-900 text-sm">End Date:
                  <input type="date" value={endDate} onChange={handleDateChange(setEndDate)} className="ml-2 border rounded px-2 py-1" />
                </label>
                <button onClick={handleApply} className="ml-2 px-4 py-1 bg-green-700 text-white rounded hover:bg-green-800">Apply</button>
              </div>
              {loadingTraffic && <div className="text-green-800">Loading traffic data...</div>}
              {trafficError && <div className="text-red-600">{trafficError}</div>}
              {traffic && (
                <table className="w-full text-sm mt-2">
                  <thead>
                    <tr>
                      <th className="text-left p-1">Date</th>
                      <th className="text-left p-1">Page Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {traffic.map(row => (
                      <tr key={row.date}>
                        <td className="p-1">{row.date}</td>
                        <td className="p-1">{row.pageViews}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => router.push('/admin/login')}
                className="h-20 text-lg"
              >
                Go to Login
              </Button>
              
              <Button 
                onClick={() => router.push('/admin/dashboard')}
                variant="outline"
                className="h-20 text-lg"
              >
                Go to Dashboard
              </Button>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Environment Setup Required</h3>
              <p className="text-blue-800 text-sm">
                Make sure to set up your Supabase environment variables:
              </p>
              <ul className="text-blue-800 text-sm mt-2 list-disc list-inside">
                <li>NEXT_PUBLIC_SUPABASE_URL</li>
                <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 