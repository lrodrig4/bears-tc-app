
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: (string | Option)[]; // Accepts ["A", "B"] or [{label: "A", value: "a"}]
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder = "Select...", 
  icon,
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Normalizing options
  const formattedOptions: Option[] = options.map(opt => 
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  const selectedOption = formattedOptions.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-1.5">
          {icon}
          {label}
        </label>
      )}
      
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 bg-white border rounded-xl text-sm font-medium transition-all duration-200
          ${isOpen 
            ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md' 
            : 'border-slate-200 hover:border-brand-300 shadow-sm'
          }
          ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'text-slate-800'}
        `}
      >
        <span className={`truncate ${!selectedOption ? 'text-slate-400' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-500' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="p-1">
            {formattedOptions.length > 0 ? (
                formattedOptions.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors text-left mb-0.5
                    ${opt.value === value 
                        ? 'bg-brand-50 text-brand-700 font-bold' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                    `}
                >
                    <span>{opt.label}</span>
                    {opt.value === value && <Check className="w-3.5 h-3.5" />}
                </button>
                ))
            ) : (
                <div className="px-3 py-4 text-center text-xs text-slate-400">No options available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
