"use client";

import { Dialog } from "@headlessui/react";
import { Fragment } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function HearModal({ isOpen, onClose }: Props) {
  return (
    <Dialog as={Fragment} open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" onClick={onClose} />

        {/* Modal Panel */}
        <Dialog.Panel className="relative bg-white rounded-lg shadow-xl max-w-lg w-full z-50 p-6">

          {/* macOS-style top buttons with red as close */}
          <div className="absolute top-3 left-3 flex space-x-2">
            <button
              onClick={onClose}
              className="w-3 h-3 bg-red-500 rounded-full hover:scale-110 transition"
              title="Close"
              aria-label="Close modal"
            />
            <span className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="w-3 h-3 bg-green-500 rounded-full" />
          </div>

          {/* Optional: remove × button if only red dot is used */}
          {/* 
          <button
            onClick={onClose}
            className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold"
            aria-label="Close modal"
          >
            ×
          </button>
          */}

          {/* Modal Content */}
          <div className="mt-10 text-center">
            <Dialog.Title className="text-2xl font-bold mb-4">Ormi Hear</Dialog.Title>
            <Dialog.Description className="text-gray-700">
              Discover the premium sound styling collection and treatments for your hair.
            </Dialog.Description>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
