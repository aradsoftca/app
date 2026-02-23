/**
 * Unified Password Strength Utility
 * Used by both Register and Account Settings forms for consistent validation.
 */

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  strongLength: 12,
};

/**
 * Check individual password requirements
 * @param {string} password
 * @returns {{ length: boolean, uppercase: boolean, lowercase: boolean, number: boolean, special: boolean }}
 */
export const checkRequirements = (password) => ({
  length: password.length >= PASSWORD_REQUIREMENTS.minLength,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  special: /[^a-zA-Z0-9]/.test(password),
});

/**
 * Calculate numeric password strength score (0-100)
 * @param {string} password
 * @returns {number} strength score 0-100
 */
export const calculateStrength = (password) => {
  if (!password) return 0;
  let strength = 0;
  if (password.length >= PASSWORD_REQUIREMENTS.minLength) strength += 20;
  if (password.length >= PASSWORD_REQUIREMENTS.strongLength) strength += 20;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 20;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
  return strength;
};

/**
 * Get strength label and color
 * @param {number} score
 * @returns {{ label: string, color: string, textColor: string }}
 */
export const getStrengthInfo = (score) => {
  if (score <= 20) return { label: 'Very Weak', color: 'bg-red-500', textColor: 'text-red-400' };
  if (score <= 40) return { label: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-400' };
  if (score <= 60) return { label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-400' };
  if (score <= 80) return { label: 'Strong', color: 'bg-blue-500', textColor: 'text-blue-400' };
  return { label: 'Very Strong', color: 'bg-green-500', textColor: 'text-green-400' };
};

/**
 * Check if password meets minimum requirements
 * @param {string} password
 * @returns {boolean}
 */
export const isPasswordValid = (password) => {
  const reqs = checkRequirements(password);
  return reqs.length && reqs.uppercase && reqs.lowercase && reqs.number;
};
