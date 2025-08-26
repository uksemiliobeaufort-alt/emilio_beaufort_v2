
// components/TextComponents.tsx
import { motion } from "framer-motion";

export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-4xl md:text-6xl font-heading font-bold text-center mb-16">
      {children}
    </h1>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl font-heading font-semibold mb-6 mt-12 text-foreground">
      {children}
    </h2>
  );
}

export function SectionContent({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-lg leading-relaxed mb-6 text-muted-foreground">
      {children}
    </p>
  );
}

export function AnimatedContainer({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className="prose prose-lg max-w-none"
    >
      {children}
    </motion.div>
  );
}
