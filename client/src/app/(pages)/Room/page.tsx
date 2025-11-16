
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Added Link import
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useThemeStore } from '../store/themeStore';
import io from 'socket.io-client';
import axios from 'axios';

const Room = () => {
  const [newMessage, setNewMessage] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef();
  const socketRef = useRef();
  
  const { user } = useAuthStore();
  const { 
    currentRoom, 
    setCurrentRoom, 
    messages, 
    setMessages, 
    addMessage, 
    updateMessage, 
    removeMessage,
    setRoomMembers,
    hasMoreMessages,
    setHasMoreMessages,
    nextCursor: messagesCursor,
    setNextCursor: setMessagesCursor
  } = useChatStore();
  
  const fontSize = useThemeStore((state) => state.fontSize);

  useEffect(() => {
    loadRoom();
    loadMessages();
    setupSocket();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.get(id)]);

  const setupSocket = () => {
    socketRef.current = io('http://localhost:5000', {
      withCredentials: true
    });

    socketRef.current.emit('join room', id);

    socketRef.current.on('new message', (message) => {
      if (message.room === id) {
        addMessage(id, message);
      }
    });

    socketRef.current.on('message edited', (message) => {
      if (message.room === id) {
        updateMessage(id, message._id, message);
      }
    });

    socketRef.current.on('message deleted', (messageId) => {
      removeMessage(id, messageId);
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
    });
  };

  const loadRoom = async () => {
    try {
      const response = await axios.get(`/api/rooms/${id}`, {
        withCredentials: true
      });
      setCurrentRoom(response.data);
      setRoomMembers(id, response.data.members);
    } catch (error) {
      console.error('Error loading room:', error);
      navigate('/');
    }
  };

  const loadMessages = async (cursor = null) => {
    try {
      const response = await axios.get(`/api/rooms/${id}/messages?cursor=${cursor || ''}`, {
        withCredentials: true
      });
      
      const { messages: newMessages, nextCursor, hasMore } = response.data;
      
      if (cursor) {
        setMessages(id, [...(messages.get(id) || []), ...newMessages]);
      } else {
        setMessages(id, newMessages);
      }
      
      setMessagesCursor(nextCursor);
      setHasMoreMessages(id, hasMore);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadMoreMessages = () => {
    if (loadingMore || !hasMoreMessages.get(id) || !messagesCursor) return;
    
    setLoadingMore(true);
    loadMessages(messagesCursor).finally(() => setLoadingMore(false));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (socketRef.current) {
      socketRef.current.emit('send message', {
        roomId: id,
        text: newMessage.trim(),
        userId: user.id
      });
    }

    setNewMessage('');
  };

  const startEditMessage = (message) => {
    setEditingMessage(message._id);
    setEditText(message.text);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  const handleEditMessage = async (messageId) => {
    if (!editText.trim()) return;

    if (socketRef.current) {
      socketRef.current.emit('edit message', {
        messageId,
        text: editText.trim(),
        userId: user.id
      });
    }

    setEditingMessage(null);
    setEditText('');
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    if (socketRef.current) {
      socketRef.current.emit('delete message', {
        messageId,
        userId: user.id
      });
    }
  };

  const roomMessages = messages.get(id) || [];

  return (
    <div className={`room-container ${fontSize}`}>
      <header className="room-header">
        <div className="container">
          <div className="header-content">
            <div className="room-info">
              <button 
                onClick={() => navigate('/')}
                className="btn btn-secondary"
              >
                ← Back
              </button>
              <h1>{currentRoom?.name}</h1>
              <span className="member-count">
                {currentRoom?.members?.length || 0} members
              </span>
            </div>
            <div className="room-actions">
              <Link to="/settings" className="btn btn-secondary">Settings</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="room-content">
        <div className="messages-container">
          {hasMoreMessages.get(id) && (
            <div className="load-more-container">
              <button 
                onClick={loadMoreMessages}
                disabled={loadingMore}
                className="btn btn-secondary"
              >
                {loadingMore ? 'Loading...' : 'Load More Messages'}
              </button>
            </div>
          )}

          <div className="messages-list">
            {roomMessages.map((message) => (
              <div key={message._id} className="message">
                <div className="message-avatar">
                  {message.user.avatar && message.user.avatar !== '/uploads/default-avatar.png' ? (
                    <img src={message.user.avatar} alt="Avatar" />
                  ) : (
                    <span>{message.user.username.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                
                <div className="message-content">
                  <div className="message-header">
                    <span className="username">{message.user.username}</span>
                    <span className="timestamp">
                      {new Date(message.createdAt).toLocaleTimeString()}
                      {message.edited && <span className="edited"> (edited)</span>}
                    </span>
                  </div>
                  
                  {editingMessage === message._id ? (
                    <div className="edit-message-form">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="form-input"
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button 
                          onClick={() => handleEditMessage(message._id)}
                          className="btn btn-primary"
                        >
                          Save
                        </button>
                        <button 
                          onClick={cancelEdit}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="message-text">{message.text}</div>
                  )}
                  
                  {message.user._id === user?.id && !editingMessage && (
                    <div className="message-actions">
                      <button 
                        onClick={() => startEditMessage(message)}
                        className="btn-link"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteMessage(message._id)}
                        className="btn-link danger"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="form-input"
            placeholder="Type your message..."
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Room;
