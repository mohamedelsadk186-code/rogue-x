/** User-facing message when register/login API calls fail */
export function authRequestErrorMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { error?: string } }; code?: string; message?: string }
  if (e?.response?.data?.error) return e.response.data.error
  if (!e?.response) {
    return (
      'تعذّر الاتصال بالخادم. في Render: عيِّن VITE_API_URL لرابط الـ API كاملاً (مثل https://your-api.onrender.com/api) ثم أعد نشر الواجهة. ' +
      'وعلى خدمة الـ API عيِّن CLIENT_ORIGINS ليشمل رابط موقعك.'
    )
  }
  return fallback
}
