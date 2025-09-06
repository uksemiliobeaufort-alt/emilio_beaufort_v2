/*export default function LocationsPage() {
  return (
    <section className="max-w-4xl mx-auto py-12 px-6">
      <h2 className="text-2xl font-bold mb-6">Our Offices</h2>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg">Delhi (Head Office)</h3>
          <p>
            Plot No. A31/1, Sarai Pipal Thala Extension,<br />
            Adarsh Nagar, New Delhi – 110033, India
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-lg">Bangalore Office</h3>
          <p>
            Varushbari Towers, Whitefield,<br />
            Bangalore – 560066, India
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-lg">Kolkata Office</h3>
          <p>
            Konnagara, Howrah,<br />
            Kolkata – 711301, India
          </p>
        </div>
      </div>
    </section>
  );
}*/


/*"use client";

export default function LocationsPage() {
  const offices = [
    {
      city: "Delhi (Head Office)",
      address: [
        "Plot No. A31/1, Sarai Pipal Thala Extension,",
        "Adarsh Nagar, New Delhi – 110033, India",
      ],
    },
    {
      city: "Bangalore Office",
      address: [
        "Varushbari Towers, Whitefield,",
        "Bangalore – 560066, India",
      ],
    },
    {
      city: "Kolkata Office",
      address: [
        "Konnagara, Howrah,",
        "Kolkata – 711301, India",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-50 py-16 px-6 sm:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Our Offices
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We are proud to serve you from our offices across India. 
          Visit us at any of our locations for premium service and support.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {offices.map((office) => (
          <div
            key={office.city}
            className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {office.city}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {office.address.map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}*/

"use client";

import { MapPin, Mail, Phone } from "lucide-react";

export default function LocationsPage() {
  const offices = [
    {
      city: "Delhi (Head Office)",
      address: [
        "Plot No. A31/1, Sarai Pipal Thala Extension,",
        "Adarsh Nagar, New Delhi – 110033, India",
      ],
      email: "hello@emiliobeaufort.com",
      phone: "+91 8962648358",
      mapsLink:
        "https://www.google.com/maps?q=Plot+No.+A31/1,+Sarai+Pipal+Thala+Extension,+New+Delhi",
    },
    {
      city: "Bengaluru Office",
      address: [
        "Vrushabadri Towers, Whitefield,",
        "Bengaluru – 560067, India",
      ],
      email: "hello@emiliobeaufort.com",
      phone: "+91 8962648358",
      mapsLink: "https://www.google.com/maps?q=Whitefield,+Bangalore",
    },
    {
      city: "Kolkata Office",
      address: [
        "Konnagara, Howrah,",
        "Kolkata – 711301, India",
      ],
      email: "hello@emiliobeaufort.com",
      phone: "+91 8962648358",
      mapsLink: "https://www.google.com/maps?q=Konnagara,+Howrah,+Kolkata",
    },
  ];

  return (
    <main className="min-h-screen relative py-20 px-6 sm:px-12 lg:px-20 
                     bg-gradient-to-br from-white via-amber-50 to-white">
      {/* Title Section */}
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-wide">
          Explore Our Locations
        </h1>
        <div className="w-28 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto rounded-full mb-6"></div>
        <p className="text-gray-700 max-w-2xl mx-auto text-lg">
          We are proud to serve you from our offices across India.  
          Visit us at any of our locations for premium service and support.
        </p>
      </div>

      {/* Office Cards */}
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {offices.map((office) => (
          <div
            key={office.city}
            className="relative bg-white rounded-2xl p-8 border border-amber-200 
                       shadow-lg hover:shadow-2xl hover:shadow-amber-300/40 
                       transform hover:-translate-y-2 hover:scale-105 
                       transition-all duration-500"
          >
            {/* Header */}
            <div className="flex items-center mb-5">
              <div className="p-3 rounded-full bg-amber-100 text-amber-600 shadow-inner">
                <MapPin size={20} />
              </div>
              <h2 className="ml-3 text-xl font-semibold text-amber-700">
                {office.city}
              </h2>
            </div>

            <div className="border-t border-gray-200 mb-4"></div>

            {/* Address */}
            <p className="text-gray-700 text-sm leading-relaxed mb-6">
              {office.address.map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </p>

            {/* Contact Actions */}
            <div className="flex flex-col gap-3">
              <a
                href={`mailto:${office.email}`}
                className="flex items-center gap-2 text-sm font-medium 
                           text-gray-600 hover:text-amber-600 transition-colors duration-300"
              >
                <Mail size={16} className="text-amber-600" /> {office.email}
              </a>

              <a
                href={`tel:${office.phone}`}
                className="flex items-center gap-2 text-sm font-medium 
                           text-gray-600 hover:text-amber-600 transition-colors duration-300"
              >
                <Phone size={16} className="text-amber-600" /> {office.phone}
              </a>

              {/* Premium Get Directions Button */}
              <a
                href={office.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center mt-5 px-6 py-2.5 
                           text-sm font-semibold text-gray-900 
                           bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500
                           rounded-lg shadow-md hover:shadow-xl 
                           transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                  Get Directions
                </span>
                {/* Glow Effect */}
                <span className="absolute inset-0 bg-amber-500 opacity-0 group-hover:opacity-100 
                                 transition-opacity duration-300"></span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}


