import React, { useState } from 'react';
import { MessageSquare, Send, Reply, X, User, ShieldCheck } from 'lucide-react';
import { ProjectMessage, AuthSession } from '../types';

interface ProjectChatProps {
  projectId: string;
  projectTitle: string;
  messages: ProjectMessage[];
  session: AuthSession;
  onSendMessage: (content: string, replyToId: string | null) => Promise<void>;
}

export const ProjectChat: React.FC<ProjectChatProps> = ({
  projectId,
  projectTitle,
  messages,
  session,
  onSendMessage,
}) => {
  const [content, setContent] = useState('');
  const [replyTarget, setReplyTarget] = useState<ProjectMessage | null>(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    try {
      await onSendMessage(content.trim(), replyTarget ? replyTarget.id : null);
      setContent('');
      setReplyTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[520px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
      {/* Chat header */}
      <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-100">
              گفت‌وگوی اختصاصی و پاسخگویی پروژه فرنیو
            </h4>
            <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
              ارتباط مستقیم خریدار و مدیر کارخانه درباره: {projectTitle}
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
          {messages.length} پیام
        </span>
      </div>

      {/* Messages list area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-900/60">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <MessageSquare className="w-10 h-10 stroke-[1.5] text-slate-600 mb-2" />
            <p className="text-xs sm:text-sm font-medium text-slate-300">
              هنوز پیامی برای این پروژه ثبت نشده است.
            </p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
              مشتری می‌تواند سوالات، هماهنگی‌ها یا نظرات خود را درباره مراحل ساخت اینجا ارسال نماید و مدیر کارخانه مستقیماً پاسخ می‌دهد.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe =
              (session.role === 'admin' && msg.sender === 'admin') ||
              (session.role === 'customer' && msg.sender === 'customer');

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-start' : 'items-end'} group`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-sm text-xs sm:text-sm ${
                    msg.sender === 'admin'
                      ? 'bg-red-950/40 border border-red-800/60 text-slate-100'
                      : 'bg-slate-800/90 border border-slate-700 text-slate-100'
                  }`}
                >
                  {/* Sender title */}
                  <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-white/10 text-[11px]">
                    <span className="font-bold flex items-center gap-1.5">
                      {msg.sender === 'admin' ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                          <span className="text-red-300">{msg.senderName}</span>
                          <span className="text-[9px] bg-red-900/50 text-red-200 border border-red-700/50 px-1.5 py-0.2 rounded font-normal">
                            مدیریت کارخانه فرنیو
                          </span>
                        </>
                      ) : (
                        <>
                          <User className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">{msg.senderName}</span>
                        </>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                      {msg.createdAt}
                    </span>
                  </div>

                  {/* Quoted Reply Preview */}
                  {msg.replyToContent && (
                    <div className="mb-2 p-2 rounded-lg bg-slate-950/70 border-r-2 border-red-500 text-[11px] text-slate-400 line-clamp-2">
                      <span className="font-semibold text-red-400 block mb-0.5">
                        در پاسخ به:
                      </span>
                      {msg.replyToContent}
                    </div>
                  )}

                  {/* Message body */}
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                  {/* Reply button action */}
                  <div className="mt-2 pt-1 flex justify-end">
                    <button
                      onClick={() => setReplyTarget(msg)}
                      className="text-[10px] font-semibold flex items-center gap-1 text-slate-400 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      <Reply className="w-3 h-3" />
                      <span>پاسخ (ریپلای)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reply target banner if active */}
      {replyTarget && (
        <div className="px-4 py-2 bg-slate-950 border-t border-red-800/40 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2 truncate">
            <Reply className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="text-red-400 font-bold shrink-0">
              پاسخ به {replyTarget.senderName}:
            </span>
            <span className="text-slate-400 truncate">{replyTarget.content}</span>
          </div>
          <button
            onClick={() => setReplyTarget(null)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input box */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-950 border-t border-slate-800">
        <div className="flex gap-2">
          <input
            id="chat-message-input"
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              session.role === 'admin'
                ? 'پاسخ مدیریت فرنیو به خریدار گاوصندوق...'
                : 'پیام، استعلام یا پرسش خود درباره این پروژه را بنویسید...'
            }
            className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-slate-500 transition-colors"
          />
          <button
            id="send-message-btn"
            type="submit"
            disabled={!content.trim() || sending}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-red-950/40 cursor-pointer"
          >
            {sending ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5 rotate-180" />
                <span className="hidden sm:inline">ارسال</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
