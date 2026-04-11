export const JWT_SECRET =
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
// 15 minutes in seconds
export const JWT_EXPIRY = process.env.JWT_EXPIRY
  ? parseInt(process.env.JWT_EXPIRY)
  : 900;
// 7 days in seconds
export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY
  ? parseInt(process.env.REFRESH_TOKEN_EXPIRY)
  : 604800;
