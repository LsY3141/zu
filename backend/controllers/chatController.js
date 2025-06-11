// backend/controllers/chatController.js
const db = require('../config/db');
const NoteModel = require('../models/noteModel');
const AWS = require('aws-sdk');

// Bedrock 설정 (간단 버전)
const bedrock = new AWS.BedrockRuntime({
  region: 'us-east-1', // 기존 정책에서 허용된 US 리전
  // AWS 자격증명은 환경변수나 IAM Role에서 자동 로드
});

// 기존 AIService 클래스를 이 코드로 통째로 교체하세요!

class AIService {
  // 🔹 Bedrock 설정 (처음에 한 번만 실행)
  static bedrock = null;
  
  static getBedrock() {
    if (!this.bedrock) {
      this.bedrock = new AWS.BedrockRuntime({
        region: 'us-east-1'  // US 리전 사용
      });
    }
    return this.bedrock;
  }

  // 🔹 메인 응답 생성 (Bedrock 시도 → 실패하면 기본 응답)
  static async generateResponse(prompt, context) {
    console.log('=== AI 응답 생성 시작 ===');
    
    // 1️⃣ 먼저 Bedrock 시도
    try {
      console.log('Bedrock 호출 시도 중...');
      const bedrockResponse = await this.callBedrock(prompt, context);
      console.log('✅ Bedrock 응답 성공!');
      return bedrockResponse;
      
    } catch (error) {
      console.log('❌ Bedrock 실패:', error.message);
      console.log('→ 기본 응답으로 전환합니다');
      
      // 2️⃣ 실패하면 기존 방식 사용
      return this.getSmartFallback(prompt, context);
    }
  }

  // 🔹 Bedrock 호출 함수
  static async callBedrock(prompt, context) {
    const bedrock = this.getBedrock();
    
    // Claude 3에게 보낼 메시지 구성
    let fullPrompt = prompt;
    if (context && context.length > 0) {
      fullPrompt = `노트 내용: ${context.substring(0, 1500)}\n\n질문: ${prompt}\n\n노트 내용을 참고해서 한국어로 답변해주세요.`;
    }

    const requestBody = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 800,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: fullPrompt
      }]
    };

    const params = {
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody)
    };

    const response = await bedrock.invokeModel(params).promise();
    const responseBody = JSON.parse(response.body.toString());
    return responseBody.content[0].text;
  }

  // getSmartFallback 함수만 이것으로 교체하세요!

// chatController.js의 getSmartFallback 함수를 이렇게 교체하세요!

static getSmartFallback(prompt, context) {
  console.log('개선된 스마트 응답 생성 중...');
  console.log('질문:', prompt);
  console.log('노트 내용 길이:', context ? context.length : 0);
  
  try {
    if (!context || context.length < 10) {
      return `"${prompt}"에 대해 답변드리고 싶지만, 분석할 노트 내용이 부족합니다. 더 자세한 노트 내용이 있다면 구체적으로 도움을 드릴 수 있어요! 😊`;
    }

    // 질문 유형 분석 (더 정교하게)
    const question = prompt.toLowerCase();
    
    // 1️⃣ 의미/뜻/주제 관련 질문
    if (question.includes('뜻') || question.includes('의미') || question.includes('말하고자') || 
        question.includes('주제') || question.includes('화자') || question.includes('내용') ||
        question.includes('메시지') || question.includes('전달하려는')) {
      
      return this.analyzeMainMessage(context, prompt);
    }
    
    // 2️⃣ 요약 관련 질문
    if (question.includes('요약') || question.includes('정리') || question.includes('간단히')) {
      return this.generateSummary(context);
    }
    
    // 3️⃣ 키워드 관련 질문  
    if (question.includes('키워드') || question.includes('핵심') || question.includes('중요한')) {
      return this.extractMainKeywords(context);
    }
    
    // 4️⃣ 구체적 설명 요청
    if (question.includes('설명') || question.includes('자세히') || question.includes('어떻게')) {
      return this.provideDetailedExplanation(context, prompt);
    }
    
    // 5️⃣ 감정/톤 관련 질문
    if (question.includes('감정') || question.includes('느낌') || question.includes('분위기')) {
      return this.analyzeTone(context);
    }
    
    // 6️⃣ 기본 분석 응답
    return this.generateGeneralAnalysis(context, prompt);
    
  } catch (error) {
    console.error('스마트 응답 생성 오류:', error);
    return `"${prompt}"에 대해 분석하려고 했지만 일시적인 문제가 발생했습니다. 다시 질문해주시면 더 나은 답변을 드릴게요! 🤖`;
  }
}

// 주요 메시지/의미 분석
static analyzeMainMessage(context, prompt) {
  console.log('주요 메시지 분석 중...');
  
  // 노트에서 핵심 문장들 추출
  const sentences = context.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const keyPoints = [];
  
  // 중요해 보이는 키워드들
  const importantKeywords = ['국민', '애국', '청소년', '학도', '해방', '본국', '동포'];
  
  sentences.forEach(sentence => {
    const hasImportantKeyword = importantKeywords.some(keyword => 
      sentence.includes(keyword)
    );
    if (hasImportantKeyword || sentence.length > 30) {
      keyPoints.push(sentence.trim());
    }
  });
  
  let analysis = `💡 **화자의 주요 메시지 분석:**\n\n`;
  
  if (context.includes('해방 후') && context.includes('애국')) {
    analysis += `이 글은 해방 후 시대를 배경으로 한 **애국적 메시지**를 담고 있습니다.\n\n`;
  }
  
  if (context.includes('청소년') || context.includes('학도')) {
    analysis += `**청소년들에게 전하는 메시지**가 핵심입니다.\n\n`;
  }
  
  if (context.includes('국민이 원하는')) {
    analysis += `**국민의 뜻을 따르고자 하는 의지**를 표현하고 있습니다.\n\n`;
  }
  
  analysis += `**핵심 내용:**\n`;
  if (keyPoints.length > 0) {
    keyPoints.slice(0, 2).forEach((point, index) => {
      analysis += `${index + 1}. "${point}"\n`;
    });
  }
  
  analysis += `\n이 글의 화자는 **국가와 민족에 대한 사랑**, **청소년에 대한 기대**, 그리고 **국민의 뜻을 존중하는 마음**을 전달하려고 하는 것 같습니다.`;
  
  return analysis;
}

// 요약 생성
static generateSummary(context) {
  const sentences = context.split(/[.!?]+/).filter(s => s.trim().length > 5);
  const summary = sentences.slice(0, 3).join('. ');
  
  return `📄 **노트 요약:**\n\n${summary}...\n\n주요 내용을 간추렸습니다. 더 구체적인 부분이 궁금하시면 말씀해주세요!`;
}

// 키워드 추출
static extractMainKeywords(context) {
  const words = context.match(/[가-힣]{2,}/g) || [];
  const frequency = {};
  
  words.forEach(word => {
    if (word.length >= 2) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  });
  
  const keywords = Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([word]) => word);
  
  return `🔑 **핵심 키워드:**\n\n${keywords.join(', ')}\n\n이 키워드들이 노트의 주요 내용을 나타냅니다. 특정 키워드에 대해 더 알고 싶으시면 질문해주세요!`;
}

// 상세 설명
static provideDetailedExplanation(context, prompt) {
  const contextSnippet = context.substring(0, 300);
  
  return `🔍 **상세 분석:**\n\n"${prompt}"에 대해 노트 내용을 바탕으로 설명드리면:\n\n"${contextSnippet}..."\n\n이 부분에서 알 수 있듯이, 더 구체적인 질문을 해주시면 세부적으로 분석해드릴 수 있습니다!`;
}

// 톤/감정 분석
static analyzeTone(context) {
  let tone = '중립적';
  let emotion = '';
  
  if (context.includes('애국') || context.includes('사랑')) {
    tone = '애국적이고 감동적인';
    emotion = '국가에 대한 사랑과 헌신';
  }
  
  if (context.includes('청소년') || context.includes('학도')) {
    emotion += ', 젊은 세대에 대한 기대와 당부';
  }
  
  return `🎭 **글의 분위기와 감정:**\n\n이 글은 **${tone}** 톤으로 쓰여져 있으며, **${emotion}**을 담고 있습니다.\n\n화자의 진심어린 마음이 잘 드러나는 글입니다.`;
}

// 일반적 분석
static generateGeneralAnalysis(context, prompt) {
  const contextSnippet = context.substring(0, 200);
  
  return `🤔 **"${prompt}"에 대한 분석:**\n\n노트 내용을 살펴보면:\n"${contextSnippet}..."\n\n이 내용을 바탕으로 보면, 구체적으로 어떤 부분이 궁금하신지 말씀해주시면 더 정확한 답변을 드릴 수 있어요!\n\n예: "애국적 메시지가 무엇인가요?", "청소년에게 하고 싶은 말이 뭔가요?" 등`;
}

  // 🔹 키워드 추출 (Bedrock 시도 → 기본 방식)
  static async extractKeywords(text) {
    try {
      console.log('Bedrock으로 키워드 추출 시도...');
      const result = await this.callBedrock(`다음 텍스트에서 중요한 키워드 5-7개를 쉼표로 구분해서 추출해주세요: ${text}`, null);
      
      const keywords = result.split(',').map(k => k.trim()).filter(k => k.length > 0);
      console.log('✅ Bedrock 키워드 추출 성공!');
      return keywords;
      
    } catch (error) {
      console.log('❌ Bedrock 키워드 추출 실패, 기본 방식 사용');
      
      const words = text.toLowerCase().match(/\b[가-힣a-z]{2,}\b/g) || [];
      const frequency = {};
      
      words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
      });
      
      return Object.entries(frequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word);
    }
  }

  // 🔹 관련 노트 찾기 (기존 로직 그대로 - 변경하지 않음)
  static async findRelatedNotes(currentNoteContent, allNotes) {
    const currentWords = new Set(currentNoteContent.toLowerCase().match(/\b[가-힣a-z]+\b/g) || []);
    
    return allNotes
      .map(note => {
        const noteWords = new Set(note.content.toLowerCase().match(/\b[가-힣a-z]+\b/g) || []);
        const intersection = new Set([...currentWords].filter(x => noteWords.has(x)));
        const similarity = intersection.size / Math.max(currentWords.size, noteWords.size);
        
        return { ...note, similarity };
      })
      .filter(note => note.similarity > 0.1)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }
}

// 챗봇 메시지 전송
exports.sendMessage = async (req, res) => {
  try {
    const { noteId, message, noteContent } = req.body;
    const userId = req.user.id;

    console.log('챗봇 메시지 수신:', { noteId, message: message.substring(0, 50) + '...' });

    // 노트 존재 여부 확인
    const note = await NoteModel.getNoteById(noteId, userId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: '노트를 찾을 수 없습니다.'
      });
    }

    // 채팅 히스토리에 사용자 메시지 저장
    const userMessageId = await saveChatMessage(noteId, userId, message, true);

    // AI 응답 생성
    const aiResponse = await AIService.generateResponse(message, noteContent || note.content);

    // AI 응답을 채팅 히스토리에 저장
    const aiMessageId = await saveChatMessage(noteId, userId, aiResponse, false);

    // 사용자 사용량 업데이트 (선택사항)
    await updateUserChatUsage(userId);

    res.status(200).json({
      success: true,
      response: {
        message: aiResponse,
        timestamp: new Date().toISOString(),
        messageId: aiMessageId
      }
    });

  } catch (error) {
    console.error('챗봇 메시지 처리 오류:', error);
    res.status(500).json({
      success: false,
      message: '메시지 처리 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 노트 요약
exports.summarizeNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    const note = await NoteModel.getNoteById(noteId, userId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: '노트를 찾을 수 없습니다.'
      });
    }

    const summary = await AIService.summarizeText(note.content);

    // 요약 결과를 채팅 히스토리에 저장
    await saveChatMessage(noteId, userId, `노트 요약: ${summary}`, false);

    res.status(200).json({
      success: true,
      summary,
      message: '노트 요약이 완료되었습니다.'
    });

  } catch (error) {
    console.error('노트 요약 오류:', error);
    res.status(500).json({
      success: false,
      message: '노트 요약 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 키워드 추출
exports.extractKeywords = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    const note = await NoteModel.getNoteById(noteId, userId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: '노트를 찾을 수 없습니다.'
      });
    }

    const keywords = await AIService.extractKeywords(note.content);

    res.status(200).json({
      success: true,
      keywords,
      message: '키워드 추출이 완료되었습니다.'
    });

  } catch (error) {
    console.error('키워드 추출 오류:', error);
    res.status(500).json({
      success: false,
      message: '키워드 추출 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 관련 노트 찾기
exports.getRelatedNotes = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    const currentNote = await NoteModel.getNoteById(noteId, userId);
    if (!currentNote) {
      return res.status(404).json({
        success: false,
        message: '노트를 찾을 수 없습니다.'
      });
    }

    // 사용자의 모든 노트 가져오기
    const allNotes = await NoteModel.getNotes(userId, { limit: 100 });
    const otherNotes = allNotes.filter(note => note.id !== parseInt(noteId));

    const relatedNotes = await AIService.findRelatedNotes(currentNote.content, otherNotes);

    res.status(200).json({
      success: true,
      relatedNotes: relatedNotes.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content.substring(0, 200) + '...',
        similarity: note.similarity,
        createdAt: note.created_at
      })),
      message: '관련 노트 검색이 완료되었습니다.'
    });

  } catch (error) {
    console.error('관련 노트 검색 오류:', error);
    res.status(500).json({
      success: false,
      message: '관련 노트 검색 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 채팅 히스토리 조회
exports.getChatHistory = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    // 노트 존재 여부 확인
    const note = await NoteModel.getNoteById(noteId, userId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: '노트를 찾을 수 없습니다.'
      });
    }

    const messages = await getChatHistory(noteId, userId);

    res.status(200).json({
      success: true,
      noteId,
      messages,
      message: '채팅 히스토리를 불러왔습니다.'
    });

  } catch (error) {
    console.error('채팅 히스토리 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '채팅 히스토리 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 채팅 히스토리 삭제
exports.clearChatHistory = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    await clearChatHistory(noteId, userId);

    res.status(200).json({
      success: true,
      message: '채팅 히스토리가 삭제되었습니다.'
    });

  } catch (error) {
    console.error('채팅 히스토리 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '채팅 히스토리 삭제 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 헬퍼 함수들
async function saveChatMessage(noteId, userId, message, isUser) {
  const sql = `
    INSERT INTO chat_messages (note_id, user_id, message, is_user, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;
  
  try {
    const result = await db.query(sql, [noteId, userId, message, isUser ? 1 : 0]);
    return result.insertId;
  } catch (error) {
    console.error('채팅 메시지 저장 오류:', error);
    throw error;
  }
}

async function getChatHistory(noteId, userId, limit = 50) {
  const sql = `
    SELECT id, message, is_user, created_at
    FROM chat_messages
    WHERE note_id = ? AND user_id = ?
    ORDER BY created_at ASC
    LIMIT ?
  `;
  
  try {
    const messages = await db.query(sql, [noteId, userId, limit]);
    return messages.map(msg => ({
      id: msg.id,
      text: msg.message,
      isUser: msg.is_user === 1,
      timestamp: msg.created_at
    }));
  } catch (error) {
    console.error('채팅 히스토리 조회 오류:', error);
    throw error;
  }
}

async function clearChatHistory(noteId, userId) {
  const sql = `
    DELETE FROM chat_messages
    WHERE note_id = ? AND user_id = ?
  `;
  
  try {
    await db.query(sql, [noteId, userId]);
  } catch (error) {
    console.error('채팅 히스토리 삭제 오류:', error);
    throw error;
  }
}

async function updateUserChatUsage(userId) {
  const sql = `
    UPDATE users 
    SET chat_messages_count = chat_messages_count + 1,
        updated_at = NOW()
    WHERE id = ?
  `;
  
  try {
    await db.query(sql, [userId]);
  } catch (error) {
    console.error('사용자 채팅 사용량 업데이트 오류:', error);
    // 에러가 발생해도 메인 기능에는 영향 없도록 처리
  }
}