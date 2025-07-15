import { motion } from 'framer-motion';
import Image from 'next/image';

interface Partner {
  name: string;
  logo: string;
  url: string;
}

const partners: Partner[] = [
  { name: 'Salon Luxe', logo: '/partners/salon-luxe.png', url: 'https://salonluxe.com' },
  { name: 'Global Wig Co.', logo: '/partners/global-wig.png', url: 'https://globalwig.com' },
  { name: 'Elite Hair Exporters', logo: '/partners/elite-hair.png', url: 'https://elitehair.com' },
  { name: 'BeautyVerse', logo: '/partners/beautyverse.png', url: 'https://beautyverse.com' },
  // Add more partners as needed
];

const PartnersSection: React.FC = () => {
  return (
    <section id="partners" className="py-16 bg-white">
      <div className="container-premium text-center">
        <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-8 text-premium">
          Our Trusted Partners
        </h2>
        <p className="body-premium text-lg mb-12 max-w-3xl mx-auto">
          We proudly collaborate with top salons, distributors, and beauty brands worldwide.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center">
          {partners.map((partner) => (
            <motion.a
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              className="transition-transform"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={150}
                height={80}
                className="mx-auto h-16 md:h-20 object-contain grayscale hover:grayscale-0 transition duration-300"
              />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;