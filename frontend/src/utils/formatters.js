import moment from 'moment';
import 'moment/locale/ko';

// 한국 시간대로 설정
moment.locale('ko');

// 날짜 파싱 함수 - DB에서 DATE_FORMAT으로 한국 시간 문자열 받아서 처리
const parseDate = (date) => {
  if (!date) return null;
  
  // DB에서 DATE_FORMAT으로 "YYYY-MM-DD HH:mm:ss" 형태의 한국 시간 문자열을 받음
  const parsedDate = moment(date, 'YYYY-MM-DD HH:mm:ss');
  
  console.log('날짜 파싱 디버그:', {
    input: date,
    inputType: typeof date,
    parsed: parsedDate.format('YYYY-MM-DD HH:mm:ss'),
    isValid: parsedDate.isValid(),
    note: 'DB에서 DATE_FORMAT으로 KST 문자열 받음'
  });
  
  return parsedDate;
};

export const formatDate = (date, format = 'YYYY년 MM월 DD일') => {
  const parsedDate = parseDate(date);
  if (!parsedDate || !parsedDate.isValid()) return '';
  
  return parsedDate.format(format);
};

export const formatTime = (date, format = 'HH:mm') => {
  const parsedDate = parseDate(date);
  if (!parsedDate || !parsedDate.isValid()) return '';
  
  return parsedDate.format(format);
};

export const formatDateTime = (date, format = 'YYYY년 MM월 DD일 HH:mm') => {
  const parsedDate = parseDate(date);
  if (!parsedDate || !parsedDate.isValid()) return '';
  
  return parsedDate.format(format);
};

export const formatRelativeTime = (date) => {
  const parsedDate = parseDate(date);
  if (!parsedDate || !parsedDate.isValid()) return '';
  
  // DB에서 이미 한국 시간으로 저장된 날짜이므로 그대로 상대 시간 계산
  const relativeTime = parsedDate.fromNow();
  
  console.log('상대 시간 계산 디버그:', {
    input: date,
    parsed: parsedDate.format('YYYY-MM-DD HH:mm:ss'),
    relative: relativeTime,
    now: moment().format('YYYY-MM-DD HH:mm:ss'),
    note: 'DB 데이터는 이미 KST'
  });
  
  return relativeTime;
};

// 디버깅용 함수 - DB에서 이미 한국 시간으로 저장된 데이터 처리
export const formatDateWithTimezone = (date) => {
  const parsedDate = parseDate(date);
  if (!parsedDate || !parsedDate.isValid()) return '';
  
  console.log('시간대 포함 포맷팅 디버그:', {
    original: date,
    parsed: parsedDate.format('YYYY-MM-DD HH:mm:ss'),
    relative: parsedDate.fromNow(),
    note: 'DB에서 이미 KST로 저장되어 있음'
  });
  
  return parsedDate.format('YYYY년 MM월 DD일 HH:mm');
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const secondsToTimeFormat = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return [
    hours > 0 ? hours.toString().padStart(2, '0') : null,
    minutes.toString().padStart(2, '0'),
    remainingSeconds.toString().padStart(2, '0'),
  ]
    .filter(Boolean)
    .join(':');
};

export const fileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};