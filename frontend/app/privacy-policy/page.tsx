export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-space-grotesk font-bold text-gray-900 mb-8">
          Privacy Policy
        </h1>
        
        <div className="prose prose-lg max-w-none font-plus-jakarta">
          <p className="text-gray-600 mb-6">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-space-grotesk font-semibold text-gray-900 mb-4">
              Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              At Emilio Beaufort, we are committed to protecting your privacy and ensuring the security 
              of your personal information. This Privacy Policy explains how we collect, use, and 
              safeguard your information when you visit our website or use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-space-grotesk font-semibold text-gray-900 mb-4">
              Information We Collect
            </h2>
            <ul className="text-gray-700 space-y-2">
              <li>• Personal information you provide (name, email, contact details)</li>
              <li>• Purchase and transaction history</li>
              <li>• Website usage data and analytics</li>
              <li>• Communication preferences</li>
              <li>• Device and browser information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-space-grotesk font-semibold text-gray-900 mb-4">
              How We Use Your Information
            </h2>
            <ul className="text-gray-700 space-y-2">
              <li>• Process orders and provide customer service</li>
              <li>• Improve our products and services</li>
              <li>• Send marketing communications (with your consent)</li>
              <li>• Comply with legal obligations</li>
              <li>• Prevent fraud and ensure security</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-space-grotesk font-semibold text-gray-900 mb-4">
              Your Rights
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the right to access, update, or delete your personal information. 
              You can also opt-out of marketing communications at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-space-grotesk font-semibold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:info@emiliocosmetics.com" className="text-blue-600 hover:text-blue-700">
                info@emiliocosmetics.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 