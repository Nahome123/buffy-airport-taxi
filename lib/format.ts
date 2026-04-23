const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatCurrencyFromCents(amount: number) {
  return currencyFormatter.format(amount / 100);
}

export function formatPickupDate(date: Date | string) {
  return dateTimeFormatter.format(new Date(date));
}
