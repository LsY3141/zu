// backend/services/bedrockService.js
const AWS = require('aws-sdk');
require('dotenv').config();

console.log('Bedrock 서비스 초기화 중...');

// Bedrock Runtime 클라이언트 설정 (US 리전 사용)
const bedrockRuntime = new AWS.BedrockRuntime({
  region: 'us-east-1', // IAM 정책에 따라 US 리전 사용
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// 사용 가능한 모델 ID들
const MODELS = {
  CLAUDE_3_HAIKU: 'anthropic.claude-3-haiku-20240307-v1:0',
  CLAUDE_3_SONNET: 'anthropic.claude-3-sonnet-20240229-v1:0',
  CLAUDE_3_OPUS: 'anthropic.claude-3-opus-20240229-v1:0',
  CLAUDE_3_5_SONNET: 'anthropic.claude-3-5-sonnet-20240620-v1:0'
};

class BedrockService {
  constructor() {
    this.defaultModel = MODELS.CLAUDE_3_HAIKU; // 가장 경제적인 모델
    console.log('Bedrock 서비스 초기화 완료');
  }

  // Bedrock 연결 테스트
  async testConnection() {
    try {
      console.log('Bedrock 연결 테스트 중...');
      
      // 간단한 테스트 메시지
      const response = await this.invokeModel({
        prompt: '안녕하세요',
        maxTokens: 100
      });
      
      console.log('Bedrock 연결 성공!', response.substring(0, 50) + '...');
      return true;
    } catch (error) {
      console.error('Bedrock 연결 실패:', error);
      return false;
    }
  }

  // 모델 호출 (Claude 3 사용)
  async invokeModel({ prompt, context = '', maxTokens = 2000, temperature = 0.7, modelId = null }) {
    try {
      const model = modelId || this.defaultModel;
      
      // Claude 3 메시지 형식
      const messages = [
        {
          role: 'user',
          content: context ? `컨텍스트: ${context}\n\n질문: ${prompt}` : prompt
        }
      ];

      const requestBody = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: maxTokens,
        temperature: temperature,
        messages: messages
      };

      console.log(`Bedrock 모델 호출: ${model}`);
      console.log('요청 내용:', prompt.substring(0, 100) + '...');

      const params = {
        modelId: model,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(requestBody)
      };

      const response = await bedrockRuntime.invokeModel(params).promise();
      const responseBody = JSON.parse(response.body.toString());
      
      // Claude 응답에서 텍스트 추출
      const aiResponse = responseBody.content[0].text;
      
      console.log('Bedrock 응답 성공:', aiResponse.substring(0, 100) + '...');
      return aiResponse;

    } catch (error) {
      console.error('Bedrock 모델 호출 오류:', error);
      
      // 오류에 따른 폴백 처리
      if (error.code === 'AccessDeniedException') {
        throw new Error('Bedrock 모델에 대한 액세스 권한이 없습니다. IAM 정책을 확인해주세요.');
      } else if (error.code === 'ValidationException') {
        throw new Error('잘못된 요청 형식입니다.');
      } else if (error.code === 'ThrottlingException') {
        throw new Error('요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
      }
      
      throw new Error(`Bedrock 호출 실패: ${error.message}`);
    }
  }

  // 노트 분석 및 질문 응답
  async analyzeNoteAndRespond(question, noteContent) {
    const context = `다음은 사용자의 노트 내용입니다:\n\n${noteContent}`;
    
    const prompt = `
당신은 사용자의 노트를 분석하고 질문에 답변하는 AI 어시스턴트입니다.

노트 내용을 바탕으로 다음 질문에 답변해주세요:
${question}

답변 시 다음 사항을 고려해주세요:
1. 노트 내용과 관련된 구체적인 정보를 제공하세요
2. 명확하고 도움이 되는 답변을 제공하세요
3. 노트에서 찾을 수 없는 정보는 일반적인 지식으로 보완해주세요
4. 한국어로 자연스럽게 답변해주세요
`;

    return await this.invokeModel({
      prompt,
      context: noteContent,
      maxTokens: 1000,
      temperature: 0.7
    });
  }

  // 노트 요약
  async summarizeNote(noteContent) {
    const prompt = `
다음 노트의 내용을 요약해주세요. 핵심 내용을 3-5개의 문장으로 간단명료하게 정리해주세요:

${noteContent}

요약:
`;

    return await this.invokeModel({
      prompt,
      maxTokens: 500,
      temperature: 0.3 // 요약은 더 일관된 결과를 위해 낮은 temperature
    });
  }

  // 키워드 추출
  async extractKeywords(noteContent) {
    const prompt = `
다음 노트에서 중요한 키워드 5-10개를 추출해주세요. 
키워드는 쉼표로 구분하여 나열해주세요:

${noteContent}

키워드:
`;

    const response = await this.invokeModel({
      prompt,
      maxTokens: 200,
      temperature: 0.3
    });

    // 응답에서 키워드 배열로 변환
    return response.split(',').map(keyword => keyword.trim()).filter(k => k);
  }

  // 관련 질문 제안
  async suggestQuestions(noteContent) {
    const prompt = `
다음 노트 내용을 바탕으로 사용자가 물어볼 만한 질문 3-5개를 제안해주세요:

${noteContent}

제안 질문들:
`;

    const response = await this.invokeModel({
      prompt,
      maxTokens: 300,
      temperature: 0.7
    });

    // 응답을 질문 배열로 변환
    return response.split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.?\s*/, '').trim())
      .filter(q => q);
  }

  // 대화형 채팅
  async conversationalChat(message, noteContent, chatHistory = []) {
    // 채팅 히스토리를 컨텍스트로 구성
    let contextPrompt = '';
    if (noteContent) {
      contextPrompt += `노트 내용:\n${noteContent}\n\n`;
    }
    
    if (chatHistory.length > 0) {
      contextPrompt += '이전 대화:\n';
      chatHistory.slice(-5).forEach(msg => { // 최근 5개 메시지만 포함
        contextPrompt += `${msg.isUser ? '사용자' : 'AI'}: ${msg.text}\n`;
      });
      contextPrompt += '\n';
    }

    const prompt = `
당신은 도움이 되는 AI 어시스턴트입니다. 사용자의 메시지에 친근하고 유용하게 답변해주세요.

${message}
`;

    return await this.invokeModel({
      prompt,
      context: contextPrompt,
      maxTokens: 800,
      temperature: 0.8
    });
  }
}

// 서비스 인스턴스 생성 및 내보내기
const bedrockService = new BedrockService();

// 애플리케이션 시작 시 연결 테스트
bedrockService.testConnection().catch(console.error);

module.exports = bedrockService;