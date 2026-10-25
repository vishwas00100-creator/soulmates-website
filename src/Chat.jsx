import React, { useEffect, useState, useRef } from 'react';
import {
  ArrowLeft,
  Send,
  MessageCircle,
  LoaderCircle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { supabase } from './supabaseClient.js';

export default function Chat({ profile, onBack }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const otherUserId = profile?.id;
  const otherUserName = profile?.full_name || 'Your Soulmate';

  async function loadMessages(showLoader = true) {
    if (!otherUserId) {
      setError('Please select a match to open the conversation.');
      setLoading(false);
      return;
    }

    if (showLoader) setLoading(true);
    setError('');

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setError('Please log in to use messaging.');
        setMessages([]);
        return;
      }

      setCurrentUserId(user.id);

      // Messages require a Supabase table named "messages"
      // with sender_id, receiver_id, content and created_at.
      const { data, error: messagesError } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, content, created_at')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      setMessages(data || []);
    } catch (err) {
      console.error('Loading messages failed:', err);
      setError(
        err.message ||
          'Could not load messages. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();

    if (!otherUserId) return undefined;

    const channel = supabase
      .channel(`chat-${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new;

          const belongsToConversation =
            (newMessage.sender_id === otherUserId &&
              newMessage.receiver_id === currentUserId) ||
            (newMessage.sender_id === currentUserId &&
              newMessage.receiver_id === otherUserId);

          if (belongsToConversation) {
            setMessages((previous) => {
              if (
                previous.some(
                  (message) => message.id === newMessage.id
                )
              ) {
                return previous;
              }

              return [...previous, newMessage].sort(
                (a, b) =>
                  new Date(a.created_at) -
                  new Date(b.created_at)
              );
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [otherUserId, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages]);

  async function sendMessage(event) {
    event.preventDefault();

    const content = messageText.trim();

    if (!content || sending || !otherUserId) return;

    setSending(true);
    setError('');

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error('Please log in before sending messages.');
      }

      const { data, error: insertError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: otherUserId,
          content,
        })
        .select('id, sender_id, receiver_id, content, created_at')
        .single();

      if (insertError) throw insertError;

      setMessages((previous) => {
        if (previous.some((message) => message.id === data.id)) {
          return previous;
        }

        return [...previous, data];
      });

      setMessageText('');
    } catch (err) {
      console.error('Sending message failed:', err);
      setError(
        err.message ||
          'Message could not be sent. Please try again.'
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="chat-page">
      <header className="chat-header">
        <button
          type="button"
          className="chat-back-button"
          onClick={onBack}
          aria-label="Back to matches"
        >
          <ArrowLeft size={21} />
        </button>

        <div className="chat-person-avatar">
          {(otherUserName.trim()[0] || 'S').toUpperCase()}
        </div>

        <div className="chat-person-details">
          <h2>{otherUserName}</h2>
          <p>
            <span className="chat-status-dot" />
            Your Soulmates conversation
          </p>
        </div>

        <button
          type="button"
          className="chat-refresh-button"
          onClick={() => loadMessages()}
          aria-label="Refresh conversation"
        >
          <RefreshCw size={18} />
        </button>
      </header>

      <div className="chat-messages">
        {loading ? (
          <div className="chat-status">
            <LoaderCircle className="spin" size={30} />
            <p>Loading conversation...</p>
          </div>
        ) : (
          <>
            <div className="chat-welcome">
              <div className="chat-welcome-icon">
                <HeartIcon />
              </div>
              <h3>Say hello to {otherUserName}!</h3>
              <p>
                Start a friendly conversation and get to know
                each other.
              </p>
            </div>

            {messages.map((message) => {
              const isMine =
                message.sender_id === currentUserId;

              return (
                <div
                  key={message.id}
                  className={`chat-message-row ${
                    isMine ? 'mine' : 'theirs'
                  }`}
                >
                  <div className="chat-message-bubble">
                    <p>{message.content}</p>
                    <time>
                      {message.created_at
                        ? new Date(
                            message.created_at
                          ).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </time>
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      {error && (
        <div className="chat-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form className="chat-compose" onSubmit={sendMessage}>
        <input
          type="text"
          value={messageText}
          onChange={(event) =>
            setMessageText(event.target.value)
          }
          placeholder="Write a thoughtful message..."
          maxLength={2000}
          disabled={loading || sending || !otherUserId}
          aria-label="Message"
        />

        <button
          type="submit"
          disabled={
            loading ||
            sending ||
            !messageText.trim() ||
            !otherUserId
          }
          aria-label="Send message"
        >
          {sending ? (
            <LoaderCircle className="spin" size={20} />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
    </section>
  );
}

function HeartIcon() {
  return <MessageCircle size={27} />;
            }
