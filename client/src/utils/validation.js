const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  if (!email.trim()) return 'Email is required.';
  if (!EMAIL_REGEX.test(email.trim())) return 'Enter a valid email address.';
  return null;
}

export function validateRequired(value, label) {
  if (!value.trim()) return `${label} is required.`;
  return null;
}

export function validatePassword(password) {
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return 'Please confirm your password.';
  if (password !== confirmPassword) return 'Passwords do not match.';
  return null;
}

export function validateOtp(otp) {
  if (!otp.trim()) return 'Enter the 6-digit code.';
  if (!/^\d{6}$/.test(otp.trim())) return 'Code must be 6 digits.';
  return null;
}
