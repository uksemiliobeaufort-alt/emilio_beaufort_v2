"use client";

import React, { useState, useRef, useEffect } from 'react';

interface BootstrapDropdownProps {
  trigger: React.ReactNode;
  items: {
    label?: string;
    onClick?: () => void;
    href?: string;
    disabled?: boolean;
    divider?: boolean;
  }[];
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  size?: 'sm' | 'lg';
  direction?: 'down' | 'up' | 'start' | 'end';
  align?: 'start' | 'end' | 'center';
}

export default function BootstrapDropdown({
  trigger,
  items,
  className = '',
  variant = 'primary',
  size,
  direction = 'down',
  align = 'start'
}: BootstrapDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleItemClick = (item: any) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  // Tailwind-based dropdown classes
  const getButtonClasses = () => {
    let base = 'px-4 py-2 rounded bg-white border shadow focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2';
    if (size === 'sm') base += ' text-sm py-1 px-2';
    if (size === 'lg') base += ' text-lg py-3 px-6';
    return base + (className ? ` ${className}` : '');
  };

  // Dropdown alignment
  let menuAlign = 'left-0';
  if (align === 'end') menuAlign = 'right-0';
  if (align === 'center') menuAlign = 'left-1/2 -translate-x-1/2';

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        className={getButtonClasses()}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
        <svg className={`ml-2 w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {isOpen && (
        <ul className={`absolute z-50 mt-2 min-w-[10rem] bg-white border rounded shadow-lg ${menuAlign} py-1`}>
          {items.map((item, index) => (
            <li key={index}>
              {item.divider ? (
                <hr className="my-1 border-gray-200" />
              ) : item.href ? (
                <a
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${item.disabled ? 'text-gray-400 cursor-not-allowed' : ''}`}
                  href={item.href}
                  onClick={() => handleItemClick(item)}
                  tabIndex={item.disabled ? -1 : 0}
                >
                  {item.label}
                </a>
              ) : (
                <button
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${item.disabled ? 'text-gray-400 cursor-not-allowed' : ''}`}
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  type="button"
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Example usage component
export function ExampleBootstrapDropdown() {
  const dropdownItems = [
    { label: 'Action', onClick: () => console.log('Action clicked') },
    { label: 'Another action', onClick: () => console.log('Another action clicked') },
    { label: 'Something else here', onClick: () => console.log('Something else clicked') },
    { divider: true },
    { label: 'Separated link', href: '#', onClick: () => console.log('Separated link clicked') }
  ];

  return (
    <div className="p-4">
      <h3 className="mb-3">Bootstrap Dropdown Examples</h3>
      
      <div className="d-flex gap-3 flex-wrap">
        {/* Basic Dropdown */}
        <BootstrapDropdown
          trigger="Dropdown"
          items={dropdownItems}
          variant="primary"
        />

        {/* Secondary Dropdown */}
        <BootstrapDropdown
          trigger="Secondary"
          items={dropdownItems}
          variant="secondary"
        />

        {/* Large Dropdown */}
        <BootstrapDropdown
          trigger="Large Dropdown"
          items={dropdownItems}
          variant="success"
          size="lg"
        />

        {/* Dropdown with different alignment */}
        <BootstrapDropdown
          trigger="Aligned Dropdown"
          items={dropdownItems}
          variant="info"
          align="end"
        />
      </div>
    </div>
  );
} 