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

  const alignClasses = {
    start: '',
    end: 'dropdown-menu-end',
    center: 'dropdown-menu-center'
  };

  const getDropdownClasses = () => {
    const baseClasses = 'dropdown';
    const directionClasses = {
      down: '',
      up: 'dropup',
      start: 'dropstart',
      end: 'dropend'
    };

    return `${baseClasses} ${directionClasses[direction]} ${className}`.trim();
  };

  const getMenuClasses = () => {
    const baseClasses = 'dropdown-menu';
    const alignClass = align !== 'start' ? alignClasses[align] : '';
    const showClass = isOpen ? 'show' : '';
    
    return `${baseClasses} ${alignClass} ${showClass}`.trim();
  };

  const getButtonClasses = () => {
    const baseClasses = `btn btn-${variant}`;
    const sizeClass = size ? `btn-${size}` : '';
    
    return `${baseClasses} ${sizeClass} dropdown-toggle`.trim();
  };

  return (
    <div className={getDropdownClasses()} ref={dropdownRef}>
      <button
        className={getButtonClasses()}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
      </button>
      
      <ul className={getMenuClasses()}>
        {items.map((item, index) => (
          <li key={index}>
            {item.divider ? (
              <hr className="dropdown-divider" />
            ) : item.href ? (
              <a
                className={`dropdown-item ${item.disabled ? 'disabled' : ''}`}
                href={item.href}
                onClick={() => handleItemClick(item)}
                tabIndex={item.disabled ? -1 : 0}
              >
                {item.label}
              </a>
            ) : (
              <button
                className={`dropdown-item ${item.disabled ? 'disabled' : ''}`}
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