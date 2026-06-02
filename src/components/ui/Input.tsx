interface InputProps {
  label?:       string;
  value:        string;
  onChange:     (v: string) => void;
  type?:        string;
  placeholder?: string;
  required?:    boolean;
  className?:   string;
  disabled?:    boolean;
  hint?:        string;
}

export function Input({
  label, value, onChange, type = 'text',
  placeholder = '', required = false, className = '',
  disabled = false, hint,
}: InputProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="text-red-500 ml-0.5 normal-case font-normal"> *</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="input-base"
      />
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}
