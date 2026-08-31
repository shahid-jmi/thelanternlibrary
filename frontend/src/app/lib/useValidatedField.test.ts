import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useValidatedField } from './useValidatedField';

const required = (value: string) => (value.trim() ? undefined : 'validation.required');

describe('useValidatedField', () => {
  it('starts with the given initial value and no error', () => {
    const { result } = renderHook(() => useValidatedField(required, 'hello'));
    expect(result.current.value).toBe('hello');
    expect(result.current.error).toBeUndefined();
  });

  it('does not validate on change while there is no existing error', () => {
    const { result } = renderHook(() => useValidatedField(required));
    act(() => result.current.onChange(''));
    expect(result.current.error).toBeUndefined();
  });

  it('live-clears the error on change while one is showing, but does not bring it back until the next blur', () => {
    const { result } = renderHook(() => useValidatedField(required));
    act(() => result.current.onBlur()); // empty value -> shows the error
    expect(result.current.error).toBe('validation.required');

    // Typing a valid character clears the error immediately (error was truthy).
    act(() => result.current.onChange('a'));
    expect(result.current.error).toBeUndefined();

    // Once cleared, further typing does not re-validate live — avoids
    // flickering the error message on every keystroke. It only reappears
    // on the next onBlur/validateNow.
    act(() => result.current.onChange(''));
    expect(result.current.error).toBeUndefined();

    act(() => result.current.onBlur());
    expect(result.current.error).toBe('validation.required');
  });

  it('validateNow validates immediately and returns the error', () => {
    const { result } = renderHook(() => useValidatedField(required));
    let returned: string | undefined;
    act(() => {
      returned = result.current.validateNow();
    });
    expect(returned).toBe('validation.required');
    expect(result.current.error).toBe('validation.required');
  });
});
