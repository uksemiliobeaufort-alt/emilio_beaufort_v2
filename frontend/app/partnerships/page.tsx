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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { submitPartnershipInquiry } from "@/lib/api";
import { toast } from "sonner";

const formSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .regex(/^[A-Za-z\s]+$/, "Special characters and numbers are not allowed"),

  company: z
    .string()
    .min(2, "Company name must be at least 2 characters"),

  email: z
    .string()
    .email("Please enter a valid email address")
    .refine((val) => val.endsWith("@gmail.com"), {
      message: "Only Gmail addresses ending with @gmail.com are allowed",
    }),

  inquiryType: z.enum(["supplier", "distributor", "other"]),

  message: z
    .string()
    .min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof formSchema>;

export default function PartnershipsPage() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      company: "",
      email: "",
      inquiryType: "supplier",
      message: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await submitPartnershipInquiry({
        ...data,
        name: data.fullName,
      });
      toast.success("Your partnership inquiry has been submitted successfully!");
      form.reset();
    } catch (error) {
      toast.error("Failed to submit inquiry. Please try again.");
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl font-heading text-center mb-6">
          Partner With Us
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          Join our network of premium partners and help us bring luxury grooming
          to discerning customers worldwide.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name Field with live hint */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => {
                const containsInvalidChars = /[^A-Za-z\s]/.test(field.value);
                return (
                  <FormItem className="space-y-0">
                    <FormLabel className="transition-none">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                        className={`transition-none ${containsInvalidChars ? "border-yellow-500" : ""}`}
                      />
                    </FormControl>
                    {containsInvalidChars && (
                      <p className="text-sm text-yellow-600 transition-none">
                        ⚠️ Special characters and numbers are not allowed.
                      </p>
                    )}
                    <FormMessage className="transition-none" />
                  </FormItem>
                );
              }}
            />

            {/* Company Field */}
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormLabel className="transition-none">Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your company name" {...field} className="transition-none" />
                  </FormControl>
                  <FormMessage className="transition-none" />
                </FormItem>
              )}
            />

            {/* Email Field with live hint */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => {
                const isNotGmail = field.value && !field.value.endsWith("@gmail.com");
                return (
                  <FormItem className="space-y-0">
                    <FormLabel className="transition-none">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your Gmail address"
                        {...field}
                        className={`transition-none ${isNotGmail ? "border-yellow-500" : ""}`}
                      />
                    </FormControl>
                    {isNotGmail && (
                      <p className="text-sm text-yellow-600 transition-none">
                        ⚠️ Only Gmail addresses ending with @gmail.com are allowed.
                      </p>
                    )}
                    <FormMessage className="transition-none" />
                  </FormItem>
                );
              }}
            />

            {/* Inquiry Type */}
            <FormField
              control={form.control}
              name="inquiryType"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormLabel className="transition-none">Inquiry Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="transition-none">
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="transition-none">
                      <SelectItem value="supplier" className="transition-none">Supplier</SelectItem>
                      <SelectItem value="distributor" className="transition-none">Distributor</SelectItem>
                      <SelectItem value="other" className="transition-none">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="transition-none" />
                </FormItem>
              )}
            />

            {/* Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormLabel className="transition-none">Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your partnership proposal..."
                      className="min-h-[120px] transition-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="transition-none" />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 transition-none"
              disabled={!form.formState.isValid}
            >
              Submit Inquiry
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
