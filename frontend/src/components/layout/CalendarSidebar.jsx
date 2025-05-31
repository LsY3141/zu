import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const CalendarSidebarContainer = styled.aside`
  width: 280px;
  height: 100%;
  background-color: #FFFFFF;
  border-left: 1px solid #E0E0E0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow-y: auto;
`;

const CalendarHeader = styled.div`
  padding: 20px 20px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #E0E0E0;
`;

const CalendarTitle = styled.h2`
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
    color: #1976D2;
  }
`;

const CalendarDate = styled.div`
  font-size: 14px;
  color: #757575;
`;

const StyledCalendar = styled(Calendar)`
  width: 100%;
  border: none;
  background-color: transparent;
  padding: 10px;
  
  .react-calendar__tile {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  
  .react-calendar__tile--active {
    background-color: #1976D2 !important;
    color: white;
  }
  
  .react-calendar__tile--now {
    background-color: #E3F2FD !important;
  }
  
  .react-calendar__navigation {
    margin-bottom: 10px;
  }
  
  .react-calendar__navigation button {
    min-width: 36px;
    background: none;
  }
  
  .react-calendar__month-view__weekdays__weekday {
    padding: 0.5em;
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 0.8em;
  }
  
  .note-indicator {
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #1976D2;
  }
`;

const TodayNotesContainer = styled.div`
  flex: 1;
  padding: 20px;
`;

const TodayNotesTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 15px;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
    color: #4CAF50;
  }
`;

const NoteItem = styled.div`
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  background-color: #F5F7F9;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #ECEFF1;
  }
`;

const NoteTitle = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const NoteContent = styled.div`
  font-size: 12px;
  color: #757575;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NoNotesMessage = styled.div`
  color: #757575;
  font-size: 14px;
  text-align: center;
  margin-top: 20px;
`;

const CalendarSidebar = () => {
  const navigate = useNavigate();
  const [value, onChange] = useState(new Date());
  const [notesOnDates, setNotesOnDates] = useState({});
  const [todayNotes, setTodayNotes] = useState([]);
  const { notes } = useSelector(state => state.notes);
  
  // 디버깅 로그 추가
  useEffect(() => {
    console.log('캘린더 사이드바 노트 데이터:', {
      notes: notes.length,
      sampleNote: notes.length > 0 ? notes[0] : null
    });
  }, [notes]);
  
  // 날짜에 노트가 있는지 체크하여 표시
  useEffect(() => {
    if (notes && notes.length > 0) {
      console.log('노트 맵 생성 시작');
      const notesMap = {};
      
      notes.forEach(note => {
        try {
          // 날짜 객체로 변환 (문자열인 경우)
          const noteDate = new Date(note.createdAt);
          console.log('노트 날짜 처리:', {
            noteId: note._id,
            originalDate: note.createdAt,
            parsedDate: noteDate,
            dateString: noteDate.toDateString()
          });
          
          if (isNaN(noteDate.getTime())) {
            console.error('유효하지 않은 날짜:', note.createdAt);
            return; // 유효하지 않은 날짜는 건너뜀
          }
          
          const dateStr = noteDate.toDateString();
          if (!notesMap[dateStr]) {
            notesMap[dateStr] = [];
          }
          notesMap[dateStr].push(note);
        } catch (error) {
          console.error('날짜 처리 오류:', error, note);
        }
      });
      
      console.log('생성된 날짜별 노트 맵:', Object.keys(notesMap).length);
      setNotesOnDates(notesMap);
      
      // 오늘 날짜의 노트 설정
      const today = new Date().toDateString();
      setTodayNotes(notesMap[today] || []);
      console.log('오늘 노트:', notesMap[today] ? notesMap[today].length : 0);
    }
  }, [notes]);
  
  // 선택한 날짜의 노트 표시
  const handleDateChange = (date) => {
    onChange(date);
    const dateStr = date.toDateString();
    console.log('날짜 선택:', dateStr, '노트 수:', notesOnDates[dateStr] ? notesOnDates[dateStr].length : 0);
    setTodayNotes(notesOnDates[dateStr] || []);
  };
  
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toDateString();
      return notesOnDates[dateStr] && notesOnDates[dateStr].length > 0 ? (
        <div className="note-indicator" />
      ) : null;
    }
    return null;
  };
  
  const handleNoteClick = (noteId) => {
    console.log('노트 클릭:', noteId);
    navigate(`/notes/${noteId}`);
  };
  
  return (
    <CalendarSidebarContainer>
      <CalendarHeader>
        <CalendarTitle>
          <FaCalendarAlt /> 캘린더
        </CalendarTitle>
        <CalendarDate>
          {format(new Date(), 'yyyy년 MM월 dd일', { locale: ko })}
        </CalendarDate>
      </CalendarHeader>
      
      <StyledCalendar
        onChange={handleDateChange}
        value={value}
        locale="ko-KR"
        tileContent={tileContent}
      />
      
      <TodayNotesContainer>
        <TodayNotesTitle>
          <FaCheckCircle /> 선택한 날짜의 노트
        </TodayNotesTitle>
        
        {todayNotes.length > 0 ? (
          todayNotes.map(note => (
            <NoteItem key={note._id} onClick={() => handleNoteClick(note._id)}>
              <NoteTitle>{note.title}</NoteTitle>
              <NoteContent>{note.content}</NoteContent>
            </NoteItem>
          ))
        ) : (
          <NoNotesMessage>
            선택한 날짜에 작성된 노트가 없습니다.
          </NoNotesMessage>
        )}
      </TodayNotesContainer>
    </CalendarSidebarContainer>
  );
};

export default CalendarSidebar;