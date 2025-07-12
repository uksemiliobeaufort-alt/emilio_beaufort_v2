"use client";

import BootstrapDropdown, { ExampleBootstrapDropdown } from '@/components/ui/BootstrapDropdown';

export default function BootstrapDropdownExample() {
  const navigationItems = [
    { label: 'Profile', onClick: () => console.log('Profile clicked') },
    { label: 'Settings', onClick: () => console.log('Settings clicked') },
    { divider: true },
    { label: 'Logout', onClick: () => console.log('Logout clicked') }
  ];

  const productItems = [
    { label: 'View Details', onClick: () => console.log('View Details clicked') },
    { label: 'Edit Product', onClick: () => console.log('Edit Product clicked') },
    { label: 'Duplicate', onClick: () => console.log('Duplicate clicked') },
    { divider: true },
    { label: 'Delete', onClick: () => console.log('Delete clicked'), disabled: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Bootstrap Dropdown Examples</h1>
        
        {/* Basic Examples */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Basic Dropdown Examples</h2>
          <div className="flex flex-wrap gap-4">
            <BootstrapDropdown
              trigger="Primary Dropdown"
              items={navigationItems}
              variant="primary"
            />
            
            <BootstrapDropdown
              trigger="Secondary Dropdown"
              items={navigationItems}
              variant="secondary"
            />
            
            <BootstrapDropdown
              trigger="Success Dropdown"
              items={navigationItems}
              variant="success"
            />
            
            <BootstrapDropdown
              trigger="Danger Dropdown"
              items={navigationItems}
              variant="danger"
            />
          </div>
        </div>

        {/* Size Examples */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Dropdown Sizes</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <BootstrapDropdown
              trigger="Small"
              items={navigationItems}
              variant="primary"
              size="sm"
            />
            
            <BootstrapDropdown
              trigger="Default"
              items={navigationItems}
              variant="primary"
            />
            
            <BootstrapDropdown
              trigger="Large"
              items={navigationItems}
              variant="primary"
              size="lg"
            />
          </div>
        </div>

        {/* Direction Examples */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Dropdown Directions</h2>
          <div className="flex flex-wrap gap-4">
            <BootstrapDropdown
              trigger="Drop Down"
              items={navigationItems}
              variant="info"
              direction="down"
            />
            
            <BootstrapDropdown
              trigger="Drop Up"
              items={navigationItems}
              variant="info"
              direction="up"
            />
            
            <BootstrapDropdown
              trigger="Drop Start"
              items={navigationItems}
              variant="info"
              direction="start"
            />
            
            <BootstrapDropdown
              trigger="Drop End"
              items={navigationItems}
              variant="info"
              direction="end"
            />
          </div>
        </div>

        {/* Alignment Examples */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Dropdown Alignment</h2>
          <div className="flex justify-between">
            <BootstrapDropdown
              trigger="Start Aligned"
              items={navigationItems}
              variant="warning"
              align="start"
            />
            
            <BootstrapDropdown
              trigger="End Aligned"
              items={navigationItems}
              variant="warning"
              align="end"
            />
          </div>
        </div>

        {/* Custom Trigger Examples */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Custom Triggers</h2>
          <div className="flex flex-wrap gap-4">
            <BootstrapDropdown
              trigger={
                <div className="flex items-center gap-2">
                  <span>User Menu</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              }
              items={navigationItems}
              variant="outline-primary"
            />
            
            <BootstrapDropdown
              trigger={
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <span>Account</span>
                </div>
              }
              items={productItems}
              variant="light"
            />
          </div>
        </div>

        {/* Complex Example */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Complex Dropdown with Links</h2>
          <div className="flex flex-wrap gap-4">
            <BootstrapDropdown
              trigger="Actions"
              items={[
                { label: 'View Profile', href: '/profile', onClick: () => console.log('View Profile clicked') },
                { label: 'Edit Settings', href: '/settings', onClick: () => console.log('Edit Settings clicked') },
                { divider: true },
                { label: 'Help Center', href: '/help', onClick: () => console.log('Help Center clicked') },
                { label: 'Contact Support', href: '/support', onClick: () => console.log('Contact Support clicked') },
                { divider: true },
                { label: 'Delete Account', onClick: () => console.log('Delete Account clicked'), disabled: true }
              ]}
              variant="danger"
            />
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">How to Use Bootstrap Dropdown</h2>
          <div className="space-y-4 text-blue-800">
            <div>
              <h3 className="font-semibold">1. Install Bootstrap (if not already installed):</h3>
              <code className="block bg-blue-100 p-2 rounded mt-1">
                npm install bootstrap @popperjs/core
              </code>
            </div>
            
            <div>
              <h3 className="font-semibold">2. Import Bootstrap CSS in your layout or global CSS:</h3>
              <code className="block bg-blue-100 p-2 rounded mt-1">
                @import 'bootstrap/dist/css/bootstrap.min.css';
              </code>
            </div>
            
            <div>
              <h3 className="font-semibold">3. Import and use the component:</h3>
              <pre className="block bg-blue-100 p-2 rounded mt-1 text-sm">
{`import BootstrapDropdown from '@/components/ui/BootstrapDropdown';

const items = [
  { label: 'Action', onClick: () => console.log('Action clicked') },
  { label: 'Another action', onClick: () => console.log('Another action clicked') },
  { divider: true },
  { label: 'Separated link', href: '#', onClick: () => console.log('Separated link clicked') }
];

<BootstrapDropdown
  trigger="Dropdown"
  items={items}
  variant="primary"
  size="lg"
  direction="down"
  align="start"
/>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 