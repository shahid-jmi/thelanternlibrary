import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Loader2, UserRound } from 'lucide-react';
import { getErrorMessage } from '@/app/api/client';
import {
  requestCustomerPasswordReset,
  resetCustomerPassword,
  verifyEmail,
} from '@/app/api/customer';
import { useCustomer } from '@/app/auth/CustomerContext';
import { safeNext } from '@/app/auth/RequireCustomer';
import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateRequired,
} from '@/app/lib/validation';
import { useValidatedField } from '@/app/lib/useValidatedField';
import PageFrame from '@/app/components/PageFrame';
import StatusMessage from '@/app/components/StatusMessage';
import Loader from '@/app/components/Loader';
import { FieldInput } from '@/app/components/FormField';

function AuthCard({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <PageFrame compact>
      <div className="mx-auto max-w-md">
        <div className="rounded-sm border border-border bg-card p-8">
          <div className="mb-6 flex items-center gap-3">
            <UserRound className="h-5 w-5 text-[var(--icon-color)]" />
            <h1 className="text-3xl tracking-[0.05em]">{title}</h1>
          </div>
          {children}
        </div>
        {footer && <div className="mt-4 text-center text-sm opacity-80">{footer}</div>}
      </div>
    </PageFrame>
  );
}

function SubmitButton({ submitting, children }: { submitting: boolean; children: ReactNode }) {
  return (
    <button
      disabled={submitting}
      className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-primary text-sm text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
    >
      {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

// Signed-in visitors don't need the sign-in / sign-up pages.
function useRedirectIfSignedIn(next: string) {
  const { isSignedIn } = useCustomer();
  const navigate = useNavigate();
  useEffect(() => {
    if (isSignedIn) navigate(next, { replace: true });
  }, [isSignedIn, navigate, next]);
}

export function CustomerLoginPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get('next'));
  const { login } = useCustomer();
  const navigate = useNavigate();
  const email = useValidatedField(validateEmail);
  const password = useValidatedField(validateRequired);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  useRedirectIfSignedIn(next);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if ([email.validateNow(), password.validateNow()].some(Boolean)) return;
    setSubmitting(true);
    setError('');
    try {
      await login(email.value.trim(), password.value);
      navigate(next, { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  const nextQuery = next !== '/account' ? `?next=${encodeURIComponent(next)}` : '';

  return (
    <AuthCard
      title={t('account.signIn')}
      footer={
        <>
          {t('account.noAccount')}{' '}
          <Link to={`/account/register${nextQuery}`} className="text-ember hover:opacity-80">
            {t('account.createAccount')}
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        <FieldInput
          id="customer-email"
          type="email"
          autoComplete="email"
          label={t('account.email')}
          value={email.value}
          onChange={email.onChange}
          onBlur={email.onBlur}
          error={email.error ? t(email.error) : undefined}
        />
        <FieldInput
          id="customer-password"
          type="password"
          autoComplete="current-password"
          label={t('account.password')}
          value={password.value}
          onChange={password.onChange}
          onBlur={password.onBlur}
          error={password.error ? t(password.error) : undefined}
        />
        <Link
          to="/account/forgot-password"
          className="-mt-2 mb-4 inline-block text-sm text-ember hover:opacity-80"
        >
          {t('account.forgotPassword')}
        </Link>
        {error && <StatusMessage tone="error">{error}</StatusMessage>}
        <SubmitButton submitting={submitting}>{t('account.signIn')}</SubmitButton>
      </form>
    </AuthCard>
  );
}

export function CustomerRegisterPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get('next'));
  const { register } = useCustomer();
  const navigate = useNavigate();
  const name = useValidatedField(validateRequired);
  const email = useValidatedField(validateEmail);
  const [phone, setPhone] = useState('');
  const password = useValidatedField(validatePassword);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  useRedirectIfSignedIn(next);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if ([name.validateNow(), email.validateNow(), password.validateNow()].some(Boolean)) return;
    setSubmitting(true);
    setError('');
    try {
      await register({
        name: name.value.trim(),
        email: email.value.trim(),
        phone: phone.trim(),
        password: password.value,
      });
      navigate(next, { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  const nextQuery = next !== '/account' ? `?next=${encodeURIComponent(next)}` : '';

  return (
    <AuthCard
      title={t('account.createAccount')}
      footer={
        <>
          {t('account.haveAccount')}{' '}
          <Link to={`/account/login${nextQuery}`} className="text-ember hover:opacity-80">
            {t('account.signIn')}
          </Link>
        </>
      }
    >
      <p className="-mt-2 mb-5 text-sm opacity-70">{t('account.registerIntro')}</p>
      <form onSubmit={submit} noValidate>
        <FieldInput
          id="register-name"
          autoComplete="name"
          label={t('order.name')}
          value={name.value}
          onChange={name.onChange}
          onBlur={name.onBlur}
          error={name.error ? t(name.error) : undefined}
        />
        <FieldInput
          id="register-email"
          type="email"
          autoComplete="email"
          label={t('account.email')}
          value={email.value}
          onChange={email.onChange}
          onBlur={email.onBlur}
          error={email.error ? t(email.error) : undefined}
        />
        <FieldInput
          id="register-phone"
          autoComplete="tel"
          label={t('account.phoneOptional')}
          value={phone}
          onChange={setPhone}
        />
        <FieldInput
          id="register-password"
          type="password"
          autoComplete="new-password"
          label={t('account.password')}
          hint={t('account.passwordHint')}
          value={password.value}
          onChange={password.onChange}
          onBlur={password.onBlur}
          error={password.error ? t(password.error) : undefined}
        />
        {error && <StatusMessage tone="error">{error}</StatusMessage>}
        <SubmitButton submitting={submitting}>{t('account.createAccount')}</SubmitButton>
      </form>
    </AuthCard>
  );
}

export function CustomerForgotPasswordPage() {
  const { t } = useTranslation();
  const email = useValidatedField(validateEmail);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (email.validateNow()) return;
    setSubmitting(true);
    setError('');
    try {
      await requestCustomerPasswordReset(email.value.trim());
      setSent(true);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={t('account.forgotPassword')}
      footer={
        <Link to="/account/login" className="text-ember hover:opacity-80">
          {t('account.backToSignIn')}
        </Link>
      }
    >
      {sent ? (
        <StatusMessage>{t('account.resetSent')}</StatusMessage>
      ) : (
        <form onSubmit={submit} noValidate>
          <p className="-mt-2 mb-5 text-sm opacity-70">{t('account.forgotIntro')}</p>
          <FieldInput
            id="forgot-email"
            type="email"
            autoComplete="email"
            label={t('account.email')}
            value={email.value}
            onChange={email.onChange}
            onBlur={email.onBlur}
            error={email.error ? t(email.error) : undefined}
          />
          {error && <StatusMessage tone="error">{error}</StatusMessage>}
          <SubmitButton submitting={submitting}>{t('account.sendResetLink')}</SubmitButton>
        </form>
      )}
    </AuthCard>
  );
}

// Reads the one-time token from the link, then removes it from the address
// bar so it doesn't linger in history or leak via the Referer header.
function useOneTimeToken(): string | null {
  const [searchParams, setSearchParams] = useSearchParams();
  const [token] = useState(() => searchParams.get('token'));
  useEffect(() => {
    if (searchParams.has('token')) setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);
  return token;
}

export function CustomerResetPasswordPage() {
  const { t } = useTranslation();
  const token = useOneTimeToken();
  const newPassword = useValidatedField(validatePassword);
  const confirmPassword = useValidatedField(validateConfirmPassword(newPassword.value));
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if ([newPassword.validateNow(), confirmPassword.validateNow()].some(Boolean) || !token) return;
    setSubmitting(true);
    setError('');
    try {
      await resetCustomerPassword(token, newPassword.value);
      setDone(true);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={t('account.setNewPassword')}
      footer={
        <Link to="/account/login" className="text-ember hover:opacity-80">
          {t('account.backToSignIn')}
        </Link>
      }
    >
      {!token ? (
        <StatusMessage tone="error">{t('account.linkInvalid')}</StatusMessage>
      ) : done ? (
        <StatusMessage>{t('account.passwordUpdated')}</StatusMessage>
      ) : (
        <form onSubmit={submit} noValidate>
          <FieldInput
            id="reset-password"
            type="password"
            autoComplete="new-password"
            label={t('account.newPassword')}
            hint={t('account.passwordHint')}
            value={newPassword.value}
            onChange={newPassword.onChange}
            onBlur={newPassword.onBlur}
            error={newPassword.error ? t(newPassword.error) : undefined}
          />
          <FieldInput
            id="reset-confirm"
            type="password"
            autoComplete="new-password"
            label={t('account.confirmPassword')}
            value={confirmPassword.value}
            onChange={confirmPassword.onChange}
            onBlur={confirmPassword.onBlur}
            error={confirmPassword.error ? t(confirmPassword.error) : undefined}
          />
          {error && <StatusMessage tone="error">{error}</StatusMessage>}
          <SubmitButton submitting={submitting}>{t('account.setNewPassword')}</SubmitButton>
        </form>
      )}
    </AuthCard>
  );
}

export function VerifyEmailPage() {
  const { t } = useTranslation();
  const token = useOneTimeToken();
  const { customer, setCustomer } = useCustomer();
  const [state, setState] = useState<'working' | 'done' | 'failed'>(token ? 'working' : 'failed');
  const [error, setError] = useState('');
  const started = useRef(false);

  useEffect(() => {
    // The token is single-use, so make sure it's only sent once (React's
    // development double-render would otherwise spend it twice).
    if (!token || started.current) return;
    started.current = true;
    verifyEmail(token)
      .then((verified) => {
        if (customer && customer._id === verified._id) setCustomer(verified);
        setState('done');
      })
      .catch((requestError: unknown) => {
        setError(getErrorMessage(requestError));
        setState('failed');
      });
  }, [token, customer, setCustomer]);

  return (
    <AuthCard title={t('account.verifyTitle')}>
      {state === 'working' && <Loader />}
      {state === 'done' && (
        <div className="space-y-4">
          <p className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-ember" />
            {t('account.verified')}
          </p>
          <Link
            to={customer ? '/account' : '/account/login'}
            className="inline-flex h-11 items-center rounded-sm bg-primary px-6 text-sm text-primary-foreground hover:opacity-90"
          >
            {customer ? t('account.goToAccount') : t('account.signIn')}
          </Link>
        </div>
      )}
      {state === 'failed' && (
        <StatusMessage tone="error">{error || t('account.linkInvalid')}</StatusMessage>
      )}
    </AuthCard>
  );
}
