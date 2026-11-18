import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  ChevronRight,
  LogOut,
  MailWarning,
  MapPin,
  Package,
  Pencil,
  Trash2,
  UserRound,
} from 'lucide-react';
import { getErrorMessage } from '@/app/api/client';
import {
  addAddress,
  changeCustomerPassword,
  deleteAddress,
  getMyOrders,
  resendVerification,
  updateAddress,
  updateProfile,
} from '@/app/api/customer';
import { INDIAN_STATES, type CustomerAddress, type CustomerAddressInput } from '@/app/api/types';
import { customerKeys, useCustomer } from '@/app/auth/CustomerContext';
import { formatPrice } from '@/app/lib/format';
import { cn } from '@/app/lib/cn';
import {
  validateConfirmPassword,
  validatePassword,
  validatePincode,
  validateRequired,
} from '@/app/lib/validation';
import { useValidatedField } from '@/app/lib/useValidatedField';
import PageFrame from '@/app/components/PageFrame';
import StatusMessage from '@/app/components/StatusMessage';
import Loader from '@/app/components/Loader';
import { FieldInput, FieldSelect, FieldTextArea } from '@/app/components/FormField';
import { Button } from '@/app/components/ui';

const TABS = ['orders', 'addresses', 'profile'] as const;
type AccountTab = (typeof TABS)[number];

export default function AccountPage() {
  const { t } = useTranslation();
  const { customer, logout } = useCustomer();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as AccountTab | null;
  const tab: AccountTab = tabParam && TABS.includes(tabParam) ? tabParam : 'orders';

  if (!customer) return null;

  const icons = { orders: Package, addresses: MapPin, profile: UserRound };

  return (
    <PageFrame>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl tracking-[0.05em]">{t('account.title')}</h1>
          <p className="mt-1 opacity-70">
            {customer.name} · {customer.email}
          </p>
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut className="h-4 w-4" />
          {t('account.signOut')}
        </Button>
      </div>

      {!customer.emailVerified && <VerifyBanner />}

      <div className="mb-8 flex flex-wrap gap-2" role="tablist">
        {TABS.map((item) => {
          const Icon = icons[item];
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={tab === item}
              onClick={() => setSearchParams({ tab: item })}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition',
                tab === item
                  ? 'border-ember bg-ember/10 text-ember'
                  : 'border-border opacity-70 hover:opacity-100'
              )}
            >
              <Icon className="h-4 w-4" />
              {t(`account.tab.${item}`)}
            </button>
          );
        })}
      </div>

      {tab === 'orders' && <OrdersTab />}
      {tab === 'addresses' && <AddressesTab addresses={customer.addresses} />}
      {tab === 'profile' && <ProfileTab />}
    </PageFrame>
  );
}

function VerifyBanner() {
  const { t } = useTranslation();
  const resend = useMutation({ mutationFn: resendVerification });
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-sm border border-amber-500/40 bg-amber-500/10 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span className="flex items-center gap-2">
        <MailWarning className="h-4 w-4 shrink-0" />
        {t('account.verifyBanner')}
      </span>
      {resend.isSuccess ? (
        <span className="opacity-80">{t('account.verificationSent')}</span>
      ) : (
        <Button
          variant="outline"
          size="sm"
          loading={resend.isPending}
          onClick={() => resend.mutate()}
        >
          {t('account.resendVerification')}
        </Button>
      )}
    </div>
  );
}

function OrdersTab() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const ordersQuery = useQuery({
    queryKey: customerKeys.orders(page),
    queryFn: () => getMyOrders(page),
  });

  if (ordersQuery.isPending) return <Loader />;
  if (ordersQuery.isError) {
    return <StatusMessage tone="error">{getErrorMessage(ordersQuery.error)}</StatusMessage>;
  }

  const { orders, total, pageSize } = ordersQuery.data;
  if (orders.length === 0) {
    return (
      <StatusMessage>
        {t('account.noOrders')}{' '}
        <Link to="/catalog" className="text-ember">
          {t('cart.browse')}
        </Link>
      </StatusMessage>
    );
  }

  return (
    <div>
      <ul className="divide-y divide-border rounded-sm border border-border bg-card">
        {orders.map((order) => (
          <li key={order._id}>
            <Link
              to={`/account/orders/${order._id}`}
              className="flex items-center justify-between gap-4 p-4 transition hover:bg-secondary"
            >
              <div className="min-w-0">
                <p>
                  {order.orderNumber}
                  <span className="ml-2 text-sm opacity-60">
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </p>
                <p className="truncate text-sm opacity-70">
                  {order.items.map((item) => `${item.quantity} × ${item.title}`).join(', ')}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-right">
                <div>
                  <p>{formatPrice(order.total)}</p>
                  <p className="text-xs text-ember">{t(`account.orderStatus.${order.status}`)}</p>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {total > pageSize && (
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            {t('admin.orders.previous')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page * pageSize >= total}
            onClick={() => setPage(page + 1)}
          >
            {t('admin.orders.next')}
          </Button>
        </div>
      )}
    </div>
  );
}

const EMPTY_ADDRESS: CustomerAddressInput = {
  label: '',
  name: '',
  phone: '',
  altPhone: '',
  addressLine: '',
  locality: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
};

function AddressesTab({ addresses }: { addresses: CustomerAddress[] }) {
  const { t } = useTranslation();
  const { setCustomer } = useCustomer();
  const [editing, setEditing] = useState<CustomerAddress | 'new' | null>(null);
  const [error, setError] = useState('');
  const remove = useMutation({
    mutationFn: deleteAddress,
    onSuccess: setCustomer,
    onError: (requestError) => setError(getErrorMessage(requestError)),
  });
  const makeDefault = useMutation({
    mutationFn: (address: CustomerAddress) =>
      updateAddress(address._id, { ...address, isDefault: true }),
    onSuccess: setCustomer,
    onError: (requestError) => setError(getErrorMessage(requestError)),
  });

  if (editing) {
    return (
      <AddressForm
        initial={editing === 'new' ? EMPTY_ADDRESS : editing}
        addressId={editing === 'new' ? null : editing._id}
        onDone={() => setEditing(null)}
      />
    );
  }

  return (
    <div>
      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {addresses.length === 0 && <StatusMessage>{t('account.noAddresses')}</StatusMessage>}
      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          <div key={address._id} className="rounded-sm border border-border bg-card p-4 text-sm">
            <div className="mb-2 flex items-center gap-2">
              <span className="font-medium">{address.label || address.name}</span>
              {address.isDefault && (
                <span className="rounded-full bg-ember/15 px-2 py-0.5 text-xs text-ember">
                  {t('account.default')}
                </span>
              )}
            </div>
            <p>{address.name}</p>
            <p className="opacity-80">
              {address.addressLine}, {address.locality}, {address.city}, {address.state} -{' '}
              {address.pincode}
            </p>
            <p className="opacity-80">{address.phone}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(address)}>
                <Pencil className="h-4 w-4" />
                {t('account.edit')}
              </Button>
              {!address.isDefault && (
                <Button
                  variant="outline"
                  size="sm"
                  loading={makeDefault.isPending && makeDefault.variables?._id === address._id}
                  onClick={() => makeDefault.mutate(address)}
                >
                  {t('account.makeDefault')}
                </Button>
              )}
              <Button
                variant="destructive-outline"
                size="sm"
                loading={remove.isPending && remove.variables === address._id}
                onClick={() => remove.mutate(address._id)}
              >
                <Trash2 className="h-4 w-4" />
                {t('cart.remove')}
              </Button>
            </div>
          </div>
        ))}
      </div>
      {addresses.length < 10 && (
        <Button className="mt-6" onClick={() => setEditing('new')}>
          {t('account.addAddress')}
        </Button>
      )}
    </div>
  );
}

function AddressForm({
  initial,
  addressId,
  onDone,
}: {
  initial: CustomerAddressInput;
  addressId: string | null;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const { setCustomer } = useCustomer();
  const [label, setLabel] = useState(initial.label);
  const name = useValidatedField(validateRequired, initial.name);
  const phone = useValidatedField(validateRequired, initial.phone);
  const [altPhone, setAltPhone] = useState(initial.altPhone);
  const addressLine = useValidatedField(validateRequired, initial.addressLine);
  const locality = useValidatedField(validateRequired, initial.locality);
  const city = useValidatedField(validateRequired, initial.city);
  const state = useValidatedField(validateRequired, initial.state);
  const pincode = useValidatedField(validatePincode, initial.pincode);
  const [isDefault, setIsDefault] = useState(initial.isDefault);
  const [error, setError] = useState('');
  const save = useMutation({
    mutationFn: (payload: CustomerAddressInput) =>
      addressId ? updateAddress(addressId, payload) : addAddress(payload),
    onSuccess: (customer) => {
      setCustomer(customer);
      onDone();
    },
    onError: (requestError) => setError(getErrorMessage(requestError)),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const fields = [name, phone, addressLine, locality, city, state, pincode];
    if (fields.map((field) => field.validateNow()).some(Boolean)) return;
    save.mutate({
      label: label.trim(),
      name: name.value.trim(),
      phone: phone.value.trim(),
      altPhone: altPhone.trim(),
      addressLine: addressLine.value.trim(),
      locality: locality.value.trim(),
      city: city.value.trim(),
      state: state.value,
      pincode: pincode.value.trim(),
      isDefault,
    });
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      className="max-w-2xl rounded-sm border border-border bg-card p-6"
    >
      <h2 className="mb-5 text-lg tracking-[0.05em]">
        {addressId ? t('account.editAddress') : t('account.addAddress')}
      </h2>
      <FieldInput
        id="address-label"
        label={t('account.addressLabel')}
        hint={t('account.addressLabelHint')}
        value={label}
        onChange={setLabel}
      />
      <div className="grid gap-x-4 sm:grid-cols-2">
        <FieldInput
          id="address-name"
          label={t('order.name')}
          value={name.value}
          onChange={name.onChange}
          onBlur={name.onBlur}
          error={name.error ? t(name.error) : undefined}
        />
        <FieldInput
          id="address-phone"
          label={t('order.phone')}
          value={phone.value}
          onChange={phone.onChange}
          onBlur={phone.onBlur}
          error={phone.error ? t(phone.error) : undefined}
        />
      </div>
      <FieldInput
        id="address-alt-phone"
        label={t('order.altPhone')}
        value={altPhone}
        onChange={setAltPhone}
      />
      <FieldTextArea
        id="address-line"
        label={t('order.addressLine')}
        hint={t('order.addressLineHint')}
        value={addressLine.value}
        onChange={addressLine.onChange}
        onBlur={addressLine.onBlur}
        error={addressLine.error ? t(addressLine.error) : undefined}
      />
      <div className="grid gap-x-4 sm:grid-cols-2">
        <FieldInput
          id="address-locality"
          label={t('order.locality')}
          value={locality.value}
          onChange={locality.onChange}
          onBlur={locality.onBlur}
          error={locality.error ? t(locality.error) : undefined}
        />
        <FieldInput
          id="address-city"
          label={t('order.city')}
          value={city.value}
          onChange={city.onChange}
          onBlur={city.onBlur}
          error={city.error ? t(city.error) : undefined}
        />
        <FieldSelect
          id="address-state"
          label={t('order.state')}
          value={state.value}
          onChange={state.onChange}
          error={state.error ? t(state.error) : undefined}
        >
          <option value="">{t('order.statePlaceholder')}</option>
          {INDIAN_STATES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </FieldSelect>
        <FieldInput
          id="address-pincode"
          label={t('order.pincode')}
          value={pincode.value}
          onChange={pincode.onChange}
          onBlur={pincode.onBlur}
          error={pincode.error ? t(pincode.error) : undefined}
        />
      </div>
      <label className="mb-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(event) => setIsDefault(event.target.checked)}
        />
        {t('account.useAsDefault')}
      </label>
      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      <div className="flex gap-3">
        <Button loading={save.isPending}>{t('admin.form.save')}</Button>
        <Button type="button" variant="outline" onClick={onDone}>
          {t('admin.form.cancel')}
        </Button>
      </div>
    </form>
  );
}

function ProfileTab() {
  const { t } = useTranslation();
  const { customer, setCustomer, applySession } = useCustomer();
  const name = useValidatedField(validateRequired, customer?.name ?? '');
  const [phone, setPhone] = useState(customer?.phone ?? '');
  const [profileMessage, setProfileMessage] = useState('');
  const saveProfile = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      setCustomer(updated);
      setProfileMessage(t('account.saved'));
    },
    onError: (requestError) => setProfileMessage(getErrorMessage(requestError)),
  });

  const currentPassword = useValidatedField(validateRequired);
  const newPassword = useValidatedField(validatePassword);
  const confirmPassword = useValidatedField(validateConfirmPassword(newPassword.value));
  const [passwordMessage, setPasswordMessage] = useState('');
  const changePassword = useMutation({
    mutationFn: () => changeCustomerPassword(currentPassword.value, newPassword.value),
    onSuccess: (session) => {
      applySession(session);
      currentPassword.set('');
      newPassword.set('');
      confirmPassword.set('');
      setPasswordMessage(t('account.passwordChanged'));
    },
    onError: (requestError) => setPasswordMessage(getErrorMessage(requestError)),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (name.validateNow()) return;
          setProfileMessage('');
          saveProfile.mutate({ name: name.value.trim(), phone: phone.trim() });
        }}
        className="rounded-sm border border-border bg-card p-6"
      >
        <h2 className="mb-5 text-lg tracking-[0.05em]">{t('account.details')}</h2>
        <FieldInput
          id="profile-name"
          label={t('order.name')}
          value={name.value}
          onChange={name.onChange}
          onBlur={name.onBlur}
          error={name.error ? t(name.error) : undefined}
        />
        <FieldInput id="profile-phone" label={t('order.phone')} value={phone} onChange={setPhone} />
        <p className="mb-4 text-sm opacity-70">
          {t('account.email')}: {customer?.email}
        </p>
        {profileMessage && <p className="mb-3 text-sm">{profileMessage}</p>}
        <Button loading={saveProfile.isPending}>{t('admin.form.save')}</Button>
      </form>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const errors = [
            currentPassword.validateNow(),
            newPassword.validateNow(),
            confirmPassword.validateNow(),
          ];
          if (errors.some(Boolean)) return;
          setPasswordMessage('');
          changePassword.mutate();
        }}
        className="rounded-sm border border-border bg-card p-6"
      >
        <h2 className="mb-5 text-lg tracking-[0.05em]">{t('account.changePassword')}</h2>
        <FieldInput
          id="profile-current-password"
          type="password"
          autoComplete="current-password"
          label={t('account.currentPassword')}
          value={currentPassword.value}
          onChange={currentPassword.onChange}
          onBlur={currentPassword.onBlur}
          error={currentPassword.error ? t(currentPassword.error) : undefined}
        />
        <FieldInput
          id="profile-new-password"
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
          id="profile-confirm-password"
          type="password"
          autoComplete="new-password"
          label={t('account.confirmPassword')}
          value={confirmPassword.value}
          onChange={confirmPassword.onChange}
          onBlur={confirmPassword.onBlur}
          error={confirmPassword.error ? t(confirmPassword.error) : undefined}
        />
        {passwordMessage && <p className="mb-3 text-sm">{passwordMessage}</p>}
        <Button loading={changePassword.isPending}>{t('account.changePassword')}</Button>
      </form>
    </div>
  );
}
