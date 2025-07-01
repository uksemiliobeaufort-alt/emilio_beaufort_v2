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
    await submitPartnershipInquiry({
      ...data,
      name: data.fullName, // ✅ required field mapping
    });
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
