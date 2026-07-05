import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import TravelNavbar from '../components/Layout/TravelNavbar';
import { useTranslation } from '../i18n';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3005';

export default function VoiceAssistantPage() {
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [command, setCommand] = useState('');
  const [result, setResult] = useState<any>(null);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setCommand(transcript);
      setIsListening(false);
      handleCommand(transcript);
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
    setIsListening(true);
  };

  const handleCommand = async (cmd: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/voice/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: cmd }),
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({ error: 'Failed to process command' });
    }
  };

  const suggestedCommands = [
    'Plan my Dubai trip',
    'Find hotels in Paris',
    'Search flights to Tokyo',
    'Calculate taxi fare',
    'Show weather in Bali',
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <TravelNavbar />
      <div className="mx-auto max-w-4xl p-4 md:p-6">
        <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">{t('voice.title')}</h1>

        <div className="mb-6 rounded-lg bg-white p-6 text-center shadow dark:bg-slate-800">
          <button
            onClick={startListening}
            disabled={isListening}
            className={`mx-auto mb-4 h-32 w-32 rounded-full ${
              isListening ? 'animate-pulse bg-red-500' : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isListening ? '🔴' : '🎤'}
          </button>
          <p className="text-slate-600 dark:text-slate-400">
            {isListening ? 'Listening...' : 'Click to start speaking'}
          </p>
          {command && (
            <div className="mt-4 rounded-md bg-slate-100 p-4 dark:bg-slate-700">
              <p className="font-medium">{command}</p>
            </div>
          )}
        </div>

        <div className="mb-4">
          <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{t('voice.suggested')}</h2>
          <div className="flex flex-wrap gap-2">
            {suggestedCommands.map((cmd) => (
              <button
                key={cmd}
                onClick={() => handleCommand(cmd)}
                className="rounded-md bg-slate-200 px-4 py-2 text-sm hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {result && (
          <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
            <h2 className="mb-4 text-lg font-semibold">Result</h2>
            <div className="rounded-md bg-slate-100 p-4 text-sm dark:bg-slate-700">
              {result.success ? (
                <div>
                  <p className="mb-2 font-medium text-green-600 dark:text-green-400">
                    Action: {result.action || 'none'}
                  </p>
                  <ReactMarkdown>{result.message}</ReactMarkdown>
                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-slate-500">View details</summary>
                      <pre className="mt-2 overflow-x-auto text-xs">{JSON.stringify(result.data, null, 2)}</pre>
                    </details>
                  )}
                </div>
              ) : (
                <p className="text-red-500">{result.error || result.message}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
