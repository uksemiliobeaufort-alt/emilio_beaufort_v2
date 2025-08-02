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
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firestore } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from "sonner";
import { Briefcase } from "lucide-react";
import { UploadCloud } from "lucide-react";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required and must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  github: z.string().url("Please enter a valid GitHub URL").optional().or(z.literal("")),
  linkedin: z.string().url("Please enter a valid LinkedIn URL").min(2, "LinkedIn URL is required"),
  portfolio: z.string().url("Please enter a valid Portfolio URL").optional().or(z.literal("")),
  resume: z.any().refine((file) => file instanceof File && file.size > 0, {
    message: "Resume is required",
  }),
  coverLetter: z
    .string()
    .min(10, "Cover letter must be at least 10 characters")
    .optional()
    .or(z.literal("")),
  hearAbout: z.string().min(2, "Please select or enter how you heard about this job"),
  hearAboutOther: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

function CareersFormContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobId, setJobId] = useState("");
  const [jobDepartment, setJobDepartment] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);

  const [parsingError, setParsingError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hearAbout, setHearAbout] = useState("");
  const [showOther, setShowOther] = useState(false);

  useEffect(() => {
    const title = searchParams?.get("jobTitle");
    const id = searchParams?.get("jobId");
    const department = searchParams?.get("department");
    if (title) setJobTitle(decodeURIComponent(title));
    if (id) setJobId(id);
    if (department) setJobDepartment(decodeURIComponent(department));
  }, [searchParams]);

  // Function to determine if GitHub and Portfolio fields should be shown
  const shouldShowTechFields = () => {
    return jobDepartment === "Software Development" || jobDepartment === "AI/ML";
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      github: "",
      linkedin: "",
      portfolio: "",
      resume: "",
      coverLetter: "",
      hearAbout: "",
      hearAboutOther: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Quick validation
      if (!data.resume || data.resume.size === 0) {
        toast.error("Please upload a resume");
        setIsSubmitting(false);
        return;
      }

      // 1. Check job availability (only if jobId is provided)
      let jobData: any = null;
      if (jobId) {
        const { checkJobAvailability } = await import('@/lib/api');
        const { firestore } = await import('@/lib/firebase');
        const { doc, getDoc } = await import('firebase/firestore');
        
        const jobDoc = await getDoc(doc(firestore, 'job_posts', jobId));
        if (jobDoc.exists()) {
          jobData = jobDoc.data();
          const availability = await checkJobAvailability(jobId, jobData.seats_available);
          
          if (!availability.isAvailable) {
            const errorMessage = jobData.is_closed 
              ? "This position is no longer accepting applications. The job has been closed."
              : "This position is no longer accepting applications. All seats have been filled.";
            toast.error(errorMessage);
            setIsSubmitting(false);
            return;
          }
        }
      }
      
      const resumeFile = data.resume;
      
      // 2. Create application data
      const applicationData = {
        fullName: data.fullName,
        email: data.email,
        github: data.github || '',
        linkedin: data.linkedin,
        portfolio: data.portfolio || '',
        coverLetter: data.coverLetter || '',
        jobTitle: jobTitle || '',
        jobId: jobId || '',
        hearAbout: data.hearAbout === 'Other' ? data.hearAboutOther : data.hearAbout,
        createdAt: serverTimestamp(),
      };

      // 3. Create Firestore document and upload resume in parallel
      const { firestore } = await import('@/lib/firebase');
      const { collection, addDoc } = await import('firebase/firestore');
      const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      
      // Start both operations in parallel
      const [docRef, uploadTask] = await Promise.all([
        addDoc(collection(firestore, 'career_applications'), applicationData),
        (async () => {
          const storage = getStorage();
          const storageRef = ref(storage, `career_applications/${Date.now()}_${resumeFile.name}`);
          await uploadBytes(storageRef, resumeFile);
          return await getDownloadURL(storageRef);
        })()
      ]);

      // 4. Update document with resume URL
      const { updateDoc } = await import('firebase/firestore');
      await updateDoc(docRef, { resumeUrl: uploadTask });

      // 5. Send success message immediately
      toast.success("Application submitted successfully!");

      // 6. Send email notifications in background (non-blocking)
      const emailData = {
        applicantName: data.fullName,
        applicantEmail: data.email,
        jobTitle: jobTitle || '',
        jobId: jobId || docRef.id,
        githubUrl: data.github || '',
        linkedinUrl: data.linkedin,
        portfolioUrl: data.portfolio || undefined,
        coverLetter: data.coverLetter || undefined,
        hearAbout: data.hearAbout === 'Other' ? data.hearAboutOther : data.hearAbout,
        resumeUrl: uploadTask,
      };

      // Send emails in background without blocking the UI
      fetch('/api/send-job-application-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      }).then(async (response) => {
        if (response.ok) {
          const emailResult = await response.json();
          console.log('📧 Email sending result:', emailResult);
          if (emailResult.applicantEmailSent) {
            toast.success("Confirmation email sent to your inbox!");
          } else if (emailResult.configMissing) {
            console.warn('⚠️ Email configuration missing:', emailResult.message);
            toast.info("Application saved! Email notifications not configured.");
          }
        } else {
          console.error('Failed to send email notifications');
          toast.error('Application saved but email failed to send.');
        }
      }).catch((error) => {
        console.error('Failed to send email notifications:', error);
        toast.error('Application saved but email failed to send.');
      });

      // 7. Reset form and show success
      form.reset();
      setResumeName("");
      setIsSuccess(true);
      setHearAbout("");
      setShowOther(false);
      
    } catch (error) {
      toast.error("Submission failed. Please try again.");
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resume parsing and prefill logic
  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>, onChange: (file: File) => void) {
    const file = e.target.files?.[0];
    if (file) {
      setResumeName(file.name);
      onChange(file);
      setParsingResume(true);
      setParsingError("");
      
      try {
        const formData = new FormData();
        formData.append('resume', file);
        const response = await fetch('/api/extract-resume-fields', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const result = await response.json();
          
          if (result.success) {
            toast.success("Resume uploaded successfully!");
          } else {
            setParsingError('Failed to upload resume');
            toast.error("Failed to upload resume. Please try again.");
          }
        } else {
          const errorData = await response.json();
          setParsingError(errorData.error || 'Failed to upload resume');
          toast.error("Failed to upload resume. Please try again.");
        }
      } catch (err) {
        setParsingError("Network error. Please try again.");
        toast.error("Failed to parse resume. Please fill the form manually.");
      } finally {
        setParsingResume(false);
      }
    }
  }

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
          {/* <p className="text-base sm:text-lg text-gray-500 text-center max-w-lg">
            {jobTitle
              ? `You're applying for the position of "${jobTitle}". Please fill out the form below.`
              : "Explore internships or collaborate as an influencer with Emilio Beaufort."}
          </p> */}
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
              className="space-y-10 bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-gray-100"
            >
              <div className="space-y-8">
                {/* Resume Upload - moved to top */}
                <FormField
                  control={form.control}
                  name="resume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-black">Resume <span className="text-gray-400 font-normal">(PDF, DOC)</span></FormLabel>
                      <FormControl>
                        <div className="w-full mt-2">
                          <label htmlFor="resume-upload" className="block cursor-pointer">
                            <div className="flex flex-col items-center justify-center gap-2 px-6 py-8 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-all text-center">
                              <UploadCloud className="h-8 w-8 text-gray-400 mb-1" />
                              <span className="font-semibold text-black">Drag & drop or <span className="underline text-gold">click to upload</span></span>
                              <span className="text-gray-500 text-xs">{resumeName || "No file selected."}</span>
                              {/* {parsingResume && <span className="text-gold text-xs mt-2 animate-pulse">Parsing resume and prefilling fields...</span>}
                              {parsingError && <span className="text-red-500 text-xs mt-2">{parsingError}</span>} */}
                            </div>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              className="hidden"
                              id="resume-upload"
                              onChange={e => handleResumeUpload(e, field.onChange)}
                            />
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                

                
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-black">Full Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Emilio Beaufort" className="rounded-xl bg-gray-50 focus:bg-white border-gray-200 focus:shadow-md" {...field} />
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
                      <FormLabel className="font-semibold text-black">Email <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" className="rounded-xl bg-gray-50 focus:bg-white border-gray-200 focus:shadow-md" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {shouldShowTechFields() && (
                  <FormField
                    control={form.control}
                    name="github"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-black">
                          GitHub URL <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://github.com/yourusername"
                            className="rounded-xl bg-gray-50 focus:bg-white border-gray-200 focus:shadow-md"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-black">
                        LinkedIn URL <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://linkedin.com/in/yourusername"
                          className="rounded-xl bg-gray-50 focus:bg-white border-gray-200 focus:shadow-md"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {shouldShowTechFields() && (
                  <FormField
                    control={form.control}
                    name="portfolio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-black">
                          Portfolio URL <span className="text-gray-400 font-normal">(optional)</span>
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
                )}

                {/* Hear About Dropdown - now a standard select */}
                <FormField
                  control={form.control}
                  name="hearAbout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-black">
                        Where did you hear about this job opening? <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div>
                          <select
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 shadow-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-gold transition-all mb-2"
                            value={hearAbout}
                            onChange={e => {
                              const value = e.target.value;
                              setHearAbout(value);
                              form.setValue("hearAbout", value);
                              setShowOther(value === "Other");
                              
                            }}
                          >
                            <option value="">Select an option</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Instagram">Instagram</option>
                            <option value="OurWebsite">Our Website</option>
                            <option value="Friend">Friend/Colleague</option>
                            <option value="Other">Other</option>
                          </select>
                          {showOther && (
                            <Input
                              className="mt-3 rounded-xl bg-gray-50 focus:bg-white border-gray-200 focus:shadow-md"
                              placeholder="Please specify..."
                              {...form.register("hearAboutOther")}
                            />
                          )}
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
                className="w-full bg-gradient-to-r from-black via-gold to-black text-white text-lg py-4 rounded-2xl shadow-xl hover:from-gold hover:to-black hover:via-black hover:text-gold transition-all font-extrabold tracking-wide border-2 border-black disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting Application...</span>
                  </div>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}

export default function CareersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CareersFormContent />
    </Suspense>
  );
}