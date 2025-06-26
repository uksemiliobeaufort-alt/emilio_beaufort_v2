"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import SectionWrapper from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitPartnershipInquiry } from "@/lib/api";

const partnershipFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  inquiryType: z.string().min(1, "Please select an inquiry type"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type PartnershipFormData = z.infer<typeof partnershipFormSchema>;

const inquiryTypes = [
  { value: "supplier", label: "Supplier Partnership" },
  { value: "distributor", label: "Distribution Partnership" },
  { value: "retail", label: "Retail Partnership" },
  { value: "collaboration", label: "Brand Collaboration" },
  { value: "other", label: "Other" },
];

export default function PartnerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<PartnershipFormData>({
    resolver: zodResolver(partnershipFormSchema),
  });

  const onSubmit = async (data: PartnershipFormData) => {
    setIsSubmitting(true);
    try {
      await submitPartnershipInquiry(data);
      toast.success("Thank you for your inquiry. We'll be in touch soon.");
      reset();
    } catch (error) {
      toast.error("Failed to submit inquiry. Please try again.");
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20">
        <SectionWrapper>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">
              Build With Us
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join us in redefining luxury grooming. We&apos;re always looking for partners 
              who share our vision of excellence and innovation.
            </p>
          </motion.div>
        </SectionWrapper>
      </section>

      {/* Form Section */}
      <section className="py-20 bg-muted/30">
        <SectionWrapper>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-background rounded-lg shadow-lg p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-heading font-bold mb-8 text-center">
                Partnership Inquiry
              </h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Full Name */}
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    {...register("fullName")}
                    className="mt-1"
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Company Name */}
                <div>
                  <Label htmlFor="companyName" className="text-sm font-medium">
                    Company Name *
                  </Label>
                  <Input
                    id="companyName"
                    {...register("companyName")}
                    className="mt-1"
                    placeholder="Enter your company name"
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.companyName.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    className="mt-1"
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Inquiry Type */}
                <div>
                  <Label htmlFor="inquiryType" className="text-sm font-medium">
                    Inquiry Type *
                  </Label>
                  <Select onValueChange={(value) => setValue("inquiryType", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select an inquiry type" />
                    </SelectTrigger>
                    <SelectContent>
                      {inquiryTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.inquiryType && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.inquiryType.message}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message" className="text-sm font-medium">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    {...register("message")}
                    className="mt-1 min-h-[120px]"
                    placeholder="Tell us about your partnership proposal..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full btn-hover-lift"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  We typically respond to partnership inquiries within 2-3 business days.
                </p>
              </div>
            </div>
          </motion.div>
        </SectionWrapper>
      </section>
    </div>
  );
} 