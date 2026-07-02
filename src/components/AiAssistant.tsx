import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";

import { sendAiChatMessage } from "../api/aiApi";
import { useAuth } from "../context/AuthContext";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function renderInlineText(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return <span key={index}>{part}</span>;
  });
}

function renderFormattedMessage(content: string) {
  const lines = content
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line, index) => {
    if (line.startsWith("### ")) {
      return (
        <h4 className="ai-message-heading" key={index}>
          {renderInlineText(line.replace("### ", ""))}
        </h4>
      );
    }

    if (line.startsWith("## ")) {
      return (
        <h4 className="ai-message-heading" key={index}>
          {renderInlineText(line.replace("## ", ""))}
        </h4>
      );
    }

    if (line.startsWith("# ")) {
      return (
        <h4 className="ai-message-heading" key={index}>
          {renderInlineText(line.replace("# ", ""))}
        </h4>
      );
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <p className="ai-message-list-item" key={index}>
          <span>•</span>
          {renderInlineText(line.slice(2))}
        </p>
      );
    }

    if (/^\d+\.\s/.test(line)) {
      return (
        <p className="ai-message-list-item" key={index}>
          <span>{line.split(".")[0]}.</span>
          {renderInlineText(line.replace(/^\d+\.\s/, ""))}
        </p>
      );
    }

    return (
      <p className="ai-message-paragraph" key={index}>
        {renderInlineText(line)}
      </p>
    );
  });
}

function AiAssistant() {
  const location = useLocation();
  const { isAuthenticated, token, user } = useAuth();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I am your LearnTrack AI Assistant. Ask me doubts about courses, quizzes, coding, or study topics.",
    },
  ]);

  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isSending]);

  if (!isAuthenticated || !token) {
    return null;
  }

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = messageText.trim();

    if (!trimmedMessage || !token) {
      return;
    }

    const pageContext = `Current page: ${location.pathname}
Logged in user: ${user?.name || "User"}
Role: ${user?.role || "Unknown"}`;

    try {
      setIsSending(true);
      setErrorMessage("");
      setMessageText("");

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "user",
          content: trimmedMessage,
        },
      ]);

      const reply = await sendAiChatMessage(trimmedMessage, pageContext, token);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to get AI response right now.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="ai-assistant">
      {isOpen && (
        <div className="ai-chat-panel">
          <div className="ai-chat-header">
            <div>
              <p className="small-heading">AI ASSISTANT</p>
              <h3>LearnTrack AI</h3>
            </div>

            <button
              type="button"
              className="ai-close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close AI assistant"
            >
              ×
            </button>
          </div>

          <div className="ai-chat-messages">
            {messages.map((message, index) => (
              <div
                className={
                  message.role === "user"
                    ? "ai-message ai-user-message"
                    : "ai-message ai-bot-message"
                }
                key={`${message.role}-${index}`}
              >
                {message.role === "assistant"
                  ? renderFormattedMessage(message.content)
                  : message.content}
              </div>
            ))}

            {isSending && (
              <div className="ai-message ai-bot-message ai-thinking-message">
                <span />
                <span />
                <span />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {errorMessage && <p className="ai-error-text">{errorMessage}</p>}

          <form className="ai-chat-form" onSubmit={handleSendMessage}>
            <textarea
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              placeholder="Ask a study doubt..."
              maxLength={1000}
              rows={1}
            />

            <button type="submit" disabled={isSending || !messageText.trim()}>
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className={
          isOpen
            ? "ai-floating-button ai-floating-button-open"
            : "ai-floating-button"
        }
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
      >
        {isOpen ? (
          <span className="ai-floating-close">×</span>
        ) : (
          <>
            <span className="ai-floating-glow" />
            <span className="ai-floating-icon">
              <svg viewBox="0 0 64 64" role="img" aria-hidden="true">
                <path d="M32 7l3.1 8.9L44 19l-8.9 3.1L32 31l-3.1-8.9L20 19l8.9-3.1L32 7z" />
                <path d="M49 30l1.7 4.8L55 36.5l-4.3 1.7L49 43l-1.7-4.8L43 36.5l4.3-1.7L49 30z" />
                <rect x="15" y="25" width="34" height="26" rx="12" />
                <circle cx="26" cy="38" r="3" />
                <circle cx="38" cy="38" r="3" />
                <path d="M27 45h10" />
                <path d="M32 20v5" />
              </svg>
            </span>
          </>
        )}
      </button>
    </div>
  );
}

export default AiAssistant;