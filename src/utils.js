export const formatDate = (dateString) => {
  if (!dateString) {
    return "";
  }
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Validates if a token has the correct JWT format
 * @param {string} token - The token to validate
 * @returns {boolean} - True if token format is valid
 */
export const isValidTokenFormat = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

/**
 * Safely parses a JWT token payload
 * @param {string} token - The JWT token to parse
 * @returns {object|null} - Parsed payload or null if invalid
 */
export const parseJWTPayload = (token) => {
  try {
    if (!isValidTokenFormat(token)) {
      throw new Error('Invalid token format');
    }

    const payload = token.split('.')[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Token parsing error:', error.message);
    return null;
  }
};

/**
 * Checks if a JWT token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} - True if token is expired
 */
export const isTokenExpired = (token) => {
  const payload = parseJWTPayload(token);
  if (!payload || !payload.exp) {
    return true;
  }
  
  return payload.exp * 1000 < Date.now();
};

/**
 * Clears all authentication-related data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('refreshToken');
  console.log('Authentication data cleared from localStorage');
};

/**
 * Gets the current user from a valid token
 * @returns {object|null} - User data or null if no valid token
 */
export const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }
  
  if (isTokenExpired(token)) {
    console.warn('Token has expired, clearing auth data');
    clearAuthData();
    return null;
  }
  
  return parseJWTPayload(token);
};
