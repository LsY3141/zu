export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  // 비밀번호는 최소 8자, 최소 하나의 문자, 하나의 숫자 및 하나의 특수 문자를 포함해야 함
  const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return re.test(password);
};

export const validatePasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== '';
};

export const validateMinLength = (value, minLength) => {
  return value && value.length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  return value && value.length <= maxLength;
};

export const validateFormField = (field, value, rules) => {
  let error = null;
  
  if (rules.required && !validateRequired(value)) {
    error = `${field}은(는) 필수 입력 항목입니다.`;
  } else if (rules.email && !validateEmail(value)) {
    error = '유효한 이메일 주소를 입력해주세요.';
  } else if (rules.password && !validatePassword(value)) {
    error = '비밀번호는 8자 이상, 문자, 숫자, 특수문자를 포함해야 합니다.';
  } else if (rules.minLength && !validateMinLength(value, rules.minLength)) {
    error = `${field}은(는) 최소 ${rules.minLength}자 이상이어야 합니다.`;
  } else if (rules.maxLength && !validateMaxLength(value, rules.maxLength)) {
    error = `${field}은(는) 최대 ${rules.maxLength}자를 초과할 수 없습니다.`;
  } else if (rules.match && !validatePasswordMatch(value, rules.match)) {
    error = '비밀번호가 일치하지 않습니다.';
  }
  
  return error;
};