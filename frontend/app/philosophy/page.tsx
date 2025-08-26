/*"use client";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";

export default function PhilosophyPage() {
  return (
    <div className="min-h-screen">
      <SectionWrapper>
        <div className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-center mb-16">
              Our Philosophy
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="prose prose-lg max-w-none"
            >
              <p className="text-xl leading-relaxed mb-8 text-muted-foreground">
                At Emilio Beaufort, we believe that true luxury is not about excess, but about 
                intentional choices that reflect your inner strength and character. We are not 
                merely a cosmetics brand—we are a grooming movement that celebrates the 
                sophisticated man who understands that his appearance is a reflection of his 
                values and aspirations.
              </p>

              <h2 className="text-3xl font-heading font-semibold mb-6 mt-12 text-foreground">
                The Foundation of Strength
              </h2>
              
              <p className="text-lg leading-relaxed mb-6 text-muted-foreground">
                Our philosophy is built on three core principles: authenticity, quality, and 
                purpose. Every product we create is designed to enhance your natural features 
                while maintaining the integrity of your individual style. We reject the notion 
                that grooming is about conforming to societal standards—instead, we empower you 
                to express your unique identity through carefully crafted formulations that 
                respect both your skin and your values.
              </p>

              <h2 className="text-3xl font-heading font-semibold mb-6 mt-12 text-foreground">
                Beyond the Surface
              </h2>
              
              <p className="text-lg leading-relaxed mb-6 text-muted-foreground">
                True grooming goes beyond the physical. It&apos;s about cultivating confidence, 
                discipline, and self-respect. When you take the time to care for your appearance, 
                you&apos;re not just applying products—you&apos;re practicing self-care, building 
                discipline, and honoring the person you are becoming. This daily ritual becomes 
                a meditation, a moment of reflection, and a commitment to excellence in all 
                aspects of your life.
              </p>

              <h2 className="text-3xl font-heading font-semibold mb-6 mt-12 text-foreground">
                The Emilio Beaufort Difference
              </h2>
              
              <p className="text-lg leading-relaxed mb-6 text-muted-foreground">
                What sets us apart is our unwavering commitment to quality and our deep 
                understanding of the modern man&apos;s needs. We don&apos;t create products for the 
                masses—we craft solutions for the individual who demands excellence. Our 
                formulations are developed with the finest ingredients, our packaging reflects 
                timeless elegance, and our approach to customer service is as personal as the 
                products themselves.
              </p>

              <h2 className="text-3xl font-heading font-semibold mb-6 mt-12 text-foreground">
                Join the Movement
              </h2>
              
              <p className="text-lg leading-relaxed mb-6 text-muted-foreground">
                When you choose Emilio Beaufort, you&apos;re not just purchasing a product—you&apos;re 
                joining a community of men who understand that true strength comes from within, 
                but is reflected in how we present ourselves to the world. You&apos;re choosing to 
                invest in yourself, in your confidence, and in the image you project to others.
              </p>

              <p className="text-xl leading-relaxed mt-12 text-foreground font-medium">
                This is not just grooming. This is a reflection of strength.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </SectionWrapper>
    </div>
  );
} */

  "use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import { AnimatedContainer, PageTitle, SectionContent, SectionTitle } from "./TextComponents";
//import { PageTitle, SectionTitle, SectionContent, AnimatedContainer } from "@/components/TextComponents";

export default function PhilosophyPage() {
  return (
    <div className="min-h-screen">
      <SectionWrapper>
        <div className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <PageTitle>Our Philosophy</PageTitle>

            <AnimatedContainer delay={0.2}>
              <SectionContent>
                At Emilio Beaufort, we believe that true luxury is not about excess, but about intentional choices that reflect your inner strength and character. We are not merely a cosmetics brand—we are a grooming movement that celebrates the sophisticated man who understands that his appearance is a reflection of his values and aspirations.
              </SectionContent>

              <SectionTitle>The Foundation of Strength</SectionTitle>
              <SectionContent>
                Our philosophy is built on three core principles: authenticity, quality, and purpose. Every product we create is designed to enhance your natural features while maintaining the integrity of your individual style. We reject the notion that grooming is about conforming to societal standards—instead, we empower you to express your unique identity through carefully crafted formulations that respect both your skin and your values.
              </SectionContent>

              <SectionTitle>Beyond the Surface</SectionTitle>
              <SectionContent>
                True grooming goes beyond the physical. It&apos;s about cultivating confidence, discipline, and self-respect. When you take the time to care for your appearance, you&apos;re not just applying products—you&apos;re practicing self-care, building discipline, and honoring the person you are becoming. This daily ritual becomes a meditation, a moment of reflection, and a commitment to excellence in all aspects of your life.
              </SectionContent>

              <SectionTitle>The Emilio Beaufort Difference</SectionTitle>
              <SectionContent>
                What sets us apart is our unwavering commitment to quality and our deep understanding of the modern man&apos;s needs. We don&apos;t create products for the masses—we craft solutions for the individual who demands excellence. Our formulations are developed with the finest ingredients, our packaging reflects timeless elegance, and our approach to customer service is as personal as the products themselves.
              </SectionContent>

              <SectionTitle>Join the Movement</SectionTitle>
              <SectionContent>
                When you choose Emilio Beaufort, you&apos;re not just purchasing a product—you&apos;re joining a community of men who understand that true strength comes from within, but is reflected in how we present ourselves to the world. You&apos;re choosing to invest in yourself, in your confidence, and in the image you project to others.
              </SectionContent>

              <p className="text-xl leading-relaxed mt-12 text-foreground font-medium">
                This is not just grooming. This is a reflection of strength.
              </p>
            </AnimatedContainer>
          </motion.div>
        </div>
      </SectionWrapper>
    </div>
  );
}