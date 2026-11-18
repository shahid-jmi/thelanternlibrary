// The customer session is kept apart from the admin one, so a shop admin can
// also browse and order as a customer in the same browser.
const CUSTOMER_TOKEN_KEY = 'lantern-customer-token';

// Storage can be unavailable (private mode, blocked site data); the customer
// then just stays signed in for this page view.
let memoryToken: string | null = null;

export function getCustomerToken(): string | null {
  try {
    return localStorage.getItem(CUSTOMER_TOKEN_KEY) ?? memoryToken;
  } catch {
    return memoryToken;
  }
}

export function setCustomerToken(token: string): void {
  memoryToken = token;
  try {
    localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  } catch {
    // Keep the in-memory copy.
  }
}

export function clearCustomerToken(): void {
  memoryToken = null;
  try {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  } catch {
    // Nothing stored.
  }
}
