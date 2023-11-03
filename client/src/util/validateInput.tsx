export function isValidEmail(email: string) {
  // Regular expression for email validation

  const DISPOSABLE_EMAIL_DOMAINS = ['trashmail.com', 'zamaneta.com'];

  const emailPattern =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  const trimmedEmail = email.trim().toLowerCase();

  // Check if the email format is valid
  if (!emailPattern.test(trimmedEmail)) {
    return false;
  }

  // Extract the domain part of the email address
  const domain = email.split('@')[1];

  // Check if the domain is in the list of disposable email domains
  if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    return false;
  }

  return true;
}
