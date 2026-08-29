import { describe, expect, it, vi } from 'vitest';
import { useConfirmedDelete } from './useConfirmedDelete';

describe('useConfirmedDelete', () => {
  it('does not call the mutation when the user declines the confirmation', async () => {
    const mutateAsync = vi.fn();
    const confirm = vi.fn().mockResolvedValue(false);
    const setError = vi.fn();

    const del = useConfirmedDelete({ mutateAsync }, confirm, setError);
    await del('id-1', 'Delete this?');

    expect(confirm).toHaveBeenCalledWith('Delete this?');
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(setError).not.toHaveBeenCalled();
  });

  it('deletes and clears the error when confirmed and the mutation succeeds', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    const confirm = vi.fn().mockResolvedValue(true);
    const setError = vi.fn();

    const del = useConfirmedDelete({ mutateAsync }, confirm, setError);
    await del('id-1', 'Delete this?');

    expect(mutateAsync).toHaveBeenCalledWith('id-1');
    expect(setError).toHaveBeenCalledWith('');
  });

  it('reports the error message when the mutation fails', async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error('boom'));
    const confirm = vi.fn().mockResolvedValue(true);
    const setError = vi.fn();

    const del = useConfirmedDelete({ mutateAsync }, confirm, setError);
    await del('id-1', 'Delete this?');

    expect(setError).toHaveBeenCalledWith('boom');
  });
});
