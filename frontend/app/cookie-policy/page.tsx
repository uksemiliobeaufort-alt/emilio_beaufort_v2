export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-space-grotesk font-bold text-gray-900 mb-8">
          Cookie Policy
        </h1>
        
        <div className="prose prose-lg max-w-none font-plus-jakarta">
          <p className="text-gray-600 mb-6">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-space-grotesk font-semibold text-gray-900 mb-4">
              What Are Cookies?
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cookies are small text files that are stored on your device when you visit our website. 
              They help us provide you with a better browsing experience and allow certain features 
              to function properly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-space-grotesk font-semibold text-gray-900 mb-4">
              Types of Cookies We Use
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-space-grotesk font-medium text-gray-900 mb-2">
                  Essential Cookies
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  These cookies are necessary for the website to function properly. They enable 
                  basic functions like page navigation and access to secure areas.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-space-grotesk font-medium text-gray-900 mb-2">
                  Analytics Cookies
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  These cookies help us understand how visitors interact with our website by 
                  collecting and reporting information anonymously.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-space-grotesk font-medium text-gray-900 mb-2">
                  Functional Cookies
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  These cookies enable enhanced functionality and personalization, such as 
                  remembering your preferences and login details.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-space-grotesk font-medium text-gray-900 mb-2">
                  Marketing Cookies
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  These cookies are used to track visitors across websites to display relevant 
                  and engaging advertisements.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-space-grotesk font-semibold text-gray-900 mb-4">
              Managing Your Cookie Preferences
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You can control and manage cookies in several ways:
            </p>
            <ul className="text-gray-700 space-y-2">
              <li>• Use our cookie consent banner to accept or decline cookies</li>
              <li>• Adjust your browser settings to block or delete cookies</li>
              <li>• Use browser plugins to manage cookie preferences</li>
              <li>• Contact us to discuss your preferences</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-space-grotesk font-semibold text-gray-900 mb-4">
              Third-Party Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may use third-party services such as Google Analytics, social media plugins, 
              and advertising networks that may set their own cookies. Please refer to their 
              respective privacy policies for more information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-space-grotesk font-semibold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about our use of cookies, please contact us at{" "}
              <a href="mailto:cookies@emiliobeaufort.com" className="text-blue-600 hover:text-blue-700">
                cookies@emiliobeaufort.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 