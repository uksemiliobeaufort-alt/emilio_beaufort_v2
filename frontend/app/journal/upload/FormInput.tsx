
// FormInput.tsx
import React, { ChangeEvent } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: string;
  accept?: string;
}

export default function FormInput({ id, label, value, onChange, required = false, type = "text", accept }: FormInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        type={type}
        accept={accept}
      />
    </div>
  );
}
