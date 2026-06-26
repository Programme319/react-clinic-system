import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
  { type = 'text', className = '', isFocused = false, ...props },
  ref,
) {
  const localRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => localRef.current?.focus(),
  }));

  useEffect(() => {
    if (isFocused) localRef.current?.focus();
  }, [isFocused]);

  return (
    <input
      {...props}
      type={type}
      className={`rounded-xl border-slate-200 shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 ${className}`}
      ref={localRef}
    />
  );
});
