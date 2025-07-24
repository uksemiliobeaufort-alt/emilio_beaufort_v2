"use client";

import React, { useState } from 'react';

export default function TrackOrderPage() {
  const [orderType, setOrderType] = useState<'domestic' | 'international'>('domestic');
  const [trackingId, setTrackingId] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-premium relative">
      <div className="bg-gradient-to-br from-[#B7A16C] via-[#fffbe6] to-black p-1 rounded-3xl shadow-2xl w-full max-w-xl">
        <div className="bg-white rounded-2xl p-8 w-full">
          <h1 className="text-3xl font-bold mb-6 text-premium text-center">Track Your Order</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Type</label>
              <select
                value={orderType}
                onChange={e => setOrderType(e.target.value as 'domestic' | 'international')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-premium"
              >
                <option value="domestic">Domestic Tracking ID</option>
                <option value="international">International Tracking ID</option>
              </select>
            </div>
            <div>
              <label htmlFor="trackingId" className="block text-sm font-medium text-gray-700 mb-2">
                {orderType === 'domestic' ? 'Domestic Tracking ID' : 'International Tracking ID'}
              </label>
              <input
                id="trackingId"
                name="trackingId"
                type="text"
                value={trackingId}
                onChange={e => setTrackingId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-premium"
                placeholder={`Enter your ${orderType === 'domestic' ? 'Domestic' : 'International'} Tracking ID`}
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-6 bg-premium-dark text-white rounded-lg font-semibold border border-premium-dark hover:bg-premium hover:text-black hover:border-black transition-colors"
            >
              Track Order
            </button>
          </form>
        </div>
      </div>
      {/* Centered Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-gradient-to-br from-[#B7A16C] via-[#fffbe6] to-black p-1 rounded-2xl shadow-2xl w-full max-w-xl">
            <div className="bg-white rounded-xl p-8 flex flex-col items-center">
              <h2 className="text-xl font-bold mb-4 text-black text-center">Invalid Tracking ID</h2>
              <p className="text-gray-700 text-center mb-4">
                The Tracking ID you entered could not be found. Please double-check your Tracking ID and try again.<br />
                If you continue to experience issues, contact our support team for assistance.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="mt-4 px-6 py-2 bg-premium-dark text-white rounded-lg font-semibold hover:bg-premium hover:text-black hover:border-black border border-premium-dark transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
} 