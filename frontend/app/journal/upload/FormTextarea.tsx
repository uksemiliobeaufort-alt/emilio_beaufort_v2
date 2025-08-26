
// FormTextarea.tsx
import React, { ChangeEvent } from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FormTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  className?: string;
}

export default function FormTextarea({ id, label, value, onChange, required = false, className = '' }: FormTextareaProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className={className}
      />
    </div>
  );
}
