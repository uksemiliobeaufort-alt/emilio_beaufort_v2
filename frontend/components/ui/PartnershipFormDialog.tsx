"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Toaster, toast } from "sonner";

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

  otherInquiryType: z
    .string()
    .min(2, "Please specify your inquiry type")
    .optional(),

  message: z
    .string()
    .min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof formSchema>;

interface PartnershipFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Add cache helper
const CACHE_KEY = 'partnership_inquiries';

function saveToCache(data: any) {
  try {
    const existingData = localStorage.getItem(CACHE_KEY);
    const inquiries = existingData ? JSON.parse(existingData) : [];
    inquiries.push({ ...data, timestamp: new Date().toISOString() });
    localStorage.setItem(CACHE_KEY, JSON.stringify(inquiries));
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
}

export default function PartnershipFormDialog({ isOpen, onClose }: PartnershipFormDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      company: "",
      email: "",
      inquiryType: "supplier",
      otherInquiryType: "",
      message: "",
    },
  });

  // Watch specific form fields
  const fullName = form.watch("fullName");
  const company = form.watch("company");
  const email = form.watch("email");
  const inquiryType = form.watch("inquiryType");
  const otherInquiryType = form.watch("otherInquiryType");
  const message = form.watch("message");
  
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  // Validate form whenever fields change
  useEffect(() => {
    const validateForm = () => {
      const hasRequiredFields = 
        Boolean(fullName?.trim()) &&
        Boolean(company?.trim()) &&
        Boolean(email?.trim()) &&
        Boolean(message?.trim()) &&
        Boolean(inquiryType);

      const hasOtherType = inquiryType === "other";
      const isOtherValid = !hasOtherType || (hasOtherType && (otherInquiryType?.trim()?.length ?? 0) >= 2);

      const isEmailValid = Boolean(email?.trim()?.endsWith("@gmail.com"));

      const isValid = hasRequiredFields && isOtherValid && isEmailValid;
      console.log('Form validation state:', {
        hasRequiredFields,
        isOtherValid,
        isEmailValid,
        isValid
      });
      
      setIsFormValid(isValid);
    };

    validateForm();
  }, [fullName, company, email, inquiryType, otherInquiryType, message]);

  const onSubmit = async (data: FormData) => {
    if (!isFormValid || isSubmitting) {
      console.log('Form submission blocked:', { isFormValid, isSubmitting });
      return;
    }

    console.log('Form submission started with data:', data);
    setIsSubmitting(true);

    try {
      const submissionData = {
        name: data.fullName,
        email: data.email,
        company: data.company,
        message: data.message,
        inquiryType: data.inquiryType === "other" ? data.otherInquiryType! : data.inquiryType,
      };

      console.log('Preparing to submit data:', submissionData);

      // Save to cache first
      try {
        saveToCache(submissionData);
        console.log('Data saved to cache successfully');
      } catch (cacheError) {
        console.error('Cache save error:', cacheError);
      }

      // Make the API call
      console.log('Making API call...');
      const response = await api.submitPartnershipInquiry(submissionData);
      console.log('API Response:', response);

      // Show success message
      setSubmittedName(data.fullName);
      setIsSuccess(true);
      form.reset();
      
      // Show success toast
      toast.success(
        <div className="flex flex-col gap-1">
          <p className="font-medium">Inquiry submitted successfully!</p>
          <p className="text-sm text-gray-600">We'll get back to you soon.</p>
        </div>
      );
    } catch (error) {
      console.error("Detailed submission error:", error);
      
      // Show more specific error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(
        <div className="flex flex-col gap-1">
          <p className="font-medium">Failed to submit inquiry</p>
          <p className="text-sm text-gray-600">{errorMessage}</p>
          <p className="text-xs text-gray-500">Please try again or contact support if the problem persists.</p>
        </div>
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setSubmittedName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">Partner With Us</DialogTitle>
            </DialogHeader>
            
            <div className="mt-4">
              <p className="text-gray-600 mb-6">
                Join our network of premium partners and help us bring luxury grooming
                to discerning customers worldwide.
              </p>

              <Form {...form}>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    console.log('Form submit event triggered');
                    
                    try {
                      if (isFormValid && !isSubmitting) {
                        console.log('Form is valid and not submitting, proceeding with submission');
                        
                        const formData = form.getValues();
                        console.log('Form data:', formData);
                        
                        await onSubmit(formData);
                      } else {
                        console.log('Form validation failed or already submitting:', { 
                          isFormValid, 
                          isSubmitting,
                          formData: form.getValues(),
                          formErrors: form.formState.errors
                        });
                      }
                    } catch (error) {
                      console.error('Error during form submission:', error);
                    }
                  }} 
                  className="space-y-4"
                >
                  {/* Full Name Field with live hint */}
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => {
                      const containsInvalidChars = /[^A-Za-z\s]/.test(field.value);
                      return (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full name"
                              {...field}
                              className={containsInvalidChars ? "border-yellow-500" : ""}
                            />
                          </FormControl>
                          {containsInvalidChars && (
                            <p className="text-sm text-yellow-600">
                              ⚠ Special characters and numbers are not allowed.
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  {/* Company Field */}
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your company name" {...field} />
                        </FormControl>
                        <FormMessage />
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
                        <FormItem>
                          <FormLabel>Official Mail</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your company mail"
                              {...field}
                              className={isNotGmail ? "border-yellow-500" : ""}
                            />
                          </FormControl>
                          {isNotGmail && (
                            <p className="text-sm text-yellow-600">
                              ⚠ Only Gmail addresses ending with @gmail.com are allowed.
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  {/* Inquiry Type */}
                  <FormField
                    control={form.control}
                    name="inquiryType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inquiry Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select inquiry type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="supplier">Supplier</SelectItem>
                            <SelectItem value="distributor">Distributor</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Other Inquiry Type - Only shown when "other" is selected */}
                  {form.watch("inquiryType") === "other" && (
                    <FormField
                      control={form.control}
                      name="otherInquiryType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specify Inquiry Type</FormLabel>
                          <FormControl>
                            <Input placeholder="Please specify your inquiry type" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Message */}
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your partnership proposal..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button: enabled only if form is valid and not submitting */}
                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 transition-colors"
                    disabled={!isFormValid || isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <span>Submitting...</span>
                        <div className="animate-spin">⌛</div>
                      </div>
                    ) : (
                      "Submit Inquiry"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-serif mb-2">Thank You!</h2>
            <div className="text-xl font-medium mb-4">
              {submittedName} ✨
            </div>
            <div className="text-gray-600 mb-6">
              Your inquiry has been successfully submitted.<br/>
              We'll get back to you soon!
            </div>
            <div className="flex gap-2 text-2xl mb-6">
              🌟 🎯 💫
            </div>

            <Button onClick={() => window.open("https://cal.com/emiliocosmetics/15min", "_blank")}
            className="bg-accent hover:bg-accent/90 transition-colors m-1">
                Book a Meet
            </Button>
            
            <Button 
              onClick={handleClose}
              className="bg-accent hover:bg-accent/90 transition-colors"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
