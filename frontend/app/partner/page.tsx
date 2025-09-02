import SectionWrapper from "@/components/SectionWrapper";
import PartnerForm from "./PartnerForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partnership Opportunities | Luxury Grooming Brand",
  description:
    "Partner with us to redefine luxury grooming. Explore supplier, distributor, retail, and brand collaboration opportunities.",
  keywords: [
    "luxury grooming partnerships",
    "supplier opportunities",
    "distributor collaborations",
    "retail partners",
    "brand collaboration"
  ],
  openGraph: {
    title: "Partner With Us | Luxury Grooming",
    description:
      "We’re looking for suppliers, distributors, retailers, and collaborators who share our vision of excellence and innovation.",
    type: "website",
    url: "https://yourdomain.com/partner",
    images: [
      {
        url: "https://yourdomain.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Partnership Inquiry - Luxury Grooming",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Partner With Us | Luxury Grooming",
    description:
      "Join our luxury grooming brand as a supplier, distributor, or collaborator.",
    images: ["https://yourdomain.com/og-image.jpg"],
  },
};

export default function PartnerPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Server rendered */}
      <section className="py-20">
        <SectionWrapper>
          <div className="text-center mb-16 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">
              Build With Us
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join us in redefining luxury grooming. We&apos;re always looking
              for partners who share our vision of excellence and innovation.
            </p>
          </div>
        </SectionWrapper>
      </section>

      {/* Client Form Section */}
      <PartnerForm />
    </div>
  );
}
