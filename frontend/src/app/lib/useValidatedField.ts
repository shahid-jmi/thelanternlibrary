import { useState } from 'react';

export function useValidatedField<TErrorKey extends string>(
  validate: (value: string) => TErrorKey | undefined,
  initialValue = ''
) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<TErrorKey | undefined>(undefined);

  const onChange = (next: string) => {
    setValue(next);
    setError((previous) => (previous ? validate(next) : previous));
  };

  const onBlur = () => setError(validate(value));

  const validateNow = () => {
    const result = validate(value);
    setError(result);
    return result;
  };

  // Replaces the value programmatically (e.g. filling in a saved address)
  // and clears any error shown for the old value.
  const set = (next: string) => {
    setValue(next);
    setError(undefined);
  };

  return { value, error, onChange, onBlur, validateNow, set };
}
