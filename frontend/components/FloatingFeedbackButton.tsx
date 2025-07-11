"use client";

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FeedbackFormDialog from '@/components/ui/FeedbackFormDialog';

export default function FloatingFeedbackButton() {
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);

  return (
    <>
      {/* Floating Feedback Button */}
      <Button
        onClick={() => setIsFeedbackFormOpen(true)}
        className="fixed top-6 right-6 z-50 h-14 w-14 rounded-full bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        size="icon"
        title="Give Feedback"
      >
        <MessageCircle size={24} />
      </Button>

      {/* Feedback Form Dialog */}
      <FeedbackFormDialog 
        isOpen={isFeedbackFormOpen}
        onClose={() => setIsFeedbackFormOpen(false)}
        isAutoTriggered={false}
      />
    </>
  );
} 