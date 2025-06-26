"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { submitCareerApplication } from "@/lib/api";
import { toast } from "sonner";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  portfolio: z.string().url("Please enter a valid URL"),
  coverLetter: z.string().min(10, "Cover letter must be at least 10 characters"),
});

type FormData = z.infer<typeof formSchema>;

export default function CareersPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      portfolio: "",
      coverLetter: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await submitCareerApplication(data);
      toast.success("Your application has been submitted successfully!");
      form.reset();
    } catch (error) {
      toast.error("Failed to submit application. Please try again.");
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl font-heading text-center mb-6">Careers</h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          Join Emilio Beaufort as an intern or influencer collaborator. We value passion, creativity, and a commitment to luxury grooming.
        </p>

        <div className="mb-10">
          <h2 className="text-2xl font-heading mb-2">Internships</h2>
          <p className="text-gray-700 mb-6">
            We offer internships for students and recent graduates interested in luxury branding, marketing, and product development.
          </p>
          <h2 className="text-2xl font-heading mb-2">Influencer Collaborations</h2>
          <p className="text-gray-700 mb-6">
            Are you a content creator or influencer passionate about grooming and lifestyle? Apply to collaborate with us.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="portfolio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio Link</FormLabel>
                  <FormControl>
                    <Input placeholder="https://yourportfolio.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverLetter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Letter</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us why you'd like to join..." className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
} 