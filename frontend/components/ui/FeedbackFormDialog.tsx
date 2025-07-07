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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

import { saveFeedback } from "@/lib/supabase"; // Add this import at the top

import { useState } from "react";
import { toast } from "sonner";

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
}

export default function FeedbackFormDialog({ isOpen, onClose }: FeedbackFormDialogProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">We Value Your Feedback</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bug">Bug</SelectItem>
                            <SelectItem value="suggestion">Suggestion</SelectItem>
                            <SelectItem value="compliment">Compliment</SelectItem>
                          </SelectContent>
                        </Select>
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

                  <Button
                    type="submit"
                    className="w-full btn-primary-premium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Send Feedback"}
                  </Button>
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
