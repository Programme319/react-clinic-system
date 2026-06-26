import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, MessageCircle, Send, X, Search, AlertTriangle } from 'lucide-react';
import supabase from '@/lib/supabase';
import { getOllamaConfigError } from '@/lib/ollamaConfig';
import { sendOllamaChat, buildPatientSystemPrompt } from '@/services/ollamaChat';
import './ChatWidget.css';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [patient, setPatient] = useState(null);
  const [investigations, setInvestigations] = useState([]);
  const [medications, setMedications] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const ollamaError = getOllamaConfigError();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const searchPatient = async () => {
    if (!ticketNumber.trim()) {
      setError('الرجاء إدخال رقم المريض');
      return;
    }

    if (!supabase) {
      setError('قاعدة البيانات غير متصلة');
      return;
    }

    setSearching(true);
    setError('');

    try {
      const patientId = parseInt(ticketNumber.trim(), 10);
      if (Number.isNaN(patientId)) {
        setError('رقم المريض يجب أن يكون رقماً');
        return;
      }

      const [patientRes, invRes, medRes] = await Promise.all([
        supabase.from('patients').select('*').eq('id', patientId).single(),
        supabase.from('patient_investigations').select('*').eq('patient_id', patientId),
        supabase.from('patient_medications').select('*').eq('patient_id', patientId),
      ]);

      if (patientRes.error || !patientRes.data) {
        setError('لم يتم العثور على المريض');
        return;
      }

      setPatient(patientRes.data);
      setInvestigations(invRes.data || []);
      setMedications(medRes.data || []);

      const { data: session } = await supabase
        .from('chatbot_sessions')
        .insert({ patient_id: patientId })
        .select()
        .single();

      setSessionId(session?.id || null);

      const greeting = {
        type: 'bot',
        text: `مرحباً! 👋 أنا مساعد ClinicCare الصحي. وجدت ملف المريض "${patientRes.data.name}". كيف يمكنني مساعدتك؟`,
      };

      setMessages([greeting]);
      setTicketNumber('');
    } catch (err) {
      setError('خطأ في البحث. حاول مرة أخرى.');
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const logMessage = useCallback(async (sender, message, isEmergency = false) => {
    if (!supabase || !sessionId) return;
    await supabase.from('chatbot_messages').insert({
      session_id: sessionId,
      sender,
      message,
      is_emergency_detected: isEmergency,
    });
  }, [sessionId]);

  const detectEmergency = (text) => {
    const keywords = ['طوارئ', 'emergency', 'ألم شديد', 'chest pain', 'لا أتنفس', "can't breathe", 'إغماء', 'fainting'];
    const lower = text.toLowerCase();
    return keywords.some((k) => lower.includes(k.toLowerCase()));
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !patient || loading) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setMessages((prev) => [...prev, { type: 'user', text: userText }]);
    setLoading(true);
    setError('');

    await logMessage('patient', userText);

    const isEmergency = detectEmergency(userText);

    if (isEmergency) {
      const emergencyReply =
        '⚠️ يبدو أنك تصف حالة طارئة. يرجى التوجه فوراً إلى أقرب قسم طوارئ أو الاتصال بالإسعاف. هذا المساعد لا يغني عن الرعاية الطبية العاجلة.';
      setMessages((prev) => [...prev, { type: 'bot', text: emergencyReply }]);
      await logMessage('ai', emergencyReply, true);
      setLoading(false);
      return;
    }

    if (ollamaError) {
      setError(ollamaError);
      setLoading(false);
      return;
    }

    try {
      const chatHistory = messages
        .filter((m) => m.type === 'user' || m.type === 'bot')
        .map((m) => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));

      chatHistory.push({ role: 'user', content: userText });

      const ollamaMessages = [
        { role: 'system', content: buildPatientSystemPrompt(patient, investigations, medications) },
        ...chatHistory,
      ];

      const reply = await sendOllamaChat(ollamaMessages);

      setMessages((prev) => [...prev, { type: 'bot', text: reply }]);
      await logMessage('ai', reply);
    } catch (err) {
      const errMsg = err.message || 'حدث خطأ في الاتصال بالذكاء الاصطناعي';
      setError(errMsg);
      setMessages((prev) => [
        ...prev,
        { type: 'bot', text: `عذراً، ${errMsg}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setPatient(null);
    setInvestigations([]);
    setMedications([]);
    setSessionId(null);
    setMessages([]);
    setTicketNumber('');
    setError('');
  };

  return (
    <div className="chat-widget">
      <button
        type="button"
        className={`chat-widget__fab ${isOpen ? 'chat-widget__fab--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="المساعد الصحي"
        aria-label="Open health assistant"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={24} />}
      </button>

      {isOpen && (
        <div className="chat-widget__panel">
          <div className="chat-widget__header">
            <div className="chat-widget__header-info">
              <h3>🏥 المساعد الصحي</h3>
              <p>مدعوم بـ Ollama Cloud AI</p>
            </div>
            <button type="button" className="chat-widget__close" onClick={() => setIsOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="chat-widget__body">
            {ollamaError && !patient && (
              <div className="chat-widget__config-warn">
                <AlertTriangle size={14} style={{ display: 'inline', marginLeft: 4 }} />
                {ollamaError}
              </div>
            )}

            {!patient ? (
              <div className="chat-widget__search">
                <p className="chat-widget__search-label">ابحث برقم المريض (Ticket #)</p>
                <div className="chat-widget__search-row">
                  <input
                    type="text"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchPatient()}
                    placeholder="مثال: 1"
                    disabled={searching}
                    className="chat-widget__search-input"
                  />
                  <button
                    type="button"
                    onClick={searchPatient}
                    disabled={searching}
                    className="btn btn-primary btn-sm"
                  >
                    <Search size={16} />
                    {searching ? '…' : 'بحث'}
                  </button>
                </div>
                {error && <div className="chat-widget__error">{error}</div>}
              </div>
            ) : (
              <>
                <div className="chat-widget__patient-card">
                  <h4>معلومات المريض</h4>
                  <div className="chat-widget__info-row">
                    <span className="chat-widget__info-label">الاسم</span>
                    <span className="chat-widget__info-value">{patient.name}</span>
                  </div>
                  <div className="chat-widget__info-row">
                    <span className="chat-widget__info-label">الرقم</span>
                    <span className="chat-widget__info-value">#{patient.id}</span>
                  </div>
                  {patient.phone && (
                    <div className="chat-widget__info-row">
                      <span className="chat-widget__info-label">الهاتف</span>
                      <span className="chat-widget__info-value">{patient.phone}</span>
                    </div>
                  )}
                  <button type="button" onClick={resetChat} className="chat-widget__reset-btn">
                    بحث عن مريض آخر
                  </button>
                </div>

                <div className="chat-widget__messages">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-widget__bubble chat-widget__bubble--${msg.type}`}>
                      {msg.text}
                    </div>
                  ))}
                  {loading && (
                    <div className="chat-widget__bubble chat-widget__bubble--bot chat-widget__bubble--loading">
                      <Bot size={14} style={{ display: 'inline', marginLeft: 4 }} />
                      جاري الكتابة…
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {error && <div className="chat-widget__error">{error}</div>}
              </>
            )}
          </div>

          {patient && (
            <div className="chat-widget__input-row">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="اكتب سؤالك…"
                disabled={loading}
                className="chat-widget__input"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || !inputMessage.trim()}
                className="chat-widget__send"
              >
                <Send size={18} />
              </button>
            </div>
          )}

          <div className="chat-widget__footer">
            ⚠️ هذا مساعد AI — لا يغني عن استشارة الطبيب
          </div>
        </div>
      )}
    </div>
  );
}
