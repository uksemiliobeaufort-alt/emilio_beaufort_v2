"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";


import { saveFeedback } from "@/lib/supabase"; // Add this import at the top

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import BootstrapDropdown from "./BootstrapDropdown";

const feedbackSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email").optional(),
  type: z.enum(["bug", "suggestion", "compliment"]),
  message: z.string().min(10, "Feedback must be at least 10 characters"),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isAutoTriggered?: boolean;
}

export default function FeedbackFormDialog({ isOpen, onClose, isAutoTriggered = false }: FeedbackFormDialogProps) {
  const pathname = usePathname();

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: "",
      email: "",
      type: "suggestion",
      message: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("suggestion");

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    try {
      // Replace with actual Supabase save function or API call
      
      await saveFeedback(data);

      // Optionally cache to localStorage
      const old = JSON.parse(localStorage.getItem("feedback_cache") || "[]");
      localStorage.setItem("feedback_cache", JSON.stringify([...old, { ...data, at: new Date() }]));

      setIsSuccess(true);
      form.reset();
      setSelectedType("suggestion");
      toast.success("Thank you! Your feedback has been submitted successfully.");
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    form.setValue("type", type as "bug" | "suggestion" | "compliment");
  };

  // Convert feedback types to dropdown items format
  const feedbackTypeItems = [
    { label: "Bug", onClick: () => handleTypeSelect("bug") },
    { label: "Suggestion", onClick: () => handleTypeSelect("suggestion") },
    { label: "Compliment", onClick: () => handleTypeSelect("compliment") }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">
                {isAutoTriggered 
                  ? "Thank you for exploring Emilio Beaufort" 
                  : "We Value Your Feedback"
                }
              </DialogTitle>
              {isAutoTriggered && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-gray-700 text-sm">
                    ✨ We value every moment you spend exploring our brand. Your feedback helps us perfect the Emilio Beaufort experience.
                  </p>
                </div>
              )}
            </DialogHeader>
            <div className="mt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input required placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <select
                            className="border rounded px-3 py-2 w-full"
                            value={field.value}
                            onChange={field.onChange}
                          >
                            <option value="bug">Bug</option>
                            <option value="suggestion">Suggestion</option>
                            <option value="compliment">Compliment</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feedback</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Your message..." {...field} className="min-h-[100px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3">
                    {isAutoTriggered && (
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={onClose}
                      >
                        Maybe Later
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className={`${isAutoTriggered ? 'flex-1' : 'w-full'} btn-primary-premium`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Send Feedback"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-serif mb-2">Thank You!</h2>
            <div className="text-gray-600 mb-6">
              Your feedback helps us improve and grow.
            </div>
            <Button onClick={handleClose} className="btn-primary-premium">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
