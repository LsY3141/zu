// backend/controllers/chatController.js
const db = require('../config/db');
const NoteModel = require('../models/noteModel');

// AI 서비스 (OpenAI, Claude 등) - 실제 구현 시 교체 필요
class AIService {
  static async generateResponse(prompt, context) {
    // 여기에 실제 AI API 호출 로직 구현
    // 예: OpenAI GPT, Claude, 또는 다른 AI 서비스
    
    // 임시 응답 생성 로직
    const responses = [
      `노트 내용을 분석해보니 다음과 같은 정보를 찾을 수 있습니다: ${context.slice(0, 100)}...`,
      `"${prompt}"에 대한 답변: 노트에서 관련 내용을 찾아 분석했습니다.`,
      `노트의 주요 포인트는 다음과 같습니다. 더 구체적인 질문이 있으시면 말씀해주세요.`,
      `이 노트와 관련하여 다음 사항들을 고려해보시기 바랍니다.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  static async summarizeText(text) {
    // 텍스트 요약 로직
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const summary = sentences.slice(0, Math.min(3, Math.ceil(sentences.length / 3))).join('. ');
    return summary + '.';
  }

  static async extractKeywords(text) {
    // 키워드 추출 로직 (실제로는 AI API 사용)
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

  static async findRelatedNotes(currentNoteContent, allNotes) {
    // 관련 노트 찾기 로직 (실제로는 벡터 검색 등 사용)
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