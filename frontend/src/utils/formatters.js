import moment from 'moment-timezone';
import 'moment/locale/ko';

// 한국 시간대로 설정
moment.locale('ko');

// 날짜 파싱 함수 - DB에서 한국 시간 문자열을 받아서 올바르게 처리
const parseDate = (date) => {
  if (!date) return null;
  
  // DB에서 "YYYY-MM-DD HH:mm:ss" 형태의 한국 시간 문자열을 받음
  // 이를 한국시간으로 명시적으로 파싱
  const parsedDate = moment.tz(date, 'YYYY-MM-DD HH:mm:ss', 'Asia/Seoul');
  
  console.log('날짜 파싱 디버그:', {
    input: date,
    inputType: typeof date,
    parsed: parsedDate.format('YYYY-MM-DD HH:mm:ss'),
    timezone: parsedDate.format('Z'),
    isValid: parsedDate.isValid(),
    note: 'DB 데이터를 Asia/Seoul로 파싱'
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
  
  // 현재 시간도 한국시간으로 설정
  const now = moment.tz('Asia/Seoul');
  const relativeTime = parsedDate.from(now);
  
  console.log('상대 시간 계산 디버그:', {
    input: date,
    parsed: parsedDate.format('YYYY-MM-DD HH:mm:ss Z'),
    now: now.format('YYYY-MM-DD HH:mm:ss Z'),
    relative: relativeTime,
    note: '둘 다 Asia/Seoul 기준으로 계산'
  });
  
  return relativeTime;
};

// 디버깅용 함수
export const formatDateWithTimezone = (date) => {
  const parsedDate = parseDate(date);
  if (!parsedDate || !parsedDate.isValid()) return '';
  
  console.log('시간대 포함 포맷팅 디버그:', {
    original: date,
    parsed: parsedDate.format('YYYY-MM-DD HH:mm:ss Z'),
    relative: parsedDate.fromNow(),
    note: 'Asia/Seoul 시간대로 처리됨'
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
    hours > 0 ? `${hours}:` : '',
    `${minutes.toString().padStart(hours > 0 ? 2 : 1, '0')}:`,
    remainingSeconds.toString().padStart(2, '0')
  ].join('');
};

// 캘린더용 시간 포맷
export const formatTimeForCalendar = (date) => {
  const parsedDate = parseDate(date);
  if (!parsedDate || !parsedDate.isValid()) return '';
  
  return parsedDate.format('HH:mm');
};

// NoteDetail용 상대시간 포맷
export const formatRelativeTimeForDetail = (date) => {
  const parsedDate = parseDate(date);
  if (!parsedDate || !parsedDate.isValid()) return '';
  
  const now = moment.tz('Asia/Seoul');
  const diffMs = now.diff(parsedDate);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  
  // 일주일 이상이면 정확한 날짜
  return parsedDate.format('YYYY년 MM월 DD일 HH:mm');
};

// 노트 목록용 간단한 상대시간
export const formatRelativeTimeSimple = (date) => {
  const parsedDate = parseDate(date);
  if (!parsedDate || !parsedDate.isValid()) return '';
  
  const now = moment.tz('Asia/Seoul');
  
  return parsedDate.from(now);
};