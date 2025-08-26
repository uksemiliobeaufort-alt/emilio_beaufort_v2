

//FormFileInput.tsx
import React, { ChangeEvent } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';

interface FormFileInputProps {
  id: string;
  label: string;
  onFileChange: (file: File | null) => void;
  required?: boolean;
  accept?: string;
  maxSizeMB?: number;
}

export default function FormFileInput({ id, label, onFileChange, required = false, accept = "image/*", maxSizeMB = 5 }: FormFileInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        onFileChange(null);
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`Image size should be less than ${maxSizeMB}MB`);
        onFileChange(null);
        return;
      }
      onFileChange(file);
    } else {
      onFileChange(null);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="file"
        accept={accept}
        onChange={handleChange}
        required={required}
      />
    </div>
  );
}
