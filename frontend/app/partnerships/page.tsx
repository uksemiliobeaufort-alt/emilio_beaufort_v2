// "use client";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useState } from "react";
// import { submitPartnershipInquiry } from "@/lib/api";
// import { toast } from "sonner";

// const formSchema = z.object({
//   fullName: z.string().min(2, "Full name must be at least 2 characters"),
//   company: z.string().min(2, "Company name must be at least 2 characters"),
//   email: z.string().email("Please enter a valid email address"),
//   inquiryType: z.enum(["supplier", "distributor", "other"]),
//   message: z.string().min(10, "Message must be at least 10 characters"),
// });

// type FormData = z.infer<typeof formSchema>;

// export default function PartnershipsPage() {
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const form = useForm<FormData>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       fullName: "",
//       company: "",
//       email: "",
//       inquiryType: "supplier",
//       message: "",
//     },
//   });

//   const onSubmit = async (data: FormData) => {
//     setIsSubmitting(true);
    
//     try {
//       await submitPartnershipInquiry(data);
//       toast.success("Your partnership inquiry has been submitted successfully!");
//       form.reset();
//     } catch (error) {
//       toast.error("Failed to submit inquiry. Please try again.");
//       console.error('Error submitting form:', error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen py-20 px-6">
//       <div className="max-w-2xl mx-auto">
//         <h1 className="text-5xl font-heading text-center mb-6">
//           Partner With Us
//         </h1>
//         <p className="text-xl text-gray-600 text-center mb-12">
//           Join our network of premium partners and help us bring luxury grooming 
//           to discerning customers worldwide.
//         </p>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//             <FormField
//               control={form.control}
//               name="fullName"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Full Name</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Enter your full name" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="company"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Company</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Enter your company name" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="email"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Email</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Enter your email address" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="inquiryType"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Inquiry Type</FormLabel>
//                   <Select onValueChange={field.onChange} defaultValue={field.value}>
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select inquiry type" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="supplier">Supplier</SelectItem>
//                       <SelectItem value="distributor">Distributor</SelectItem>
//                       <SelectItem value="other">Other</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="message"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Message</FormLabel>
//                   <FormControl>
//                     <Textarea 
//                       placeholder="Tell us about your partnership proposal..."
//                       className="min-h-[120px]"
//                       {...field} 
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <Button 
//               type="submit" 
//               className="w-full bg-accent hover:bg-accent/90"
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? "Submitting..." : "Submit Inquiry"}
//             </Button>
//           </form>
//         </Form>
//       </div>
//     </div>
//   );
// } 

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
    .regex(/^[A-Za-z\s]+$/, "Special characters and numbers are not allowed"), // ✅ changed refine() to regex()

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange", // enables live validation
    defaultValues: {
      fullName: "",
      company: "",
      email: "",
      inquiryType: "supplier",
      message: "",
    },
  });

  const onSubmit = async (data: FormData) => {
  setIsSubmitting(true);

  try {
    // Transform the form data to match the DTO interface
    const submissionData = {
      fullName: data.fullName,
      companyName: data.company, // Transform 'company' to 'companyName'
      email: data.email,
      inquiryType: data.inquiryType,
      message: data.message,
    };
    
    await submitPartnershipInquiry(submissionData);
    toast.success("Your partnership inquiry has been submitted successfully!");
    form.reset();
  } catch (error) {
    toast.error("Failed to submit inquiry. Please try again.");
    console.error("Error submitting form:", error);
  } finally {
    setIsSubmitting(false);
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
                        ⚠️ Special characters and numbers are not allowed.
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your Gmail address"
                        {...field}
                        className={isNotGmail ? "border-yellow-500" : ""}
                      />
                    </FormControl>
                    {isNotGmail && (
                      <p className="text-sm text-yellow-600">
                        ⚠️ Only Gmail addresses ending with @gmail.com are allowed.
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
                  <FormLabel>Partnership Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200">
                        <SelectValue placeholder="Choose your partnership type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="border-gray-200 shadow-xl rounded-lg overflow-hidden">
                      <SelectItem 
                        value="supplier" 
                        className="px-4 py-4 hover:bg-blue-50 transition-colors duration-150 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">Supplier Partnership</div>
                            <div className="text-sm text-gray-500">Provide premium products and materials</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem 
                        value="distributor" 
                        className="px-4 py-4 hover:bg-green-50 transition-colors duration-150 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.001 3.001 0 01-3.75-.614C.99 8.886.99 7.732 1.875 7.125" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">Distribution Partnership</div>
                            <div className="text-sm text-gray-500">Expand our reach to new markets</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem 
                        value="other" 
                        className="px-4 py-4 hover:bg-purple-50 transition-colors duration-150 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 003.75-1.738M18.75 4.5L12 11.25l-6.75-6.75" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">Strategic Collaboration</div>
                            <div className="text-sm text-gray-500">Custom partnership opportunities</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              className="w-full bg-accent hover:bg-accent/90"
              disabled={!form.formState.isValid || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Inquiry"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
