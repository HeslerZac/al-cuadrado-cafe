export const formatQuetzales = (value: number | string | null | undefined) => {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
  }).format(amount);
};
