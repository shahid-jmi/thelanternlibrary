import { useState } from 'react';
import type { FieldErrorKey } from './validation';

export function useValidatedField(
  validate: (value: string) => FieldErrorKey | undefined,
  initialValue = ''
) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<FieldErrorKey | undefined>(undefined);

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

  return { value, error, onChange, onBlur, validateNow };
}
