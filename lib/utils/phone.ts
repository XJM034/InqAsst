const MOBILE_PHONE_RE = /^1\d{10}$/;
const MASKED_MOBILE_PHONE_RE = /^1\d{2}\*{4}\d{4}$/;

export function normalizePhoneForDisplay(phone?: string | null) {
  const value = phone?.trim();
  if (!value) {
    return null;
  }

  if (value.startsWith("ext_")) {
    return null;
  }

  if (MOBILE_PHONE_RE.test(value) || MASKED_MOBILE_PHONE_RE.test(value)) {
    return value;
  }

  return null;
}

export function formatTeacherLabel(name?: string | null, phone?: string | null) {
  const safeName = name?.trim();
  const safePhone = normalizePhoneForDisplay(phone);

  if (safeName && safePhone) {
    return `${safeName} \u00b7 ${safePhone}`;
  }

  return safeName ?? safePhone ?? "\u5f85\u5206\u914d\u8001\u5e08";
}