// Authorized admin emails
// Only these emails can access the admin panel
export const ADMIN_EMAILS = [
  'admin@shoretodoor.uk',
  // Add more admin emails here as needed
  // 'another-admin@shoretodoor.uk',
];

export const isAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
