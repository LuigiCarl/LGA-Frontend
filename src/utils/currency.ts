/**
 * Format amount with Philippine Peso currency symbol
 * @param amount - The amount to format
 * @param showSign - Whether to show +/- sign for income/expense
 * @param type - Type of transaction (income/expense)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string,
  showSign: boolean = false,
  type?: "income" | "expense"
): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  const absAmount = Math.abs(numAmount);
  const formattedAmount = absAmount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (showSign && type) {
    const sign = type === "income" ? "+" : "-";
    return `${sign}₱${formattedAmount}`;
  }

  return `₱${formattedAmount}`;
}
