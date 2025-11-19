import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option { label: string; value: string; }
interface SelectProps { label?: string; value: string; onChange: (value: string) => void; options: (string | Option)[]; placeholder?: string; icon?: React.ReactNode; className?: string; disabled?: boolean; }

const Select: React.FC<SelectProps> = ({ label, value, onChange, options, placeholder = "Select...", icon, className = "", disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const h = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
  const formattedOptions: Option[] = options.map(opt => typeof opt === 'string' ? { label: opt, value: opt } : opt);
  const selectedOption = formattedOptions.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-1.5">{icon}{label}</label>}
      <button type="button" disabled={disabled} onClick={() => setIsOpen(!isOpen)} className={`w-full flex items-center justify-between p-3 bg-white border rounded-xl text-sm font-medium transition-all ${isOpen ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200'}`}><span className={`truncate ${!selectedOption ? 'text-slate-400' : ''}`}>{selectedOption ? selectedOption.label : placeholder}</span><ChevronDown className={`w-4 h-4 ${isOpen ? 'rotate-180' : ''}`} /></button>
      {isOpen && !disabled && (<div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto"><div className="p-1">{formattedOptions.map((opt) => (<button key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg text-left mb-0.5 ${opt.value === value ? 'bg-brand-50 text-brand-700 font-bold' : 'hover:bg-slate-50'}`}><span>{opt.label}</span>{opt.value === value && <Check className="w-3.5 h-3.5" />}</button>))}</div></div>)}
    </div>
  );
};
export default Select;