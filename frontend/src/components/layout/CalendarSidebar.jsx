import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaCalendarAlt, FaCheckCircle, FaStickyNote, FaMicrophone, FaClock } from 'react-icons/fa';
import { useSelector } from 'react-redux';

// Colors
const colors = {
  magenta: '#E91E63',
  cyan: '#00BCD4', 
  darkGray: '#424242',
  lime: '#8BC34A',
  lightGray: '#E0E0E0',
  white: '#FFFFFF'
};

// Styled Components
const Container = styled.aside`
  width: 300px;
  height: 100%;
  background: linear-gradient(180deg, ${colors.white} 0%, #F8F9FA 100%);
  border-left: 4px solid transparent;
  border-image: linear-gradient(180deg, ${colors.magenta}, ${colors.cyan}, ${colors.lime}) 1;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow-y: auto;
  box-shadow: -2px 0 20px rgba(0,0,0,0.08);
`;

const Header = styled.div`
  padding: 24px 20px 16px;
  background: linear-gradient(135deg, ${colors.darkGray} 0%, #2C2C2C 100%);
  color: white;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${colors.magenta}, ${colors.cyan}, ${colors.lime});
  }
  
  h2 {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 10px;
      color: ${colors.cyan};
      font-size: 20px;
    }
  }
  
  .date {
    font-size: 13px;
    color: ${colors.cyan};
    opacity: 0.9;
  }
`;

const CalendarWrapper = styled.div`
  padding: 20px;
  background: ${colors.white};
  border-bottom: 1px solid ${colors.lightGray};
`;

const StyledCalendar = styled(Calendar)`
  width: 100%;
  border: none;
  background-color: transparent;
  font-family: inherit;
  
  /* Navigation */
  .react-calendar__navigation {
    margin-bottom: 16px;
    background: transparent;
    
    button {
      background: transparent;
      border: none;
      color: ${colors.darkGray};
      font-size: 16px;
      font-weight: 500;
      padding: 8px;
      transition: all 0.3s ease;
      
      &:hover {
        background: linear-gradient(135deg, ${colors.magenta}20, ${colors.cyan}20);
        color: ${colors.magenta};
        transform: scale(1.1);
      }
      
      &:disabled {
        opacity: 0.3;
      }
    }
    
    .react-calendar__navigation__label {
      font-weight: 600;
      color: ${colors.darkGray};
    }
  }
  
  /* Weekdays */
  .react-calendar__month-view__weekdays {
    background: linear-gradient(90deg, ${colors.magenta}10, ${colors.cyan}10);
    
    .react-calendar__month-view__weekdays__weekday {
      padding: 8px;
      text-align: center;
      font-weight: 600;
      font-size: 11px;
      color: ${colors.darkGray};
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
  
  /* Days container - Grid 레이아웃으로 강제 변경 */
  .react-calendar__month-view__days {
    display: grid !important;
    grid-template-columns: repeat(7, 1fr) !important;
    grid-gap: 1px !important;
  }
  
  /* Date tiles */
  .react-calendar__tile {
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border: 1px solid transparent;
    background: transparent;
    color: ${colors.darkGray};
    font-weight: 500;
    transition: all 0.3s ease;
    margin: 1px;
    
    &:hover {
      background: linear-gradient(135deg, ${colors.cyan}20, ${colors.lime}20);
      transform: scale(1.1);
      border-color: ${colors.cyan}50;
    }
    
    /* 기본 abbr 스타일 */
    abbr {
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
    }
  }
  
  /* 이전/다음 달 날짜 스타일 */
  .react-calendar__month-view__days__day--neighboringMonth {
    color: #ccc !important;
    opacity: 0.4;
    
    &:hover {
      background: transparent;
      transform: none;
      border-color: transparent;
    }
  }
  
  .react-calendar__tile--active {
    background: linear-gradient(135deg, ${colors.magenta} 0%, ${colors.cyan} 100%) !important;
    color: white !important;
    border-color: ${colors.magenta};
    clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 100%, 4px 100%);
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(233, 30, 99, 0.3);
  }
  
  .react-calendar__tile--now {
    background: linear-gradient(135deg, ${colors.lime}30, ${colors.cyan}30) !important;
    color: ${colors.darkGray};
    border: 2px solid ${colors.lime};
    font-weight: 700;
  }
  
  .note-indicator {
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    background: ${colors.magenta};
    clip-path: polygon(0 0, 100% 50%, 0 100%);
  }
`;

const NotesSection = styled.div`
  flex: 1;
  padding: 20px;
  background: ${colors.white};
`;

const NotesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid transparent;
  border-image: linear-gradient(90deg, ${colors.magenta}, ${colors.cyan}) 1;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: ${colors.darkGray};
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 8px;
      color: ${colors.lime};
      font-size: 18px;
    }
  }
  
  .count {
    background: linear-gradient(135deg, ${colors.cyan}, ${colors.lime});
    color: white;
    padding: 4px 8px;
    border-radius: 0;
    font-size: 11px;
    font-weight: 600;
    clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 100%, 4px 100%);
  }
`;

const NotesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NoteItem = styled.div`
  padding: 16px;
  background: ${colors.white};
  border: 1px solid ${colors.lightGray};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateX(4px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
    border-color: ${colors.cyan};
    
    &::before {
      width: 4px;
      opacity: 1;
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 0;
    background: linear-gradient(180deg, ${colors.magenta}, ${colors.cyan});
    transition: all 0.3s ease;
    opacity: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 0;
    height: 0;
    border-left: 12px solid transparent;
    border-top: 12px solid ${({ noteType }) => 
      noteType === 'voice' ? colors.cyan : colors.magenta};
    opacity: 0.3;
  }
  
  .title {
    font-weight: 600;
    font-size: 14px;
    color: ${colors.darkGray};
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .content {
    font-size: 12px;
    color: #666;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 8px;
  }
  
  .meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    color: #999;
  }
  
  .type {
    display: flex;
    align-items: center;
    gap: 4px;
    color: ${({ isVoice }) => isVoice ? colors.cyan : colors.magenta};
    background: ${({ isVoice }) => isVoice ? colors.cyan + '20' : colors.magenta + '20'};
    padding: 2px 6px;
    clip-path: polygon(0 0, calc(100% - 3px) 0, 100% 100%, 3px 100%);
    
    svg {
      font-size: 8px;
    }
  }
  
  .time {
    display: flex;
    align-items: center;
    gap: 4px;
    
    svg {
      font-size: 8px;
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #999;
  background: linear-gradient(135deg, ${colors.lightGray}30, ${colors.white});
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 20px;
    right: 20px;
    width: 20px;
    height: 20px;
    background: ${colors.lime};
    opacity: 0.3;
    transform: rotate(45deg);
  }
  
  .icon {
    font-size: 2rem;
    color: ${colors.cyan};
    margin-bottom: 12px;
    opacity: 0.7;
  }
  
  p {
    font-size: 13px;
    line-height: 1.4;
    margin: 0;
  }
`;

// Main Component
const CalendarSidebar = () => {
  const navigate = useNavigate();
  const [value, onChange] = useState(new Date());
  const [notesOnDates, setNotesOnDates] = useState({});
  const [selectedDateNotes, setSelectedDateNotes] = useState([]);
  const { notes } = useSelector(state => state.notes);
  
  // Process notes by date
  useEffect(() => {
    if (notes && notes.length > 0) {
      const notesMap = {};
      
      notes.forEach(note => {
        try {
          const noteDate = new Date(note.createdAt);
          if (isNaN(noteDate.getTime())) return;
          
          const dateStr = noteDate.toDateString();
          if (!notesMap[dateStr]) {
            notesMap[dateStr] = [];
          }
          notesMap[dateStr].push(note);
        } catch (error) {
          console.error('날짜 처리 오류:', error, note);
        }
      });
      
      setNotesOnDates(notesMap);
      
      // Set selected date notes
      const selectedDateStr = value.toDateString();
      setSelectedDateNotes(notesMap[selectedDateStr] || []);
    }
  }, [notes, value]);
  
  const handleDateChange = (date) => {
    onChange(date);
    const dateStr = date.toDateString();
    setSelectedDateNotes(notesOnDates[dateStr] || []);
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
    navigate(`/notes/${noteId}`);
  };
  
  const formatShortWeekday = (locale, date) => {
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    return weekdays[date.getDay()];
  };
  
  const formatTime = (dateString) => {
    try {
      return format(new Date(dateString), 'HH:mm', { locale: ko });
    } catch (error) {
      return '';
    }
  };
  
  return (
    <Container>
      <Header>
        <h2>
          <FaCalendarAlt /> 캘린더
        </h2>
        <div className="date">
          {format(new Date(), 'yyyy년 MM월 dd일', { locale: ko })}
        </div>
      </Header>
      
      <CalendarWrapper>
        <StyledCalendar
          onChange={handleDateChange}
          value={value}
          locale="en-US"
          tileContent={tileContent}
          showNeighboringMonth={true}
          showFixedNumberOfWeeks={true}
          calendarType="gregory"
          formatShortWeekday={formatShortWeekday}
        />
      </CalendarWrapper>
      
      <NotesSection>
        <NotesHeader>
          <h3>
            <FaCheckCircle /> 
            {format(value, 'MM월 dd일', { locale: ko })} 노트
          </h3>
          {selectedDateNotes.length > 0 && (
            <span className="count">{selectedDateNotes.length}</span>
          )}
        </NotesHeader>
        
        {selectedDateNotes.length > 0 ? (
          <NotesList>
            {selectedDateNotes.map(note => (
              <NoteItem 
                key={note._id} 
                onClick={() => handleNoteClick(note._id)}
                noteType={note.isVoice ? 'voice' : 'text'}
                isVoice={note.isVoice}
              >
                <div className="title">{note.title}</div>
                <div className="content">{note.content}</div>
                <div className="meta">
                  <div className="type">
                    {note.isVoice ? <FaMicrophone /> : <FaStickyNote />}
                    {note.isVoice ? '음성' : '텍스트'}
                  </div>
                  <div className="time">
                    <FaClock />
                    {formatTime(note.updatedAt)} 수정됨
                  </div>
                </div>
              </NoteItem>
            ))}
          </NotesList>
        ) : (
          <EmptyState>
            <div className="icon">
              <FaCalendarAlt />
            </div>
            <p>
              선택한 날짜에<br />
              작성된 노트가 없습니다.
            </p>
          </EmptyState>
        )}
      </NotesSection>
    </Container>
  );
};

export default CalendarSidebar;