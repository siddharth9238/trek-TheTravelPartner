import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { apiClient } from '../api/client';
import TravelNavbar from '../components/Layout/TravelNavbar';
import { useTranslation } from '../i18n';

export default function AiPlannerPage() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await apiClient.post('/ai/chat/blocking', { message: input });

      const data = response.data;
      if (data.error) {
        throw new Error(data.error);
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error: Failed to get response' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <TravelNavbar />
      <div className="mx-auto max-w-4xl p-4 md:p-6">
        <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">{t('ai.planner')}</h1>

        <div className="flex h-96 flex-col rounded-lg bg-white shadow dark:bg-slate-800">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="mt-8 text-center text-slate-500">
                <p>{t('ai.welcome')}</p>
                <p className="mt-2 text-sm">Try: "Plan a 5-day Dubai trip with ₹60,000 budget"</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'ml-auto bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100'
                }`}
              >
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                )}
              </div>
            ))}
            {loading && (
              <div className="max-w-[80%] rounded-lg bg-slate-200 p-3 dark:bg-slate-700">
                <span className="animate-pulse">...</span>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-200 p-4 dark:border-slate-700">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('ai.placeholder')}
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {t('ai.send')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
