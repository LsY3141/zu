import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import { FaCalendarAlt, FaCheckCircle, FaStickyNote, FaMicrophone, FaClock } from 'react-icons/fa';
import { formatRelativeTime } from '../../utils/formatters';
import noteApi from '../../api/noteApi';

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
  margin-bottom: 15px;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: ${colors.darkGray};
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 8px;
      color: ${colors.cyan};
      font-size: 18px;
    }
  }
  
  .count {
    background: linear-gradient(135deg, ${colors.magenta}, ${colors.cyan});
    color: white;
    padding: 4px 8px;
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
  background: ${colors.white};
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid ${colors.lightGray};
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${({ isVoice }) => isVoice ? colors.cyan : colors.magenta};
  }
  
  &:hover {
    transform: translateX(5px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
    border-color: ${({ isVoice }) => isVoice ? colors.cyan : colors.magenta};
  }
  
  .title {
    font-size: 14px;
    font-weight: 600;
    color: ${colors.darkGray};
    margin-bottom: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .content {
    font-size: 12px;
    color: ${colors.darkGray};
    opacity: 0.7;
    margin-bottom: 10px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
  }
  
  .meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
  }
  
  .type {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 600;
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
    color: ${colors.darkGray};
    opacity: 0.6;
    
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
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [value, onChange] = useState(new Date());
  const [notesOnDates, setNotesOnDates] = useState({});
  const [selectedDateNotes, setSelectedDateNotes] = useState([]);
  const [calendarNotes, setCalendarNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 현재 언어에 따른 로케일 선택
  const getDateLocale = () => {
    return i18n.language === 'ko' ? ko : enUS;
  };
  
  // 캘린더 전용 노트 데이터 직접 로딩
  const loadCalendarNotes = async () => {
    try {
      setLoading(true);
      console.log('CalendarSidebar - 전용 노트 데이터 로딩 시작');
      
      const response = await noteApi.getNotes({
        page: 1,
        limit: 10000, // 충분히 큰 값
        search: '',
        category: '',
        sortBy: 'updated_at',
        sortOrder: 'desc',
        isDeleted: false
      });
      
      console.log('CalendarSidebar - API 응답 전체:', response);
      
      // API 응답 구조 확인 후 처리
      const responseData = response.data || response;
      const notes = responseData.notes || [];
      const total = responseData.total || notes.length;
      
      console.log('CalendarSidebar - 노트 로딩 완료:', {
        total: total,
        loaded: notes.length,
        responseStructure: {
          hasData: !!response.data,
          hasNotes: !!responseData.notes,
          notesType: typeof responseData.notes,
          notesLength: notes.length
        }
      });
      
      setCalendarNotes(notes);
    } catch (error) {
      console.error('CalendarSidebar - 노트 로딩 실패:', error);
      console.error('CalendarSidebar - 에러 상세:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      setCalendarNotes([]);
    } finally {
      setLoading(false);
    }
  };
  
  // 컴포넌트 마운트 시 노트 로딩
  useEffect(() => {
    loadCalendarNotes();
  }, []);
  
  // calendarNotes가 변경될 때 날짜별 매핑
  useEffect(() => {
    console.log('CalendarSidebar - 날짜별 노트 매핑 시작:', {
      notesCount: calendarNotes.length
    });
    
    if (calendarNotes && calendarNotes.length > 0) {
      const notesMap = {};
      
      calendarNotes.forEach(note => {
        try {
          // updatedAt을 기준으로 날짜 계산
          const noteDate = new Date(note.updatedAt);
          if (isNaN(noteDate.getTime())) {
            console.warn('CalendarSidebar - 잘못된 날짜 형식:', note.updatedAt, note);
            return;
          }
          
          const dateStr = noteDate.toDateString();
          if (!notesMap[dateStr]) {
            notesMap[dateStr] = [];
          }
          notesMap[dateStr].push(note);
        } catch (error) {
          console.error('CalendarSidebar - 날짜 처리 오류:', error, note);
        }
      });
      
      console.log('CalendarSidebar - 날짜별 매핑 완료:', {
        totalDates: Object.keys(notesMap).length,
        datesWithNotes: Object.keys(notesMap).map(date => ({
          date,
          count: notesMap[date].length
        }))
      });
      
      setNotesOnDates(notesMap);
      
      // 선택된 날짜의 노트 업데이트
      const selectedDateStr = value.toDateString();
      const notesForDate = notesMap[selectedDateStr] || [];
      console.log('CalendarSidebar - 선택된 날짜 노트:', {
        selectedDate: selectedDateStr,
        notesCount: notesForDate.length
      });
      setSelectedDateNotes(notesForDate);
    } else {
      console.log('CalendarSidebar - 노트 데이터 없음');
      setNotesOnDates({});
      setSelectedDateNotes([]);
    }
  }, [calendarNotes, value]);
  
  const handleDateChange = (date) => {
    console.log('CalendarSidebar - 날짜 변경:', date.toDateString());
    onChange(date);
    const dateStr = date.toDateString();
    const notesForDate = notesOnDates[dateStr] || [];
    console.log('CalendarSidebar - 변경된 날짜의 노트:', {
      date: dateStr,
      notesCount: notesForDate.length
    });
    setSelectedDateNotes(notesForDate);
  };
  
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toDateString();
      const hasNotes = notesOnDates[dateStr] && notesOnDates[dateStr].length > 0;
      return hasNotes ? <div className="note-indicator" /> : null;
    }
    return null;
  };
  
  const handleNoteClick = (noteId) => {
    console.log('노트 클릭:', noteId);
    navigate(`/notes/${noteId}`);
  };
  
  const formatShortWeekday = (locale, date) => {
    const weekdays = t('calendar.weekdays', { returnObjects: true });
    return weekdays[date.getDay()];
  };
  
  // 날짜 포맷팅 함수
  const formatCurrentDate = () => {
    const currentDate = format(new Date(), i18n.language === 'ko' ? 'yyyy년 MM월 dd일' : 'MMMM dd, yyyy', { 
      locale: getDateLocale() 
    });
    return t('calendar.currentDate', { date: currentDate });
  };
  
  const formatSelectedDate = () => {
    const selectedDate = format(value, i18n.language === 'ko' ? 'MM월 dd일' : 'MMM dd', { 
      locale: getDateLocale() 
    });
    return t('calendar.notesForDate', { date: selectedDate });
  };
  
  return (
    <Container>
      <Header>
        <h2>
          <FaCalendarAlt /> {t('calendar.title')}
        </h2>
        <div className="date">
          {formatCurrentDate()}
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
            {formatSelectedDate()}
          </h3>
          {selectedDateNotes.length > 0 && (
            <span className="count">
              {t('calendar.noteCount', { count: selectedDateNotes.length })}
            </span>
          )}
        </NotesHeader>
        
        {loading ? (
          <EmptyState>
            <div className="icon">
              <FaCalendarAlt />
            </div>
            <p>{t('calendar.loading')}</p>
          </EmptyState>
        ) : selectedDateNotes.length > 0 ? (
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
                    {note.isVoice ? t('calendar.noteTypes.voice') : t('calendar.noteTypes.text')}
                  </div>
                  <div className="time">
                    <FaClock />
                    {formatRelativeTime(note.updatedAt)}
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
              {t('calendar.empty.title')}<br />
              {t('calendar.empty.subtitle')}
            </p>
          </EmptyState>
        )}
      </NotesSection>
    </Container>
  );
};

export default CalendarSidebar;