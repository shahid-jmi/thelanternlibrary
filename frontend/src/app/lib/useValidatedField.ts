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

  return { value, error, onChange, onBlur, validateNow };
}
