"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { object, string, infer as zInfer } from "zod";
import { toast } from "sonner";
import SectionWrapper from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitPartnershipInquiry } from "@/lib/api";

// Lazy load heavy client-only components
const BootstrapDropdown = dynamic(
  () => import("@/components/ui/BootstrapDropdown"),
  { ssr: false }
);

const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.div),
  { ssr: false }
);

// Optimized schema (tree-shaking friendly)
const partnershipFormSchema = object({
  name: string().min(2, "Full name must be at least 2 characters"),
  company: string().min(2, "Company name must be at least 2 characters"),
  email: string().email("Please enter a valid email address"),
  inquiryType: string().min(1, "Please select an inquiry type"),
  message: string().min(10, "Message must be at least 10 characters"),
});

type PartnershipFormData = zInfer<typeof partnershipFormSchema>;

const inquiryTypes = [
  { value: "supplier", label: "Supplier Partnership" },
  { value: "distributor", label: "Distribution Partnership" },
  { value: "retail", label: "Retail Partnership" },
  { value: "collaboration", label: "Brand Collaboration" },
  { value: "other", label: "Other" },
];

export default function PartnerForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PartnershipFormData>({
    resolver: zodResolver(partnershipFormSchema),
    mode: "onBlur", // validate only on blur
  });

  const inquiryType = watch("inquiryType");

  // Memoize dropdown items
  const dropdownItems = useMemo(
    () =>
      inquiryTypes.map((type) => ({
        label: type.label,
        onClick: () => setValue("inquiryType", type.value),
      })),
    [setValue]
  );

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
    <section className="py-20 bg-muted/30">
      <SectionWrapper>
        <MotionDiv
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
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  className="mt-1"
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Company Name */}
              <div>
                <Label htmlFor="company" className="text-sm font-medium">
                  Company Name *
                </Label>
                <Input
                  id="company"
                  {...register("company")}
                  className="mt-1"
                  placeholder="Enter your company name"
                />
                {errors.company && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.company.message}
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
                <div className="mt-1">
                  <BootstrapDropdown
                    trigger={inquiryType || "Select an inquiry type"}
                    items={dropdownItems}
                    variant="secondary"
                    className="w-full"
                  />
                </div>
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
                We typically respond to partnership inquiries within 2-3
                business days.
              </p>
            </div>
          </div>
        </MotionDiv>
      </SectionWrapper>
    </section>
  );
}
