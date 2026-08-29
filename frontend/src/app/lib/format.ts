export function formatPrice(price: number): string {
  // INR is conventionally shown as whole rupees, not with cents-style decimals.
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(price)}`;
}
