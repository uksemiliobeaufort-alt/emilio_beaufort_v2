"use client";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";

export default function AboutPage() {
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
              About Emilio Beaufort
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A legacy of excellence in luxury grooming, built on the foundation 
              of purpose, precision, and uncompromising quality.
            </p>
          </motion.div>
        </SectionWrapper>
      </section>

      {/* Our Mission Section */}
      <section className="py-20 bg-muted/30">
        <SectionWrapper>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8 text-center">
              Our Mission
            </h2>
            <div className="prose prose-lg mx-auto text-center">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                To redefine the standards of luxury grooming by creating products that 
                not only enhance your appearance but elevate your entire being. We believe 
                that true luxury is found in the details—the precision of our formulations, 
                the quality of our ingredients, and the craftsmanship of our packaging.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Every product in our collection is designed with purpose, formulated with 
                intention, and delivered with the promise of excellence. We are committed 
                to creating grooming experiences that inspire confidence and reflect the 
                sophistication of the modern gentleman.
              </p>
            </div>
          </motion.div>
        </SectionWrapper>
      </section>

      {/* Our Philosophy Section */}
      <section className="py-20">
        <SectionWrapper>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8 text-center">
              Our Philosophy
            </h2>
            <div className="prose prose-lg mx-auto text-center">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                At Emilio Beaufort, we believe that grooming is not merely a routine—it&apos;s 
                a ritual of self-respect and personal expression. Our philosophy centers 
                on three core principles: purpose, precision, and luxury.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                <strong className="text-foreground">Purpose:</strong> Every product serves 
                a specific function, designed to address real needs with real solutions. 
                We don&apos;t create products for the sake of variety; we create them for the 
                sake of excellence.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                <strong className="text-foreground">Precision:</strong> Our formulations 
                are the result of countless hours of research and refinement. We use only 
                the finest ingredients, carefully selected and expertly combined to deliver 
                optimal results.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Luxury:</strong> True luxury is 
                understated yet unmistakable. It&apos;s found in the weight of our packaging, 
                the texture of our formulations, and the confidence our products inspire.
              </p>
            </div>
          </motion.div>
        </SectionWrapper>
      </section>

      {/* The Emilio Beaufort Difference Section */}
      <section className="py-20 bg-muted/30">
        <SectionWrapper>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8 text-center">
              The Emilio Beaufort Difference
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-heading font-semibold mb-4">
                  Uncompromising Quality
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We source only the finest ingredients from around the world, ensuring 
                  that every product meets our exacting standards. Our formulations are 
                  developed by experts in cosmetic chemistry and tested extensively to 
                  guarantee both safety and efficacy.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-heading font-semibold mb-4">
                  Timeless Design
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our packaging reflects the same attention to detail as our formulations. 
                  Each product is housed in elegant, minimalist containers that speak to 
                  the sophisticated aesthetic of the modern gentleman.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-heading font-semibold mb-4">
                  Sustainable Luxury
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We believe that true luxury is sustainable. Our products are formulated 
                  with environmentally conscious practices, and our packaging is designed 
                  to minimize waste while maintaining the premium experience our customers 
                  expect.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-heading font-semibold mb-4">
                  Personal Connection
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We understand that grooming is deeply personal. That&apos;s why we&apos;ve created 
                  products that not only perform exceptionally but also resonate with the 
                  individual who uses them. Every detail is considered with the user in mind.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </SectionWrapper>
      </section>
    </div>
  );
} 