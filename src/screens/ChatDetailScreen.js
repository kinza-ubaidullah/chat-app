import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput,
    TouchableOpacity, KeyboardAvoidingView, Platform, Image, SafeAreaView, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { fetchSystemSetting, fetchUserUsage, fetchChatHistory } from '../lib/dataService';
import VoiceCallModal from '../components/VoiceCallModal';
import TopUpModal from '../components/TopUpModal';

const ChatDetailScreen = ({ route, navigation }) => {
    const { advisor } = route.params;
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(true);

    const [n8nApiKey, setN8nApiKey] = useState("");
    const [usage, setUsage] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState('User');
    const [showCallModal, setShowCallModal] = useState(false);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const scrollViewRef = useRef();

    // 1. DATA FETCHING: Align with ConsultationPage.tsx
    useEffect(() => {
        const initChat = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return navigation.navigate('Login');

                setUserId(session.user.id);

                const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

                const [apiKey, userUsage, history, profileRes] = await Promise.all([
                    fetchSystemSetting("N8N_API_KEY"),
                    fetchUserUsage(session.user.id),
                    fetchChatHistory(session.user.id, advisor.id, twentyFourHoursAgo),
                    supabase.from('profiles').select('full_name').eq('id', session.user.id).maybeSingle()
                ]);

                if (apiKey) setN8nApiKey(apiKey);
                if (userUsage) setUsage(userUsage);
                if (profileRes.data?.full_name) setUserName(profileRes.data.full_name.split(' ')[0]);

                // Sync history - If history exists, AI will remember via sessionId
                if (history && history.length > 0) {
                    setMessages(history);
                }
            } catch (err) {
                console.error("Chat init error:", err);
            } finally {
                setLoading(false);
            }
        };
        initChat();
    }, [advisor.id]);

    // 2. LOGIC: Handle Send Message (Fixing the Introduction Loop + Persistence)
    const handleSendMessage = async () => {
        if (!input.trim() || isTyping || !advisor) return;

        // Check Credits (Matches Web Line 252)
        const totalCredits = (usage?.messages_left || 0) + (usage?.custom_messages_balance || 0);
        if (totalCredits <= 0) {
            Alert.alert("Limit Reached", "Please top up your credits to continue.");
            return;
        }

        const text = input.trim();
        if (!userId) return;

        const userMsg = { role: "user", content: text };
        const updatedMessages = [...messages, userMsg];

        setInput(""); // Clear input immediately
        setMessages(updatedMessages);
        setIsTyping(true);

        try {
            /**
             * THE PERMANENT FIX:
             * 1. sessionId & chatId: Ensuring unique identifiers for memory.
             * 2. History: Sending previous messages directly to the agent in a clean format.
             * 3. Persistence: Manual entry to chat_history table.
             */
            const sessionId = `${userId}_${advisor.id}`;

            // Map history to standard format for AI nodes
            const historyPayload = updatedMessages.slice(-10).map(m => ({
                role: m.role === 'ai' ? 'assistant' : 'user',
                content: m.content
            }));

            // Save User Message to Supabase
            supabase.from("chat_history").insert([
                { user_id: userId, advisor_id: advisor.id, role: 'user', content: text }
            ]).then(({ error }) => {
                if (error) console.log("User history sync error:", error);
            });

            const res = await fetch(advisor.n8n_webhook_path, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-N8N-API-KEY": n8nApiKey
                },
                body: JSON.stringify({
                    message: text,
                    chatInput: text,
                    agentId: advisor.id,
                    userId: userId,
                    advisorName: advisor.name,
                    userName: userName,
                    sessionId: sessionId,
                    chatId: sessionId,
                    history: historyPayload // context-aware memory
                }),
            });

            const aiData = await res.json();
            const aiContent = aiData?.output || aiData?.message || aiData?.text || aiData?.response;

            // Update UI & Persist AI Response
            if (aiContent) {
                setMessages(prev => [...prev, { role: "ai", content: aiContent }]);

                supabase.from("chat_history").insert([
                    { user_id: userId, advisor_id: advisor.id, role: 'ai', content: aiContent }
                ]).then(({ error }) => {
                    if (error) console.log("AI history sync error:", error);
                });
            }

            // Sync Usage immediately like web
            const updatedUsage = await fetchUserUsage(userId);
            if (updatedUsage) setUsage(updatedUsage);

        } catch (err) {
            console.log("Chat Error:", err);
            setMessages(prev => [...prev, { role: "ai", content: "⚠️ Connection to advisor timed out. Please try again." }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;

    return (
        <View style={styles.container}>
            {/* Premium Header (Website Aesthetics) */}
            <SafeAreaView style={styles.headerSafeArea}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={24} color={Colors.white} /></TouchableOpacity>
                        <Image source={{ uri: advisor.image_url }} style={styles.avatar} />
                        <View>
                            <Text style={styles.name}>{advisor.name}</Text>
                            <View style={styles.badge}>
                                <Ionicons name="sparkles" size={10} color={Colors.primary} />
                                <Text style={styles.badgeText}>{advisor.specialty}</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.callCircle} onPress={() => setShowTopUpModal(true)}>
                        <Ionicons name="call" size={18} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView
                ref={scrollViewRef}
                onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
                style={styles.chatArea}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {/* Web's Initial Welcome Prompt (Only if no messages) */}
                {messages.length === 0 && (
                    <View style={[styles.bubble, styles.aiBubble]}>
                        <Text style={styles.aiText}>
                            Hey! I'm {advisor.name}. I've got your records open. What's the latest update in your dating world?
                        </Text>
                    </View>
                )}

                {messages.map((m, i) => (
                    <View key={i} style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                        <Text style={[styles.msgText, m.role === 'user' ? styles.userText : styles.aiText]}>{m.content}</Text>
                    </View>
                ))}
                {isTyping && (
                    <View style={styles.thinking}>
                        <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                        <Text style={styles.thinkingText}>{advisor.name} is thinking...</Text>
                    </View>
                )}
            </ScrollView>

            {/* Voice Call Modal Integration */}
            <VoiceCallModal
                visible={showCallModal}
                onClose={() => setShowCallModal(false)}
                advisor={advisor}
                userId={userId}
                onRequireTopUp={() => {
                    setShowCallModal(false);
                    setShowTopUpModal(true);
                }}
            />

            <TopUpModal
                visible={showTopUpModal}
                onClose={() => setShowTopUpModal(false)}
                onTopUp={() => navigation.navigate('CreditTopup')}
                onStartCall={() => setShowCallModal(true)}
                minutesBalance={usage?.voice_minutes_left || 0}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <View style={styles.footer}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder={`Consult with ${advisor.name}...`}
                            value={input}
                            onChangeText={setInput}
                            multiline
                            placeholderTextColor="#9CA3AF"
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, !input.trim() && { opacity: 0.5 }]}
                            onPress={handleSendMessage}
                            disabled={!input.trim() || isTyping}
                        >
                            {isTyping ? <ActivityIndicator color="#FFF" size="small" /> : <Ionicons name="send" size={20} color="#FFF" />}
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.usageInfo}>{(usage?.messages_left || 0).toFixed(0)} MESSAGES REMAINING</Text>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

// Styles (Website Aesthetics)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    headerSafeArea: { backgroundColor: Colors.secondary },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: Colors.secondary,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    avatar: { width: 50, height: 50, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    name: { color: Colors.white, fontSize: 18, fontWeight: '800' },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    badgeText: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
    callCircle: { padding: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16 },
    chatArea: { flex: 1, padding: 15 },
    bubble: { maxWidth: '85%', padding: 18, borderRadius: 28, marginBottom: 15 },
    userBubble: { alignSelf: 'flex-end', backgroundColor: Colors.secondary, borderBottomRightRadius: 4 },
    aiBubble: { alignSelf: 'flex-start', backgroundColor: Colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border },
    msgText: { fontSize: 15, lineHeight: 22 },
    userText: { color: Colors.white },
    aiText: { color: Colors.text },
    thinking: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 15, marginBottom: 20 },
    thinkingText: { fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic' },
    footer: { padding: 20, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.inputBackground, borderRadius: 30, padding: 6, paddingLeft: 20 },
    input: { flex: 1, paddingVertical: 10, fontSize: 15, maxHeight: 120, color: Colors.text },
    sendBtn: { width: 44, height: 44, backgroundColor: Colors.primary, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    usageInfo: { textAlign: 'center', fontSize: 10, color: Colors.textSecondary, marginTop: 12, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }
});

export default ChatDetailScreen;
