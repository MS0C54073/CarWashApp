import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';
import { useState } from 'react';
import ChatWindow from '../chat/ChatWindow';
import './ConversationsManager.css';

interface Conversation {
    bookingId: string;
    lastMessage: string;
    lastSender: string;
    lastTime: string;
    participants: {
        id: string;
        name: string;
        role: string;
    }[];
    unreadCount: number;
}

const ConversationsManager = () => {
    const [selectedChat, setSelectedChat] = useState<{
        bookingId: string;
        receiverId: string;
        receiverName: string;
    } | null>(null);

    const { data: conversations, isLoading } = useQuery({
        queryKey: ['admin-conversations'],
        queryFn: async () => {
            const response = await api.get('/chat/conversations');
            return response.data.data;
        },
        refetchInterval: 10000,
    });

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="conversations-manager">
            <h3>All Support Chats</h3>
            <div className="conversations-list">
                {!conversations || conversations.length === 0 ? (
                    <div className="empty-state">No active conversations found</div>
                ) : (
                    conversations.map((conv: Conversation) => {
                        // Find participant who is NOT the current viewer (admin)
                        // But since admin can be anyone, let's just show everyone
                        const otherParticipants = conv.participants.map(p => p.name).join(' & ');

                        return (
                            <div
                                key={conv.bookingId}
                                className={`conversation-item ${selectedChat?.bookingId === conv.bookingId ? 'active' : ''}`}
                                onClick={() => setSelectedChat({
                                    bookingId: conv.bookingId,
                                    receiverId: conv.participants[0].id, // Just pick first one for now
                                    receiverName: otherParticipants
                                })}
                            >
                                <div className="conv-info">
                                    <div className="conv-participants">{otherParticipants}</div>
                                    <div className="conv-last-msg">{conv.lastMessage}</div>
                                </div>
                                <div className="conv-meta">
                                    <div className="conv-time">{new Date(conv.lastTime).toLocaleDateString()}</div>
                                    {conv.unreadCount > 0 && <span className="conv-unread">{conv.unreadCount}</span>}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {selectedChat && (
                <ChatWindow
                    bookingId={selectedChat.bookingId}
                    receiverId={selectedChat.receiverId}
                    receiverName={selectedChat.receiverName}
                    onClose={() => setSelectedChat(null)}
                />
            )}
        </div>
    );
};

export default ConversationsManager;
