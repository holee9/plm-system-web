// ProjectKeyInput Component
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ProjectKeyInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  id?: string;
}

export function ProjectKeyInput({
  value,
  onChange,
  disabled = false,
  required = true,
  error,
  id = "key",
}: ProjectKeyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Convert to uppercase
    const uppercased = rawValue.toUpperCase();

    // Filter to only alphanumeric characters
    const alphanumeric = uppercased.replace(/[^A-Z0-9]/g, "");

    // Limit to 10 characters
    const limited = alphanumeric.slice(0, 10);

    onChange(limited);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        Project Key {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={handleChange}
        placeholder="PROJ01"
        disabled={disabled}
        maxLength={10}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : `${id}-description`}
      />
      <p id={`${id}-description`} className="text-xs text-muted-foreground">
        2-10 uppercase letters and numbers (e.g., PLM, PROJ01)
      </p>
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
