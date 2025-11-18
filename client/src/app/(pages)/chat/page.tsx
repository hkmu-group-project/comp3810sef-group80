"use client";

import { useState, useEffect } from "react";

export default function MainChat() {
    const [activeRoom, setActiveRoom] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState({}); // Store messages by room ID
    
    // Load rooms from backend
    useEffect(() => {
        loadRooms();
    }, []);

    const loadRooms = async () => {
        try {
            console.log('Loading rooms...');
            const response = await fetch('http://localhost:5000/api/rooms');
            const data = await response.json();
            console.log('Rooms loaded:', data);
            
            if (response.ok && data.rooms && data.rooms.length > 0) {
                setRooms(data.rooms);
                // Auto-select the first room
                setActiveRoom(data.rooms[0]._id);
                console.log('Active room set to:', data.rooms[0]._id);
                
                // Initialize empty messages for each room
                const initialMessages = {};
                data.rooms.forEach(room => {
                    initialMessages[room._id] = [
                        {
                            id: 1,
                            sender: "System",
                            text: `Welcome to ${room.name}! Start chatting.`,
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            isMe: false
                        }
                    ];
                });
                setMessages(initialMessages);
            }
        } catch (error) {
            console.error('Failed to load rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoomName.trim()) return;
        
        try {
            const response = await fetch('http://localhost:5000/api/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newRoomName.trim(),
                    description: "New chat room",
                    isPublic: true
                }),
            });

            const data = await response.json();
            
            if (response.ok) {
                setShowCreateRoom(false);
                setNewRoomName("");
                loadRooms(); // Reload rooms
            } else {
                alert(data.error || 'Failed to create room');
            }
        } catch (error) {
            console.error('Create room error:', error);
            alert('Failed to create room');
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeRoom) return;
        
        // Create new message
        const newMsg = {
            id: Date.now(), // Simple ID for demo
            sender: "You",
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };
        
        // Add message to current room
        setMessages(prev => ({
            ...prev,
            [activeRoom]: [...(prev[activeRoom] || []), newMsg]
        }));
        
        console.log('Message sent:', newMessage, 'to room:', activeRoom);
        setNewMessage("");
    };

    if (loading) {
        return (
            <div style={{ 
                height: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
            }}>
                Loading chat...
            </div>
        );
    }

    const activeRoomData = rooms.find(room => room._id === activeRoom);
    const activeMessages = messages[activeRoom] || [];

    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex',
            backgroundColor: 'white'
        }}>
            {/* Left Sidebar - Rooms List */}
            <div style={{
                width: '30%',
                backgroundColor: '#f0f0f0',
                borderRight: '1px solid #ddd',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    padding: '1rem',
                    backgroundColor: '#ededed',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ fontWeight: 'bold' }}>Chat Rooms</span>
                    <button
                        onClick={() => setShowCreateRoom(true)}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#25D366',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer'
                        }}
                    >
                        New Room
                    </button>
                </div>

                {/* Rooms List */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {rooms.map(room => (
                        <div
                            key={room._id}
                            onClick={() => {
                                console.log('Selecting room:', room._id);
                                setActiveRoom(room._id);
                            }}
                            style={{
                                padding: '1rem',
                                borderBottom: '1px solid #e0e0e0',
                                backgroundColor: activeRoom === room._id ? '#ebebeb' : 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{ fontWeight: 'bold' }}>{room.name}</div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                {room.description || 'No description'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Side - Active Chat */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Chat Header */}
                <div style={{
                    padding: '1rem',
                    backgroundColor: '#ededed',
                    borderBottom: '1px solid #ddd'
                }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {activeRoomData?.name || 'Select a room'}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        {activeRoom ? `${activeMessages.length} messages` : 'Please select a room'}
                    </div>
                </div>

                {/* Messages Area */}
                <div style={{
                    flex: 1,
                    padding: '1rem',
                    backgroundColor: '#fafafa',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}>
                    {activeMessages.length === 0 ? (
                        <div style={{
                            padding: '2rem',
                            textAlign: 'center',
                            color: '#666'
                        }}>
                            No messages yet. Start the conversation!
                        </div>
                    ) : (
                        activeMessages.map(message => (
                            <div
                                key={message.id}
                                style={{
                                    alignSelf: message.isMe ? 'flex-end' : 'flex-start',
                                    maxWidth: '70%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '18px',
                                    backgroundColor: message.isMe ? '#DCF8C6' : 'white',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}
                            >
                                {!message.isMe && (
                                    <div style={{ 
                                        fontSize: '0.8rem', 
                                        fontWeight: 'bold', 
                                        color: '#128C7E',
                                        marginBottom: '0.25rem'
                                    }}>
                                        {message.sender}
                                    </div>
                                )}
                                <div>{message.text}</div>
                                <div style={{ 
                                    fontSize: '0.7rem', 
                                    color: '#666', 
                                    textAlign: message.isMe ? 'right' : 'left',
                                    marginTop: '0.25rem'
                                }}>
                                    {message.time}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} style={{
                    padding: '1rem',
                    backgroundColor: '#ededed',
                    display: 'flex',
                    gap: '0.5rem'
                }}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={activeRoom ? "Type your message..." : "Select a room to chat"}
                        disabled={!activeRoom}
                        style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            border: '1px solid #ddd',
                            borderRadius: '20px',
                            fontSize: '16px',
                            outline: 'none'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!activeRoom || !newMessage.trim()}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: (activeRoom && newMessage.trim()) ? '#25D366' : '#ccc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: (activeRoom && newMessage.trim()) ? 'pointer' : 'not-allowed'
                        }}
                    >
                        Send
                    </button>
                </form>
            </div>

            {/* Create Room Modal */}
            {showCreateRoom && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '8px',
                        width: '400px'
                    }}>
                        <h3>Create New Room</h3>
                        <form onSubmit={handleCreateRoom} style={{ marginTop: '1rem' }}>
                            <input
                                type="text"
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                                placeholder="Room name"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    marginBottom: '1rem'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateRoom(false)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: '1px solid #ddd',
                                        backgroundColor: 'white',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#25D366',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
