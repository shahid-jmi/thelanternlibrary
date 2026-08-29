import { getErrorMessage } from '@/app/api/client';

interface MutateAsync {
  mutateAsync: (id: string) => Promise<unknown>;
}

/**
 * The confirm -> delete -> report-error ceremony repeated identically across
 * every admin resource panel (books, products, categories, admins). Wraps a
 * delete mutation with the confirm dialog and error-message plumbing so each
 * panel only supplies the mutation, the confirm prompt, and where to put the
 * error.
 */
export function useConfirmedDelete(
  deleteMutation: MutateAsync,
  confirm: (message: string) => Promise<boolean>,
  setError: (message: string) => void
) {
  return async (id: string, confirmMessage: string) => {
    if (!(await confirm(confirmMessage))) return;
    try {
      await deleteMutation.mutateAsync(id);
      setError('');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };
}
