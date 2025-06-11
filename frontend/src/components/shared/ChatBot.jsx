// src/components/shared/ChatBot.jsx - 영어 전용 버전
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import { 
  FaComments, 
  FaTimes, 
  FaPaperPlane, 
  FaUser, 
  FaRobot, 
  FaTrash 
} from 'react-icons/fa';
import { 
  sendChatMessage, 
  toggleChat, 
  closeChat, 
  addLocalMessage, 
  clearLocalChatHistory 
} from '../../redux/slices/chatSlice';
import { showNotification } from '../../redux/slices/uiSlice';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const ChatBotContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

const ChatWindow = styled.div`
  width: 400px;
  height: 500px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme }) => theme.boxShadow.modal};
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.3s ease-out;
  margin-bottom: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ChatHeader = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 15px 20px;
  border-radius: ${({ theme }) => theme.borderRadius.large} ${({ theme }) => theme.borderRadius.large} 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const ChatActions = styled.div`
  padding: 10px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: flex-end;
`;

const ClearButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 5px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 12px;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.danger};
    color: white;
    border-color: ${({ theme }) => theme.colors.danger};
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${({ isUser }) => isUser ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  background-color: ${({ isUser, theme }) => 
    isUser ? theme.colors.primary : theme.colors.cardBackground
  };
  color: ${({ isUser, theme }) => 
    isUser ? 'white' : theme.colors.text
  };
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.4;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const MessageMeta = styled.div`
  display: flex;
  align-items: center;
  margin-top: 5px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  gap: 5px;
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 18px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SpinnerIcon = styled(FaRobot)`
  animation: ${spin} 1s linear infinite;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyStateIcon = styled(FaComments)`
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.5;
`;

const EmptyStateText = styled.p`
  text-align: center;
  max-width: 200px;
  line-height: 1.5;
`;

const ChatInput = styled.div`
  padding: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  gap: 10px;
`;

const InputField = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 25px;
  outline: none;
  font-size: 14px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryDark};
    transform: scale(1.05);
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
  }
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
  box-shadow: ${({ theme }) => theme.boxShadow.modal};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
    transform: scale(1.1);
  }
`;

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ChatBot = ({ noteId, noteTitle, noteContent }) => {
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  
  const { loading, error } = useSelector(state => state.chat || {});
  const currentChat = useSelector(state => 
    state.chat?.currentChat || { messages: [], isOpen: false }
  );
  const isOpen = currentChat?.isOpen || false;
  
  const chatHistories = useSelector(state => state.chat?.chatHistories || {});
  const messages = currentChat?.noteId === noteId ? currentChat.messages : (chatHistories[noteId] || []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Error notification
  useEffect(() => {
    if (error) {
      dispatch(showNotification({
        message: error,
        type: 'error'
      }));
    }
  }, [error, dispatch]);

  // Initial chatbot message setup
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        text: `Hello! If you have any questions about the "${noteTitle}" note, feel free to ask. I'll analyze the note content and provide answers.`,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      // Add initial message to Redux state
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
    
    // Add user message locally
    dispatch(addLocalMessage({ 
      noteId, 
      message: userMessage 
    }));
    
    setInputValue('');

    // Send message to server
    try {
      console.log('=== Message sending started ===');
      const result = await dispatch(sendChatMessage({
        noteId,
        message: userMessage,
        noteContent
      })).unwrap();
      
      console.log('=== API response received ===', result);
      
      // 🔥 This is key! Add AI response to screen
      if (result.success && result.response && result.response.message) {
        dispatch({
          type: 'chat/addAIResponse',
          payload: {
            noteId,
            response: result.response.message
          }
        });
        console.log('✅ AI response added to screen successfully');
      } else {
        console.log('❌ Response format is incorrect:', result);
        // If response format is wrong, show default message
        dispatch({
          type: 'chat/addAIResponse',
          payload: {
            noteId,
            response: 'I received a response but the format is not correct.'
          }
        });
      }
      
    } catch (err) {
      console.error('Chatbot message sending error:', err);
      // Add error message to chat
      dispatch({
        type: 'chat/addAIResponse',
        payload: {
          noteId,
          response: 'Sorry, there is a temporary issue with the service. Please try again later.'
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
    if (window.confirm('Are you sure you want to delete all chat history?')) {
      dispatch(clearLocalChatHistory({ noteId }));
      dispatch(showNotification({
        message: 'Chat history has been deleted.',
        type: 'success'
      }));
    }
  };

  if (!isOpen) {
    return (
      <ChatBotContainer>
        <ChatToggleButton onClick={handleToggleChat}>
          <FaComments />
        </ChatToggleButton>
      </ChatBotContainer>
    );
  }

  return (
    <ChatBotContainer>
      <ChatWindow>
        <ChatHeader>
          <ChatTitle>AI Assistant</ChatTitle>
          <CloseButton onClick={handleCloseChat}>
            <FaTimes />
          </CloseButton>
        </ChatHeader>

        <ChatActions>
          <ClearButton onClick={handleClearHistory}>
            <FaTrash /> Clear History
          </ClearButton>
        </ChatActions>

        <ChatMessages>
          {messages.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon />
              <EmptyStateText>
                No conversations yet. Ask me anything about the note!
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
                    AI is thinking of an answer...
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
            placeholder="Ask me anything about the note..."
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