"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api, HomeData } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import  CardGrid  from "@/components/CardGrid";


export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const homeData = await api.getHomeData();
        setData(homeData);
      } catch {
        console.error('Failed to fetch home data');
        toast.error('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.submitPartnershipInquiry(formData);
      toast.success('Partnership inquiry submitted successfully');
      setFormData({ name: '', email: '', company: '', message: '' });
    } catch {
      toast.error('Failed to submit inquiry');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-premium flex items-center justify-center">
        <div className="text-2xl font-serif text-premium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premium">
      <Navbar />
      
      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-premium">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100"></div>
        <motion.div 
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-7xl md:text-9xl font-serif font-bold text-premium mb-8 leading-tight tracking-tight">
              Emilio Beaufort
            </h1>
          </motion.div>
          <motion.p 
            className="text-xl md:text-2xl body-premium mb-16 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            Where luxury meets precision. A curated collection of grooming essentials for the discerning gentleman.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            <Button 
              size="lg" 
              className="btn-primary-premium text-lg px-12 py-6 text-base font-sans-medium"
              onClick={() => document.getElementById('philosophy')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Discover Our Philosophy
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="section-padding bg-premium">
        <div className="container-premium">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="heading-premium text-6xl md:text-7xl text-premium mb-12">
              Philosophy
            </h2>
            <p className="body-premium text-xl max-w-4xl mx-auto leading-relaxed">
              We believe in the art of refinement. Every product is crafted with uncompromising attention to detail, 
              using only the finest ingredients and materials. Our philosophy centers on timeless elegance, 
              sustainable luxury, and the belief that true sophistication lies in simplicity.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-16">
            {[
              {
                title: 'Timeless Elegance',
                description: 'Designs that transcend trends, creating pieces that remain relevant and beautiful for generations.',
                icon: '✨',
                delay: 0.2
              },
              {
                title: 'Sustainable Luxury',
                description: 'Luxury that respects our planet, using ethically sourced materials and sustainable practices.',
                icon: '🌿',
                delay: 0.4
              },
              {
                title: 'Uncompromising Quality',
                description: 'Every detail matters. From the finest ingredients to the most precise craftsmanship.',
                icon: '⚡',
                delay: 0.6
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: item.delay, ease: "easeOut" }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="text-6xl mb-8 group-hover:scale-110 transition-premium">{item.icon}</div>
                <h3 className="heading-premium text-2xl text-premium mb-6">{item.title}</h3>
                <p className="body-premium leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The House Section */}
      <section id="house" className="section-padding bg-white">
        <div className="container-premium">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="heading-premium text-6xl md:text-7xl text-premium mb-12">
              The House
            </h2>
            <p className="body-premium text-xl max-w-4xl mx-auto leading-relaxed">
              Our curated collection represents the pinnacle of grooming excellence. 
              Each product is designed to elevate your daily ritual.
            </p>
          </motion.div>

          {/* Cards Grid */}
            <main className="p-6">
              <h1 className="text-2xl font-bold mb-4 text-center">Welcome to the House!</h1>
              <CardGrid />
            </main>


          {/* Cosmetics */}
          {/* <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h3 className="heading-premium text-4xl text-premium mb-12 text-center">Cosmetics</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {data?.cosmetics.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="card-premium"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </motion.div> */}

          {/* Hair */}
          {/* <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <h3 className="heading-premium text-4xl text-premium mb-12 text-center">Hair</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {data?.hair.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="card-premium"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </motion.div> */}
        </div>
      </section>

      {/* Journal Section */}
      <section id="journal" className="section-padding bg-premium">
        <div className="container-premium">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="heading-premium text-6xl md:text-7xl text-premium mb-12">
              Journal
            </h2>
            <p className="body-premium text-xl max-w-4xl mx-auto leading-relaxed">
              Insights, stories, and the art of living well. Our journal explores the intersection of style, 
              culture, and the pursuit of excellence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {data?.posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: index * 0.2, ease: "easeOut" }}
                viewport={{ once: true }}
                className="card-premium"
              >
                <Card className="h-full bg-white border-premium hover:border-gold transition-premium shadow-premium">
                  <CardHeader>
                    <CardTitle className="heading-premium text-xl text-premium">{post.title}</CardTitle>
                    <CardDescription className="body-premium">
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="body-premium leading-relaxed">{post.excerpt}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Alliances Section */}
      <section id="alliances" className="section-padding bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="heading-premium text-6xl md:text-7xl text-premium mb-12">
              Alliances
            </h2>
            <p className="body-premium text-xl max-w-3xl mx-auto leading-relaxed">
              We believe in the power of collaboration. Let&apos;s explore how we can create something extraordinary together.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <Card className="bg-premium border-premium shadow-premium-lg">
              <CardHeader className="text-center">
                <CardTitle className="heading-premium text-3xl text-premium">Partnership Inquiry</CardTitle>
                <CardDescription className="body-premium text-lg">
                  Tell us about your vision and how we might collaborate.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <Label htmlFor="name" className="font-sans-medium text-premium mb-3 block">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="input-premium w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="font-sans-medium text-premium mb-3 block">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="input-premium w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="company" className="font-sans-medium text-premium mb-3 block">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      required
                      className="input-premium w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message" className="font-sans-medium text-premium mb-3 block">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={6}
                      className="input-premium w-full resize-none"
                      placeholder="Tell us about your vision and how we might collaborate..."
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="btn-primary-premium w-full py-4 text-lg font-sans-medium"
                  >
                    Submit Inquiry
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 