export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  if (!password || password.length < 8) {
    return {
      valid: false,
      error: 'Password must be at least 8 characters long'
    };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return {
      valid: false,
      error: 'Password must contain uppercase, lowercase, and numbers'
    };
  }

  return { valid: true };
}

export function validatePoints(points) {
  const pointsNum = parseInt(points);
  if (isNaN(pointsNum) || pointsNum < 0) {
    return {
      valid: false,
      error: 'Points must be a positive number'
    };
  }
  return { valid: true };
}

export function validateDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      valid: false,
      error: 'Invalid date format'
    };
  }

  if (end < start) {
    return {
      valid: false,
      error: 'End date must be after start date'
    };
  }

  return { valid: true };
}