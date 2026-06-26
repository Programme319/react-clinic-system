export default function InputLabel({ value, className = '', children }) {
  return (
    <label className={`block text-sm font-semibold text-slate-700 ${className}`}>
      {value ?? children}
    </label>
  );
}
