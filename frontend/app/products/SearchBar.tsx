

// components/products/SearchBar.tsx
import React from "react";

interface SearchBarProps {
  searchInput: string;
  onSearchInputChange: (val: string) => void;
  onSubmit: () => void;
}

export default function SearchBar({ searchInput, onSearchInputChange, onSubmit }: SearchBarProps) {
  return (
    <form
      className="flex justify-center "
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <input
        type="text"
        value={searchInput}
        onChange={(e) => onSearchInputChange(e.target.value)}
        placeholder="Search products..."
        className="w-full max-w-2xl px-5 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-premium text-lg shadow-sm"
      />
      <button
        type="submit"
        className="px-8 py-2 bg-black text-white font-semibold rounded-r-lg border border-black hover:bg-white hover:text-black transition-colors duration-200 text-lg shadow-sm"
      >
        Search
      </button>
    </form>
  );
}
