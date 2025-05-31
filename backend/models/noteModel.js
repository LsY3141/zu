const db = require('../config/db');

// 한국 시간 문자열 생성 유틸리티 함수
const getKSTString = () => {
  const now = new Date();
  const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  return kstNow.toISOString().slice(0, 19).replace('T', ' ');
};

// 노트 생성
const createNote = async (data) => {
  const { userId, title, content, category = '기본', isVoice = false, audioUrl = null } = data;
  
  const kstString = getKSTString();
  
  const sql = `
    INSERT INTO notes 
    (user_id, title, content, category, is_voice, audio_url, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  try {
    const result = await db.query(sql, [userId, title, content, category, isVoice ? 1 : 0, audioUrl, kstString, kstString]);
    return result.insertId;
  } catch (error) {
    console.error('노트 생성 오류:', error);
    throw error;
  }
};

// 노트 태그 추가
const addTagsToNote = async (noteId, tags) => {
  const connection = await db.pool.getConnection();
  try {
    await connection.beginTransaction();
    
    for (const tag of tags) {
      let tagId;
      const [existingTags] = await connection.execute(
        'SELECT id FROM tags WHERE name = ?',
        [tag]
      );
      
      if (existingTags.length > 0) {
        tagId = existingTags[0].id;
      } else {
        const [result] = await connection.execute(
          'INSERT INTO tags (name) VALUES (?)',
          [tag]
        );
        tagId = result.insertId;
      }
      
      await connection.execute(
        'INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)',
        [noteId, tagId]
      );
    }
    
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    console.error('태그 추가 오류:', error);
    throw error;
  } finally {
    connection.release();
  }
};

// 노트 목록 조회
const getNotes = async (userId, options = {}) => {
  const {
    search = '',
    category = '',
    sortBy = 'updated_at',
    sortOrder = 'DESC',
    page = 1,
    limit = 10,
    isDeleted = false
  } = options;
  
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const offset = (pageNum - 1) * limitNum;
  
  let sql = `
    SELECT n.*, 
      DATE_FORMAT(CONVERT_TZ(n.created_at, @@session.time_zone, '+09:00'), '%Y-%m-%d %H:%i:%s') as created_at_formatted,
      DATE_FORMAT(CONVERT_TZ(n.updated_at, @@session.time_zone, '+09:00'), '%Y-%m-%d %H:%i:%s') as updated_at_formatted,
      DATE_FORMAT(CONVERT_TZ(n.deleted_at, @@session.time_zone, '+09:00'), '%Y-%m-%d %H:%i:%s') as deleted_at_formatted,
      (SELECT GROUP_CONCAT(t.name) FROM note_tags nt JOIN tags t ON nt.tag_id = t.id WHERE nt.note_id = n.id) AS tags
    FROM notes n
    WHERE n.user_id = ? AND n.is_deleted = ?
  `;
  
  const params = [userId, isDeleted ? 1 : 0];
  
  // 검색 조건 추가
  if (search && search.trim()) {
    const searchTerm = search.trim();
    sql += ` AND (
      n.title COLLATE utf8mb4_unicode_ci LIKE ? OR 
      n.content COLLATE utf8mb4_unicode_ci LIKE ? OR
      EXISTS (
        SELECT 1 FROM note_tags nt 
        JOIN tags t ON nt.tag_id = t.id 
        WHERE nt.note_id = n.id AND t.name COLLATE utf8mb4_unicode_ci LIKE ?
      )
    )`;
    const searchPattern = `%${searchTerm}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }
  
  // 카테고리 필터링
  if (category && category !== '전체' && category.trim()) {
    sql += ' AND n.category = ?';
    params.push(category);
  }
  
  // 정렬
  const validSortColumns = ['title', 'content', 'created_at', 'updated_at', 'category'];
  const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'updated_at';
  const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
  
  sql += ` ORDER BY n.${safeSortBy} ${safeSortOrder}`;
  sql += ` LIMIT ${limitNum} OFFSET ${offset}`;
  
  try {
    const notes = await db.query(sql, params);
    
    return notes.map(note => ({
      ...note,
      created_at: note.created_at_formatted,
      updated_at: note.updated_at_formatted,
      deleted_at: note.deleted_at_formatted,
      tags: note.tags ? note.tags.split(',') : []
    }));
  } catch (error) {
    console.error('노트 목록 조회 오류:', error);
    throw error;
  }
};

// noteModel.js - getNoteById 함수 수정
const getNoteById = async (id, userId) => {
  const sql = `
    SELECT n.*, 
      DATE_FORMAT(CONVERT_TZ(n.created_at, @@session.time_zone, '+09:00'), '%Y-%m-%d %H:%i:%s') as created_at_formatted,
      DATE_FORMAT(CONVERT_TZ(n.updated_at, @@session.time_zone, '+09:00'), '%Y-%m-%d %H:%i:%s') as updated_at_formatted,
      DATE_FORMAT(CONVERT_TZ(n.deleted_at, @@session.time_zone, '+09:00'), '%Y-%m-%d %H:%i:%s') as deleted_at_formatted,
      (SELECT GROUP_CONCAT(t.name) FROM note_tags nt JOIN tags t ON nt.tag_id = t.id WHERE nt.note_id = n.id) AS tags,
      -- 공유 정보도 함께 가져오기
      CASE 
        WHEN n.user_id = ? THEN 'owner'
        WHEN EXISTS (SELECT 1 FROM shared_notes sn WHERE sn.note_id = n.id AND sn.shared_with = ?) THEN 'shared'
        ELSE 'no_access'
      END as access_type
    FROM notes n
    WHERE n.id = ? 
      AND (
        n.user_id = ? 
        OR EXISTS (
          SELECT 1 FROM shared_notes sn 
          WHERE sn.note_id = n.id AND sn.shared_with = ?
        )
      )
      AND n.is_deleted = 0
  `;
  
  try {
    const notes = await db.query(sql, [userId, userId, id, userId, userId]);
    
    if (notes.length === 0) {
      return null;
    }
    
    const note = notes[0];
    
    return {
      ...note,
      created_at: note.created_at_formatted,
      updated_at: note.updated_at_formatted,
      deleted_at: note.deleted_at_formatted,
      tags: note.tags ? note.tags.split(',') : [],
      isShared: note.access_type === 'shared', // 공유받은 노트인지 표시
      isOwner: note.access_type === 'owner'    // 소유자인지 표시
    };
  } catch (error) {
    console.error('노트 상세 조회 오류:', error);
    throw error;
  }
};

// 노트 수정
const updateNote = async (id, data) => {
  const { title, content, category } = data;
  const kstString = getKSTString();
  
  const sql = `
    UPDATE notes
    SET title = ?, content = ?, category = ?, updated_at = ?
    WHERE id = ?
  `;
  
  try {
    const result = await db.query(sql, [title, content, category, kstString, id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('노트 수정 오류:', error);
    throw error;
  }
};

// 노트 태그 업데이트
const updateNoteTags = async (noteId, tags) => {
  const connection = await db.pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // 기존 태그 연결 삭제
    await connection.execute(
      'DELETE FROM note_tags WHERE note_id = ?',
      [noteId]
    );
    
    // 새 태그 추가
    for (const tag of tags) {
      let tagId;
      const [existingTags] = await connection.execute(
        'SELECT id FROM tags WHERE name = ?',
        [tag]
      );
      
      if (existingTags.length > 0) {
        tagId = existingTags[0].id;
      } else {
        const [result] = await connection.execute(
          'INSERT INTO tags (name) VALUES (?)',
          [tag]
        );
        tagId = result.insertId;
      }
      
      await connection.execute(
        'INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)',
        [noteId, tagId]
      );
    }
    
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    console.error('태그 업데이트 오류:', error);
    throw error;
  } finally {
    connection.release();
  }
};

// 노트 삭제 (휴지통으로 이동)
const moveNoteToTrash = async (id) => {
  const kstString = getKSTString();
  
  const sql = `
    UPDATE notes
    SET is_deleted = TRUE, deleted_at = ?
    WHERE id = ?
  `;
  
  try {
    const result = await db.query(sql, [kstString, id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('노트 휴지통 이동 오류:', error);
    throw error;
  }
};

// 노트 영구 삭제
const deleteNotePermanently = async (id) => {
  const sql = 'DELETE FROM notes WHERE id = ?';
  
  try {
    const result = await db.query(sql, [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('노트 영구 삭제 오류:', error);
    throw error;
  }
};

// 노트 복원
const restoreNote = async (id) => {
  const sql = `
    UPDATE notes
    SET is_deleted = FALSE, deleted_at = NULL
    WHERE id = ?
  `;
  
  try {
    const result = await db.query(sql, [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('노트 복원 오류:', error);
    throw error;
  }
};

// 노트 공유
const shareNote = async (noteId, sharedBy, sharedWith, shareLink) => {
  const sql = `
    INSERT INTO shared_notes (note_id, shared_by, shared_with, share_link)
    VALUES (?, ?, ?, ?)
  `;
  
  try {
    const result = await db.query(sql, [noteId, sharedBy, sharedWith, shareLink]);
    return result.insertId;
  } catch (error) {
    console.error('노트 공유 오류:', error);
    throw error;
  }
};

// 공유 노트 조회
const getSharedNotes = async (userId) => {
  const sql = `
    SELECT n.*, 
      DATE_FORMAT(CONVERT_TZ(n.created_at, @@session.time_zone, '+09:00'), '%Y-%m-%d %H:%i:%s') as created_at_formatted,
      DATE_FORMAT(CONVERT_TZ(n.updated_at, @@session.time_zone, '+09:00'), '%Y-%m-%d %H:%i:%s') as updated_at_formatted,
      DATE_FORMAT(CONVERT_TZ(n.deleted_at, @@session.time_zone, '+09:00'), '%Y-%m-%d %H:%i:%s') as deleted_at_formatted,
      u.username as owner_name, s.share_link,
      (SELECT GROUP_CONCAT(t.name) FROM note_tags nt JOIN tags t ON nt.tag_id = t.id WHERE nt.note_id = n.id) AS tags
    FROM notes n
    JOIN shared_notes s ON n.id = s.note_id
    JOIN users u ON n.user_id = u.id
    WHERE s.shared_with = ? OR s.shared_by = ?
  `;
  
  try {
    const notes = await db.query(sql, [userId, userId]);
    
    return notes.map(note => ({
      ...note,
      created_at: note.created_at_formatted,
      updated_at: note.updated_at_formatted,
      deleted_at: note.deleted_at_formatted,
      tags: note.tags ? note.tags.split(',') : [],
      shared: {
        sharedWithMe: note.user_id !== userId,
        sharedBy: {
          id: note.user_id,
          username: note.owner_name
        },
        shareLink: note.share_link
      }
    }));
  } catch (error) {
    console.error('공유 노트 조회 오류:', error);
    throw error;
  }
};

module.exports = {
  createNote,
  addTagsToNote,
  getNotes,
  getNoteById,
  updateNote,
  updateNoteTags,
  moveNoteToTrash,
  deleteNotePermanently,
  restoreNote,
  shareNote,
  getSharedNotes
};