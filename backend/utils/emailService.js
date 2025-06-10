const nodemailer = require('nodemailer');
require('dotenv').config();

// Nodemailer transporter 설정
const createTransporter = () => {
  // Gmail 설정
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD // Gmail 앱 비밀번호 사용
      }
    });
  }
  
  // 다른 SMTP 서비스 설정 (예: Outlook, Yahoo 등)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// 이메일 발송 함수
const sendEmail = async (to, subject, html, text = null) => {
  try {
    const transporter = createTransporter();
    
    // 연결 테스트
    await transporter.verify();
    console.log('이메일 서버 연결 성공');
    
    const mailOptions = {
      from: `"음성노트 앱" <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
      to: to,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, '') // HTML 태그 제거한 텍스트 버전
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('이메일 발송 성공:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('이메일 발송 실패:', error);
    throw new Error(`이메일 발송에 실패했습니다: ${error.message}`);
  }
};

// 비밀번호 재설정 이메일 발송
const sendPasswordResetEmail = async (user, resetUrl) => {
  const subject = '[음성노트 앱] 비밀번호 재설정 요청';
  
  const html = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>비밀번호 재설정</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #E91E63 0%, #00BCD4 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }
            .content {
                padding: 40px 30px;
            }
            .greeting {
                font-size: 18px;
                color: #333;
                margin-bottom: 20px;
            }
            .message {
                color: #666;
                margin-bottom: 30px;
                line-height: 1.8;
            }
            .reset-button {
                display: inline-block;
                background: linear-gradient(135deg, #E91E63 0%, #00BCD4 100%);
                color: white;
                text-decoration: none;
                padding: 15px 30px;
                border-radius: 25px;
                font-weight: 600;
                text-align: center;
                margin: 20px 0;
                transition: transform 0.2s ease;
            }
            .reset-button:hover {
                transform: translateY(-2px);
            }
            .link-info {
                background-color: #f8f9fa;
                border-left: 4px solid #E91E63;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .link-info p {
                margin: 0;
                color: #666;
                font-size: 14px;
            }
            .footer {
                background-color: #f8f9fa;
                padding: 20px 30px;
                text-align: center;
                border-top: 1px solid #eee;
            }
            .footer p {
                margin: 0;
                color: #999;
                font-size: 12px;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 4px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎤 음성노트 앱</h1>
            </div>
            
            <div class="content">
                <div class="greeting">
                    안녕하세요, ${user.username}님!
                </div>
                
                <div class="message">
                    음성노트 앱에서 비밀번호 재설정을 요청하셨습니다.<br>
                    아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요.
                </div>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="reset-button">
                        비밀번호 재설정하기
                    </a>
                </div>
                
                <div class="link-info">
                    <p><strong>버튼이 작동하지 않는 경우</strong> 아래 링크를 복사하여 브라우저에 직접 입력해주세요:</p>
                    <p style="word-break: break-all; color: #E91E63; margin-top: 10px;">
                        ${resetUrl}
                    </p>
                </div>
                
                <div class="warning">
                    <p><strong>⚠️ 보안 안내</strong></p>
                    <p>• 이 링크는 1시간 후에 만료됩니다.</p>
                    <p>• 비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하세요.</p>
                    <p>• 링크를 다른 사람과 공유하지 마세요.</p>
                </div>
                
                <div class="message">
                    감사합니다.<br>
                    음성노트 앱 팀 드림
                </div>
            </div>
            
            <div class="footer">
                <p>이 이메일은 자동으로 발송되었습니다. 회신하지 마세요.</p>
                <p>© 2025 음성노트 앱. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
  
  const text = `
안녕하세요, ${user.username}님!

음성노트 앱에서 비밀번호 재설정을 요청하셨습니다.
아래 링크를 클릭하여 새로운 비밀번호를 설정해주세요.

비밀번호 재설정 링크: ${resetUrl}

⚠️ 보안 안내:
- 이 링크는 1시간 후에 만료됩니다.
- 비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하세요.
- 링크를 다른 사람과 공유하지 마세요.

감사합니다.
음성노트 앱 팀 드림

이 이메일은 자동으로 발송되었습니다. 회신하지 마세요.
© 2025 음성노트 앱. All rights reserved.
  `;
  
  return await sendEmail(user.email, subject, html, text);
};

// 이메일 주소 유효성 검사
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 이메일 서비스 연결 테스트
const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ 이메일 서비스 연결 성공');
    return true;
  } catch (error) {
    console.error('❌ 이메일 서비스 연결 실패:', error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  validateEmail,
  testEmailConnection
};