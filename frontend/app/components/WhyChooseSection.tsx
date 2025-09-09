export default function WhyChooseSection() {
  return (
    <section className="py-16 bg-white section-premium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black text-premium mb-6 leading-tight">
            Why Choose Emilio Beaufort?
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Discover the Emilio Beaufort difference—where temple hair meets trust, style, and a vibrant community. We make confidence easy.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="text-center px-4">
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold mb-2 text-premium">Ethical Temple Hair</h3>
            <p className="text-gray-600">Sourced with care, always pure. 100% real temple hair—traceable, ethical, and beautiful.</p>
          </div>
          <div className="text-center px-4">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2 text-premium">Real Results</h3>
            <p className="text-gray-600">See the change. Our hair extensions deliver natural volume and shine—loved by real people, worldwide.</p>
          </div>
          <div className="text-center px-4">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-2 text-premium">Confident Community</h3>
            <p className="text-gray-600">Join a global family. Share your look, get inspired, and feel your best—every day.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
