import React, { useState, useRef, useEffect } from 'react';
import './ChatWidget.css';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [ticketNumber, setTicketNumber] = useState('');
    const [patientInfo, setPatientInfo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const searchPatient = async () => {
        if (!ticketNumber.trim()) {
            setError('الرجاء إدخال رقم التذكرة');
            return;
        }

        setSearching(true);
        setError('');

        try {
            const response = await fetch(`/api/patient/${ticketNumber}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.success) {
                setPatientInfo(data.patient);
                setMessages([
                    {
                        type: 'bot',
                        text: `مرحباً! 👋 أنا مساعدك الصحي. لقد وجدت بيانات المريض ${data.patient.full_name}. كيف يمكنني مساعدتك اليوم؟`
                    }
                ]);
                setTicketNumber('');
            } else {
                setError(data.message || 'لم يتم العثور على المريض');
            }
        } catch (err) {
            console.error('Search error:', err);
            setError('خطأ في البحث عن المريض. تأكد من رقم التذكرة.');
        } finally {
            setSearching(false);
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || !patientInfo) return;

        const userMsg = inputMessage;
        setInputMessage('');

        // Add user message to chat
        setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
        setLoading(true);
        setError('');

        try {
            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || ''
                },
                body: JSON.stringify({
                    patient_id: patientInfo.id,
                    message: userMsg
                })
            });

            // Get response text first
            const responseText = await response.text();
            console.log('Raw response:', responseText);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${responseText}`);
            }

            // Try to parse JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                console.error('Response text:', responseText);
                throw new Error('خطأ في معالجة الرد من الخادم: ' + parseError.message);
            }

            if (data.success) {
                setMessages(prev => [...prev, { type: 'bot', text: data.reply }]);
            } else {
                setError(data.message || 'حدث خطأ في الحصول على الرد');
                setMessages(prev => [...prev, {
                    type: 'bot',
                    text: data.message || 'عذراً، حدث خطأ. الرجاء المحاولة مرة أخرى.'
                }]);
            }
        } catch (err) {
            console.error('Chat error:', err);
            setError(err.message || 'خطأ في الاتصال بالخادم');
            setMessages(prev => [...prev, {
                type: 'bot',
                text: 'عذراً، حدث خطأ: ' + (err.message || 'خطأ غير معروف')
            }]);
        } finally {
            setLoading(false);
        }
    };

    const resetChat = () => {
        setPatientInfo(null);
        setMessages([]);
        setTicketNumber('');
        setError('');
    };

    return (
        <div className="chat-widget">
            {/* Floating Button */}
            <button
                className="chat-widget-button"
                onClick={() => setIsOpen(!isOpen)}
                title="فتح المساعد الصحي"
            >
                💬
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    {/* Header */}
                    <div className="chat-header">
                        <h3>🏥 المساعد الصحي</h3>
                        <button
                            className="close-button"
                            onClick={() => setIsOpen(false)}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div className="chat-content">
                        {!patientInfo ? (
                            // Search Patient
                            <div className="search-section">
                                <p className="search-title">بحث عن المريض</p>
                                <div className="search-input-group">
                                    <input
                                        type="text"
                                        value={ticketNumber}
                                        onChange={(e) => setTicketNumber(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && searchPatient()}
                                        placeholder="أدخل رقم التذكرة (رقم المريض)"
                                        disabled={searching}
                                        className="search-input"
                                    />
                                    <button
                                        onClick={searchPatient}
                                        disabled={searching}
                                        className="search-button"
                                    >
                                        {searching ? 'جاري البحث...' : 'بحث'}
                                    </button>
                                </div>
                                {error && <p className="error-message">{error}</p>}
                            </div>
                        ) : (
                            <>
                                {/* Patient Info */}
                                <div className="patient-info">
                                    <h4>معلومات المريض</h4>
                                    <div className="info-item">
                                        <span className="label">الاسم:</span>
                                        <span className="value">{patientInfo.full_name}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">العمر:</span>
                                        <span className="value">{patientInfo.age} سنة</span>
                                    </div>
                                    {patientInfo.diagnosis_text && (
                                        <div className="info-item">
                                            <span className="label">التشخيص:</span>
                                            <span className="value">{patientInfo.diagnosis_text}</span>
                                        </div>
                                    )}
                                    {patientInfo.doctor_name && (
                                        <div className="info-item">
                                            <span className="label">الطبيب:</span>
                                            <span className="value">{patientInfo.doctor_name}</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={resetChat}
                                        className="reset-button"
                                    >
                                        بحث عن مريض آخر
                                    </button>
                                </div>

                                {/* Messages */}
                                <div className="messages-container">
                                    {messages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`message ${msg.type}`}
                                        >
                                            {msg.text}
                                        </div>
                                    ))}
                                    {loading && <div className="message bot loading">جاري الرد...</div>}
                                    <div ref={messagesEndRef} />
                                </div>

                                {error && <p className="error-message">{error}</p>}

                                {/* Input */}
                                <div className="message-input-group">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder="اكتب سؤالك..."
                                        disabled={loading}
                                        className="message-input"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={loading || !inputMessage.trim()}
                                        className="send-button"
                                    >
                                        {loading ? '...' : '➤'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="chat-footer">
                        <small>⚠️ هذا مساعد لا يحل محل الاستشارة الطبية</small>
                    </div>
                </div>
            )}
        </div>
    );
}
