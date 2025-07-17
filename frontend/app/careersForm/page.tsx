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
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { uploadCareerResume, saveCareerApplication } from "@/lib/supabase";
import { toast } from "sonner";
import { Briefcase } from "lucide-react";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  portfolio: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  resume: z.any().refine((file) => file instanceof File && file.size > 0, {
    message: "Resume is required",
  }),
  coverLetter: z
    .string()
    .min(10, "Cover letter must be at least 10 characters")
    .optional()
    .or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

export default function CareersPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter(); // ✅ Router for redirection

  useEffect(() => {
    const title = searchParams?.get("jobTitle");
    if (title) setJobTitle(decodeURIComponent(title));
  }, [searchParams]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      portfolio: "",
      resume: "",
      coverLetter: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Upload resume file
      const resumeFile = data.resume;
      const resumeUrl = await uploadCareerResume(resumeFile, data.fullName);
      // Save application data in DB
      await saveCareerApplication({
        fullName: data.fullName,
        email: data.email,
        portfolio: data.portfolio || '',
        coverLetter: data.coverLetter || '',
        jobTitle: jobTitle || '',
        resumeUrl
      });
      toast.success("Your application has been submitted!");
      form.reset();
      setResumeName("");
      setIsSuccess(true);
    } catch (error) {
      toast.error("Submission failed. Please try again.");
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-20 px-2 sm:px-6 bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-black rounded-full p-3 mb-4 flex items-center justify-center">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-black text-center mb-2">
            {jobTitle ? `Apply for: ${jobTitle}` : "Join Our Team"}
          </h1>
          <p className="text-base sm:text-lg text-gray-500 text-center max-w-lg">
            {jobTitle
              ? `You're applying for the position of "${jobTitle}". Please fill out the form below.`
              : "Explore internships or collaborate as an influencer with Emilio Beaufort."}
          </p>
        </div>

        {!jobTitle && (
          <div className="mb-10 space-y-4 text-gray-700">
            <div>
              <h2 className="text-xl font-bold">Internships</h2>
              <p>
                Gain experience in luxury branding, marketing, and product
                development.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold">Influencer Collaborations</h2>
              <p>
                Content creators passionate about lifestyle and grooming are
                welcome to apply.
              </p>
            </div>
          </div>
        )}

        {isSuccess ? (
          <div className="flex flex-col items-center py-20 text-center bg-white p-10 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-serif mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your application has been submitted successfully.
            </p>
            <Button
              onClick={() => router.push("/careers")}
              className="bg-black text-white hover:bg-gray-800 rounded-xl font-semibold px-8 py-3"
            >
              Close
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-black">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" className="rounded-xl bg-gray-50 focus:bg-white border-gray-200 focus:shadow-md" {...field} />
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
                      <FormLabel className="font-semibold text-black">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" className="rounded-xl bg-gray-50 focus:bg-white border-gray-200 focus:shadow-md" {...field} />
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
                      <FormLabel className="font-semibold text-black">
                        Portfolio Link <span className="text-gray-400 font-normal">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://yourportfolio.com"
                          className="rounded-xl bg-gray-50 focus:bg-white border-gray-200 focus:shadow-md"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="resume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-black">Resume <span className="text-gray-400 font-normal">(PDF, DOC)</span></FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-3">
                          <label className="bg-black text-white px-4 py-2 rounded-xl font-semibold cursor-pointer hover:bg-gray-900 transition-all">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  field.onChange(file);
                                  setResumeName(file.name);
                                }
                              }}
                            />
                            {resumeName ? "Change File" : "Browse..."}
                          </label>
                          <span className="text-gray-500 text-sm truncate max-w-[180px]">
                            {resumeName ? resumeName : "No file selected."}
                          </span>
                        </div>
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
                      <FormLabel className="font-semibold text-black">
                        Cover Letter <span className="text-gray-400 font-normal">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us why you'd love to join..."
                          className="rounded-xl min-h-[100px] bg-gray-50 focus:bg-white border-gray-200 focus:shadow-md"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-black text-white text-lg py-3 rounded-xl font-bold shadow hover:bg-gray-900 hover:scale-[1.02] transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}