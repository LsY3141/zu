// 새 파일 생성: backend/utils/logger.js
const fs = require('fs');
const path = require('path');

// 로그 디렉토리 생성
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 날짜 포맷팅
const getFormattedDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
};

// 로그 레벨
const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// 로그 파일에 로깅
const logToFile = (level, message, data = null) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(logDir, `${today}.log`);
    
    const logEntry = {
      timestamp: getFormattedDate(),
      level,
      message,
      data: data ? JSON.stringify(data) : null
    };
    
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  } catch (err) {
    console.error('로그 파일 작성 오류:', err);
  }
};

// 콘솔에 로깅
const logToConsole = (level, message, data = null) => {
  const timestamp = getFormattedDate();
  
  switch (level) {
    case LogLevel.ERROR:
      console.error(`[${timestamp}] [${level}] ${message}`);
      if (data) console.error(data);
      break;
    case LogLevel.WARN:
      console.warn(`[${timestamp}] [${level}] ${message}`);
      if (data) console.warn(data);
      break;
    case LogLevel.INFO:
      console.info(`[${timestamp}] [${level}] ${message}`);
      if (data) console.info(data);
      break;
    case LogLevel.DEBUG:
      console.debug(`[${timestamp}] [${level}] ${message}`);
      if (data) console.debug(data);
      break;
    default:
      console.log(`[${timestamp}] [${level}] ${message}`);
      if (data) console.log(data);
  }
};

// 로깅 함수
const log = (level, message, data = null) => {
  logToConsole(level, message, data);
  logToFile(level, message, data);
};

// 로그 함수 내보내기
module.exports = {
  error: (message, data = null) => log(LogLevel.ERROR, message, data),
  warn: (message, data = null) => log(LogLevel.WARN, message, data),
  info: (message, data = null) => log(LogLevel.INFO, message, data),
  debug: (message, data = null) => log(LogLevel.DEBUG, message, data),
  LogLevel
};