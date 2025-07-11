"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
}

interface BootstrapDropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export default function BootstrapDropdown({
  options,
  value,
  placeholder = "Select an option",
  onChange,
  className = "",
  disabled = false
}: BootstrapDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`dropdown relative ${className}`} ref={dropdownRef}>
      <button
        className={`dropdown-toggle w-full flex items-center justify-between px-3 py-2 h-10 border border-gray-300 rounded-md bg-white text-left transition-all duration-200 text-gray-700 text-sm ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300'
        }`}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={isOpen}
      >
        <span className="text-sm flex-1">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={`h-4 w-4 ml-2 transition-transform duration-200 text-gray-500 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      {isOpen && (
        <ul className="dropdown-menu absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto z-50">
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className={`dropdown-item w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 ${
                  value === option.value ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700'
                }`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 