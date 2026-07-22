/**
 * Centralized utility for user authorization and access control.
 * Controls which emails are allowed to register, log in, or request password resets.
 */

/**
 * Returns a list of authorized emails parsed from the environment.
 */
function getAuthorizedEmails(): string[] {
  const emailsEnv = process.env.AUTHORIZED_EMAILS || process.env.ALLOWED_REGISTRATION_EMAILS || '';
  if (!emailsEnv) {
    return [];
  }
  return emailsEnv
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
}

/**
 * Checks if registration mode is set to public (unrestricted).
 */
export function isPublicRegistrationEnabled(): boolean {
  const allowPublic = process.env.ALLOW_PUBLIC_REGISTRATION;
  if (allowPublic === 'false') {
    return false;
  }
  const regMode = process.env.REGISTRATION_MODE;
  if (regMode === 'restricted') {
    return false;
  }
  return true;
}

/**
 * Check if the given email is authorized to access the system.
 * If public registration is enabled, all emails are considered authorized.
 */
export function isEmailAuthorized(email: string): boolean {
  if (isPublicRegistrationEnabled()) {
    return true;
  }
  
  if (!email) {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const authorizedEmails = getAuthorizedEmails();
  
  return authorizedEmails.includes(normalizedEmail);
}
