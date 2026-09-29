// This utility is kept for backward compatibility.
// Use ToastService (services/toast.service.ts) directly for new code.
export function showToast(message: string): void {
  // No-op: replaced by ToastService globally
  console.log('[Toast]', message);
}
