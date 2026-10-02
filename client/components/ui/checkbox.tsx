import React from "react";
import { Check } from "lucide-react";

interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked = false,
  onCheckedChange,
  className = "",
}) => {
  const handleClick = () => {
    onCheckedChange?.(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      onClick={handleClick}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={() => {}} // Controlled by onClick
        className="absolute opacity-0 w-4 h-4 cursor-pointer"
        tabIndex={-1}
      />
      <div
        className={`h-4 w-4 rounded-sm border-2 cursor-pointer flex items-center justify-center transition-all duration-200 ${
          checked
            ? "bg-blue-600 border-blue-600 shadow-sm"
            : "bg-white border-gray-300 hover:border-blue-400 hover:shadow-sm"
        }`}
        tabIndex={0}
        role="checkbox"
        aria-checked={checked}
        onKeyDown={handleKeyDown}
      >
        {checked && (
          <Check className="h-3 w-3 text-white stroke-[3]" />
        )}
      </div>
    </div>
  );
};
