export function formatPrice(price: number): string {
  return `Rs ${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(price)}`;
}
