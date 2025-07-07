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
import { useState, useEffect, useRef } from "react";
import { savePartnershipInquiry, DuplicateEmailError } from "@/lib/supabase";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
);

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
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Scroll detection
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      setIsScrolling(true);
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Set timeout to hide scrolling state after scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

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

      // Save to Supabase
      console.log('Saving to Supabase...');
      await savePartnershipInquiry(submissionData);
      console.log('Data saved to Supabase successfully');

      // Show success message
      setSubmittedName(data.fullName);
      setIsSuccess(true);
      form.reset();

    } catch (error) {
      console.error("Detailed submission error:", error);
      if (error instanceof DuplicateEmailError) {
        setSubmittedEmail(data.email);
        setIsDuplicateEmail(true);
      } else {
        toast.error(
          <div className="flex flex-col gap-1">
            <p className="font-medium">Failed to submit inquiry</p>
            <p className="text-sm text-gray-600">Please try again. If the problem persists, contact support.</p>
          </div>
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setIsDuplicateEmail(false);
    setSubmittedName("");
    setSubmittedEmail("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[500px] max-h-[90vh] border-0 bg-transparent shadow-none p-0 rounded-lg" showCloseButton={false}>
        {!isSuccess && !isDuplicateEmail ? (
          <div className="relative overflow-hidden rounded-lg shadow-2xl">
            {/* Static gradient border */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gray-800 via-yellow-600 to-gray-700 p-[4px]">
              <div className="rounded-lg bg-white h-full w-full"></div>
            </div>
            
            <div className="relative z-10 p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-2rem)]" ref={scrollContainerRef}>
              {/* Custom Close Button */}
              <button
                onClick={handleClose}
                className="absolute right-3 top-3 z-20 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-white/80 hover:bg-white p-1.5 shadow-sm"
                type="button"
              >
                <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="sr-only">Close</span>
              </button>
              
              <DialogHeader className="mb-4 sm:mb-6">
                {/* Circular Logo - conditionally visible */}
                <div className={cn(
                  "flex justify-center mb-4 sm:mb-6 transition-all duration-300",
                  isScrolling ? "opacity-0 transform scale-95" : "opacity-100 transform scale-100"
                )}>
                  <div className="relative">
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/the-house/EM.jpg`}
                      alt="Emilio Beaufort Logo"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-full shadow-lg"
                      onError={(e) => {
                        // Fallback to text if logo doesn't load
                        e.currentTarget.style.display = 'none';
                        const fallbackElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallbackElement) {
                          fallbackElement.style.display = 'flex';
                        }
                      }}
                    />
                    {/* Fallback text logo */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-serif text-lg sm:text-xl font-bold shadow-lg" style={{display: 'none'}}>
                      EB
                    </div>
                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-600/20 via-yellow-500/20 to-gray-600/20 blur-sm -z-10"></div>
                  </div>
                </div>
                
                <DialogTitle className="text-xl sm:text-2xl font-space-grotesk font-semibold text-gray-900 text-center px-4">
                  Partner With Us
                </DialogTitle>
                <p className="text-sm sm:text-base font-plus-jakarta text-gray-600 mt-2 text-center px-2 sm:px-4 leading-relaxed">
                  Join our network of premium partners and help us bring luxury grooming to discerning customers worldwide.
                </p>
              </DialogHeader>

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
                  className="space-y-3 sm:space-y-4"
                >
                  {/* Full Name Field */}
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => {
                      const containsInvalidChars = /[^A-Za-z\s]/.test(field.value);
                      return (
                        <FormItem>
                          <FormLabel className="text-sm font-space-grotesk font-medium text-gray-700">Full Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full name"
                              {...field}
                              className={cn(
                                "border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base font-plus-jakarta",
                                containsInvalidChars && "border-yellow-500 focus:border-yellow-500"
                              )}
                            />
                          </FormControl>
                          {containsInvalidChars && (
                            <p className="text-xs sm:text-sm font-plus-jakarta text-yellow-600 flex items-center gap-1">
                              <span>⚠️</span>
                              Special characters and numbers are not allowed.
                            </p>
                          )}
                          <FormMessage className="text-xs sm:text-sm" />
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
                        <FormLabel className="text-sm font-space-grotesk font-medium text-gray-700">Company Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your company name" 
                            {...field}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base font-plus-jakarta"
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => {
                      const isNotGmail = field.value && !field.value.endsWith("@gmail.com");
                      return (
                        <FormItem>
                          <FormLabel className="text-sm font-space-grotesk font-medium text-gray-700">Official Gmail Address *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your Gmail address"
                              type="email"
                              {...field}
                              className={cn(
                                "border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base font-plus-jakarta",
                                isNotGmail && "border-yellow-500 focus:border-yellow-500"
                              )}
                            />
                          </FormControl>
                          {isNotGmail && (
                            <p className="text-xs sm:text-sm font-plus-jakarta text-yellow-600 flex items-center gap-1">
                              <span>⚠️</span>
                              Only Gmail addresses ending with @gmail.com are allowed.
                            </p>
                          )}
                          <FormMessage className="text-xs sm:text-sm" />
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
                        <FormLabel className="text-sm font-space-grotesk font-medium text-gray-700">Inquiry Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base font-plus-jakarta">
                              <SelectValue placeholder="Select inquiry type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="font-plus-jakarta animate-none">
                            <SelectItem value="supplier">Supplier Partnership</SelectItem>
                            <SelectItem value="distributor">Distribution Partnership</SelectItem>
                            <SelectItem value="other">Other Opportunity</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  {/* Other Inquiry Type */}
                  {form.watch("inquiryType") === "other" && (
                    <FormField
                      control={form.control}
                      name="otherInquiryType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-space-grotesk font-medium text-gray-700">Specify Inquiry Type *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Please specify your inquiry type" 
                              {...field}
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base font-plus-jakarta"
                            />
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm" />
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
                        <FormLabel className="text-sm font-space-grotesk font-medium text-gray-700">Message *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your partnership proposal..."
                            className="min-h-[100px] sm:min-h-[120px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base resize-none font-plus-jakarta"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className={cn(
                      "w-full py-2.5 sm:py-3 rounded-lg font-space-grotesk font-medium text-white transition-all duration-300 text-sm sm:text-base",
                      "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                      "shadow-lg hover:shadow-xl",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                    disabled={!isFormValid || isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2 sm:gap-3">
                        <LoadingSpinner />
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      "Submit Partnership Inquiry"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        ) : isDuplicateEmail ? (
          <div className="bg-white rounded-lg shadow-2xl p-6 relative">
            {/* Custom Close Button */}
            <button
              onClick={handleClose}
              className="absolute right-3 top-3 z-20 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-gray-100 hover:bg-gray-200 p-1.5 shadow-sm"
              type="button"
            >
              <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="sr-only">Close</span>
            </button>
            
            <div className="flex flex-col items-center py-6 sm:py-8 text-center px-4 sm:px-6">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📬</div>
              <h2 className="text-lg sm:text-2xl font-space-grotesk font-semibold mb-2 text-gray-900">Already Received!</h2>
              <div className="text-base sm:text-xl font-plus-jakarta font-medium mb-3 sm:mb-4 text-gray-700 break-all">
                {submittedEmail} ✨
              </div>
              <div className="text-sm sm:text-base font-plus-jakarta text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                We've already received your partnership inquiry.<br/>
                Our team will get back to you soon!
              </div>
              <div className="flex gap-2 text-xl sm:text-2xl mb-4 sm:mb-6">
                ⭐ 📨 💫
              </div>
              <Button 
                onClick={handleClose}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base font-space-grotesk font-medium"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-2xl p-6 relative">
            {/* Custom Close Button */}
            <button
              onClick={handleClose}
              className="absolute right-3 top-3 z-20 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-gray-100 hover:bg-gray-200 p-1.5 shadow-sm"
              type="button"
            >
              <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="sr-only">Close</span>
            </button>
            
            <div className="flex flex-col items-center py-6 sm:py-8 text-center px-4 sm:px-6">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🎉</div>
              <h2 className="text-lg sm:text-2xl font-space-grotesk font-semibold mb-2 text-gray-900">Thank You!</h2>
              <div className="text-base sm:text-xl font-plus-jakarta font-medium mb-3 sm:mb-4 text-gray-700">
                {submittedName} ✨
              </div>
              <div className="text-sm sm:text-base font-plus-jakarta text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                Your inquiry has been successfully submitted.<br/>
                We'll get back to you soon!
              </div>
              <div className="flex gap-2 text-xl sm:text-2xl mb-4 sm:mb-6">
                🌟 🎯 💫
              </div>
              <Button 
                onClick={handleClose}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base font-space-grotesk font-medium"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 