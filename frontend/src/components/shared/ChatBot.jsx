// src/components/shared/ChatBot.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import { 
  FaComments, 
  FaTimes, 
  FaPaperPlane, 
  FaRobot,
  FaUser,
  FaSpinner,
  FaTrash
} from 'react-icons/fa';
import { 
  toggleChat, 
  closeChat, 
  addLocalMessage, 
  sendChatMessage,
  clearLocalChatHistory 
} from '../../redux/slices/chatSlice';
import { showNotification } from '../../redux/slices/uiSlice';
import Button from './Button';

const slideUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const ChatBotContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

const ChatToggleButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: ${({ theme }) => theme.boxShadow.card};
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: ${({ theme }) => theme.boxShadow.hover};
  }
`;

const ChatWindow = styled.div`
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 400px;
  height: 500px;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.hover};
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  flex-direction: column;
  overflow: hidden;
  animation: ${slideUp} 0.3s ease;
`;

const ChatHeader = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
  }
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: 5px;
`;

const HeaderButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #f8f9fa;
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${({ isUser }) => isUser ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 18px;
  background-color: ${({ theme, isUser }) => 
    isUser ? theme.colors.primary : '#ffffff'};
  color: ${({ theme, isUser }) => 
    isUser ? 'white' : theme.colors.text};
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border: ${({ isUser }) => isUser ? 'none' : '1px solid #e9ecef'};
`;

const MessageMeta = styled.div`
  display: flex;
  align-items: center;
  margin-top: 5px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  gap: 5px;
`;

const ChatInput = styled.div`
  padding: 15px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  gap: 10px;
  align-items: center;
  background-color: white;
`;

const InputField = styled.input`
  flex: 1;
  padding: 10px 15px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  background-color: #f8f9fa;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: white;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    transform: scale(1.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-style: italic;
  padding: 10px 15px;
  background-color: white;
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
`;

const SpinnerIcon = styled(FaSpinner)`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  padding: 20px;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 10px;
  opacity: 0.5;
`;

const EmptyStateText = styled.div`
  font-size: 14px;
  line-height: 1.4;
`;

const ChatBot = ({ noteId, noteTitle, noteContent }) => {
  const dispatch = useDispatch();
  const { 
    currentChat, 
    loading, 
    error 
  } = useSelector(state => state.chat);
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const isOpen = currentChat.isOpen && currentChat.noteId === noteId;
  const messages = currentChat.noteId === noteId ? currentChat.messages : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 에러 알림 표시
  useEffect(() => {
    if (error) {
      dispatch(showNotification({
        message: error,
        type: 'error'
      }));
    }
  }, [error, dispatch]);

  // 챗봇 초기 메시지 설정
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        text: `안녕하세요! "${noteTitle}" 노트에 대해 궁금한 것이 있으시면 언제든 물어보세요. 노트 내용을 분석하여 답변드리겠습니다.`,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      // 초기 메시지를 Redux 상태에 추가
      dispatch({
        type: 'chat/addAIResponse',
        payload: {
          noteId,
          response: welcomeMessage.text
        }
      });
    }
  }, [isOpen, messages.length, noteTitle, noteId, dispatch]);

  const handleToggleChat = () => {
    dispatch(toggleChat({ noteId }));
  };

  const handleCloseChat = () => {
    dispatch(closeChat());
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage = inputValue.trim();
    
    // 사용자 메시지를 로컬에 추가
    dispatch(addLocalMessage({ 
      noteId, 
      message: userMessage 
    }));
    
    setInputValue('');

    // 서버에 메시지 전송
    try {
      await dispatch(sendChatMessage({
        noteId,
        message: userMessage,
        noteContent
      })).unwrap();
    } catch (err) {
      console.error('챗봇 메시지 전송 오류:', err);
      // 에러 메시지를 채팅에 추가
      dispatch({
        type: 'chat/addAIResponse',
        payload: {
          noteId,
          response: '죄송합니다. 현재 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.'
        }
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('채팅 히스토리를 모두 삭제하시겠습니까?')) {
      dispatch(clearLocalChatHistory({ noteId }));
      dispatch(showNotification({
        message: '채팅 히스토리가 삭제되었습니다.',
        type: 'success'
      }));
    }
  };

  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return '';
    }
  };

  return (
    <ChatBotContainer>
      <ChatWindow isOpen={isOpen}>
        <ChatHeader>
          <ChatTitle>
            <FaRobot />
            AI 노트 도우미
          </ChatTitle>
          <HeaderButtons>
            <HeaderButton 
              onClick={handleClearHistory} 
              title="채팅 히스토리 삭제"
              disabled={messages.length === 0}
            >
              <FaTrash />
            </HeaderButton>
            <HeaderButton onClick={handleCloseChat} title="닫기">
              <FaTimes />
            </HeaderButton>
          </HeaderButtons>
        </ChatHeader>

        <ChatMessages>
          {messages.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>
                <FaRobot />
              </EmptyStateIcon>
              <EmptyStateText>
                노트에 대해 궁금한 것을<br />
                언제든 물어보세요!
              </EmptyStateText>
            </EmptyState>
          ) : (
            <>
              {messages.map((message) => (
                <Message key={message.id} isUser={message.isUser}>
                  <MessageBubble isUser={message.isUser}>
                    {message.text}
                  </MessageBubble>
                  <MessageMeta>
                    {message.isUser ? <FaUser /> : <FaRobot />}
                    {formatTime(message.timestamp)}
                  </MessageMeta>
                </Message>
              ))}
              
              {loading && (
                <Message isUser={false}>
                  <LoadingMessage>
                    <SpinnerIcon />
                    AI가 답변을 생각하고 있습니다...
                  </LoadingMessage>
                </Message>
              )}
            </>
          )}
          
          <div ref={messagesEndRef} />
        </ChatMessages>

        <ChatInput>
          <InputField
            type="text"
            placeholder="노트에 대해 궁금한 것을 물어보세요..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <SendButton 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || loading}
          >
            <FaPaperPlane />
          </SendButton>
        </ChatInput>
      </ChatWindow>

      <ChatToggleButton onClick={handleToggleChat}>
        {isOpen ? <FaTimes /> : <FaComments />}
      </ChatToggleButton>
    </ChatBotContainer>
  );
};

export default ChatBot;