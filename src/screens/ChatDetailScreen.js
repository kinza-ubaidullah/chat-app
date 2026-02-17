import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator, Alert, Image } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import { supabase } from '../lib/supabase';
import VoiceCallModal from '../components/VoiceCallModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ChatDetailScreen = ({ route, navigation }) => {
    const { name, id: advisorId, image_url, initialContext } = route.params || { name: 'Advisor', id: null }; // Added image_url and initialContext
    const [message, setMessage] = useState(initialContext || ''); // Pre-fill if context provided as message text? Or just logic.
    const [userProfile, setUserProfile] = useState(null);
    const [isTyping, setIsTyping] = useState(false);

    // Missing state variables
    const [messages, setMessages] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [n8nApiKey, setN8nApiKey] = useState(null);
    const [userUsage, setUserUsage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const scrollViewRef = useRef();

    useEffect(() => {
        let channel;

        const initializeChat = async () => {
            try {
                // 1. Get current user session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    Alert.alert('Authentication Required', 'Please log in to chat');
                    navigation.navigate('Login');
                    return;
                }

                setCurrentUser(session.user);

                // 2. Fetch User Profile & Persona (DEEP INTEGRATION)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, persona_analysis')
                    .eq('id', session.user.id)
                    .single();

                setUserProfile(profile);

                // 3. Fetch n8n API key from system_settings
                const { data: n8nData } = await supabase
                    .from('system_settings')
                    .select('key_value')
                    .eq('key_name', 'N8N_API_KEY')
                    .single();

                if (n8nData?.key_value) setN8nApiKey(n8nData.key_value);

                // 4. Fetch user usage/credits
                const { data: usageData } = await supabase
                    .from('user_usage')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .single();

                if (usageData) setUserUsage(usageData);

                // 5. Fetch chat history (Most recent 50 messages)
                const { data: historyData, error: fetchError } = await supabase
                    .from('chat_history')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .eq('advisor_id', advisorId)
                    .order('created_at', { ascending: true })
                    .limit(50);

                if (fetchError) {
                    setError('Failed to load chat history.');
                } else if (historyData && historyData.length > 0) {
                    setMessages(historyData);
                } else {
                    // Personalized Welcome message based on analysis
                    let welcomeContent = `Hey! I'm ${name}. I've got your records open. What's the latest update in your dating world?`;

                    if (profile?.persona_analysis && Object.keys(profile.persona_analysis).length > 0) {
                        const style = profile.persona_analysis.dating_style || "interesting";
                        welcomeContent = `Hey! I'm ${name}. I've just reviewed your analysis and your ${style} style is quite unique! How can I help you sharpen your strategy today?`;
                    }

                    setMessages([{
                        id: 'welcome',
                        role: 'ai',
                        content: welcomeContent,
                        created_at: new Date().toISOString()
                    }]);
                }

                setLoading(false);

                // 6. Realtime Listener REMOVED to match website flow (Request/Response)
                // We now handle state updates manually in handleSend.

            } catch (err) {
                console.error('Chat init error:', err);
                setError('Failed to initialize chat.');
                setLoading(false);
            }
        };

        initializeChat();

        return () => {
            // Cleanup if needed
        };
    }, [advisorId]);

    const handleSend = async () => {
        if (!message.trim() || !currentUser || !advisorId) return;

        const messageText = message.trim();
        setMessage('');

        // 1. Credit Check
        const totalCredits = (userUsage?.messages_left || 0) + (userUsage?.custom_messages_balance || 0);
        if (totalCredits <= 0) {
            Alert.alert('Out of Credits', "Please top up to continue.", [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Top Up', onPress: () => navigation.navigate('Subscription') }
            ]);
            setMessage(messageText);
            return;
        }

        // 2. Optimistic UI update for USER message
        const tempUserMsg = {
            id: `temp_${Date.now()}`,
            role: 'user',
            content: messageText,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempUserMsg]);
        setIsTyping(true);

        try {
            // 3. Save User Message to DB
            const { error: saveError } = await supabase
                .from('chat_history')
                .insert({
                    user_id: currentUser.id,
                    advisor_id: advisorId,
                    role: 'user',
                    content: messageText
                });

            // 3b. Deduct Credit (Website Logic)
            if (userUsage?.messages_left > 0) {
                await supabase.from('user_usage').update({
                    messages_left: userUsage.messages_left - 1,
                    updated_at: new Date().toISOString()
                }).eq('user_id', currentUser.id);
            } else if (userUsage?.custom_messages_balance > 0) {
                await supabase.from('user_usage').update({
                    custom_messages_balance: userUsage.custom_messages_balance - 1,
                    updated_at: new Date().toISOString()
                }).eq('user_id', currentUser.id);
            }

            if (saveError) {
                console.error('Error saving user message:', saveError);
            }

            // 4. Fetch Advisor Webhook
            const { data: advisorData } = await supabase
                .from('advisors')
                .select('n8n_webhook_path')
                .eq('id', advisorId)
                .single();

            if (!advisorData?.n8n_webhook_path) {
                throw new Error('Advisor Webhook not configured in database');
            }

            // 5. Trigger n8n with Website's exact Header and Payload
            const response = await fetch(advisorData.n8n_webhook_path, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-N8N-API-KEY': n8nApiKey || ""
                },
                body: JSON.stringify({
                    message: messageText,
                    agentId: advisorId,
                    userId: currentUser.id,
                    advisorName: name
                })
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const aiResponse = await response.json();

            // 6. Handle AI Response (Expecting { output: "..." })
            const responseText = aiResponse.output || aiResponse.text || (typeof aiResponse === 'string' ? aiResponse : null);

            if (responseText) {
                const aiMsg = {
                    id: `ai_${Date.now()}`,
                    role: 'ai',
                    content: responseText,
                    created_at: new Date().toISOString()
                };

                setMessages(prev => [...prev, aiMsg]);
                setIsTyping(false);
                setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

                // Save AI message to DB
                await supabase
                    .from('chat_history')
                    .insert({
                        user_id: currentUser.id,
                        advisor_id: advisorId,
                        role: 'ai',
                        content: responseText
                    });

                // Refresh usage
                const { data: updatedUsage } = await supabase
                    .from('user_usage')
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .single();
                if (updatedUsage) setUserUsage(updatedUsage);
            } else {
                console.error('Unexpected AI response format:', aiResponse);
                throw new Error('Invalid AI response format');
            }

        } catch (err) {
            console.error('Send error:', err);
            setIsTyping(false);

            // Add error system message
            setMessages(prev => [...prev, {
                id: `err_${Date.now()}`,
                role: 'ai',
                content: "⚠️ Connection error. Please try again.",
                created_at: new Date().toISOString()
            }]);
        }
    };

    const insets = useSafeAreaInsets();

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View style={styles.chatHeader}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <View style={styles.headerAvatarContainer}>
                            {image_url ? (
                                <Image source={{ uri: image_url }} style={styles.headerAvatar} />
                            ) : (
                                <View style={[styles.headerAvatar, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#333' }]}>
                                    <Ionicons name="person" size={20} color="#ADAFBB" />
                                </View>
                            )}
                            <View style={styles.onlineStatus} />
                        </View>
                        <View>
                            <Text style={styles.headerName}>{name}</Text>
                            <View style={styles.specialtyContainer}>
                                <Ionicons name="sparkles" size={10} color={Colors.primary} />
                                <Text style={styles.headerTitle}>{route.params?.specialty || 'Advisor'}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => setShowVoiceModal(true)}
                        >
                            <Ionicons name="call" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Messages Area */}
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <ActivityIndicator color={Colors.primary} size="large" />
                    </View>
                ) : error ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#FF6B6B', marginTop: 16, textAlign: 'center' }}>
                            {error}
                        </Text>
                        <TouchableOpacity
                            style={{ marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: Colors.primary, borderRadius: 12 }}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={{ color: 'white', fontWeight: '700' }}>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={styles.messagesContainer}
                        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                        keyboardShouldPersistTaps="handled"
                    >
                        {messages.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Start a conversation with {name}</Text>
                            </View>
                        ) : (
                            messages.map((msg, index) => (
                                <View
                                    key={msg.id || index}
                                    style={[
                                        styles.messageBubble,
                                        msg.role === 'user' ? styles.userBubble : styles.advisorBubble
                                    ]}
                                >
                                    <Text style={[
                                        styles.messageText,
                                        msg.role === 'user' ? { color: 'white' } : { color: '#121E39' }
                                    ]}>
                                        {msg.content}
                                    </Text>
                                    <Text style={[
                                        styles.messageTime,
                                        msg.role === 'user' ? { color: 'rgba(255,255,255,0.7)' } : { color: '#ADAFBB' }
                                    ]}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            ))
                        )}
                    </ScrollView>
                )}

                {/* Input Bar */}
                <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 15) }]}>
                    <TouchableOpacity style={styles.micBtn}>
                        <Ionicons name="mic-outline" size={24} color="#121E39" />
                    </TouchableOpacity>
                    <View style={styles.textInputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type your message..."
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            maxHeight={100}
                        />
                        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                            <Ionicons name="send-outline" size={20} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <VoiceCallModal
                    visible={showVoiceModal}
                    onClose={() => setShowVoiceModal(false)}
                    advisor={{ name, specialty: route.params?.specialty, image_url, id: advisorId }}
                    userId={currentUser?.id}
                />
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#1A1A1A',
        borderBottomWidth: 0,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 15,
        padding: 5,
    },
    headerAvatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    headerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#333',
    },
    onlineStatus: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#1A1A1A',
    },
    headerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 2,
    },
    specialtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    headerTitle: {
        fontSize: 10,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.7)', // Increased visibility
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    actionBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0,
        borderColor: 'transparent',
    },
    messagesContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    messageBubble: {
        borderRadius: 20,
        padding: 15,
        maxWidth: '85%',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    userBubble: {
        backgroundColor: Colors.primary,
        alignSelf: 'flex-end',
        borderTopRightRadius: 5,
    },
    advisorBubble: {
        backgroundColor: Colors.white,
        alignSelf: 'flex-start',
        borderTopLeftRadius: 5,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    messageTime: {
        fontSize: 10,
        marginTop: 5,
        alignSelf: 'flex-end',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: 14,
        color: '#7C8BA0',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#FFF',
        borderTopWidth: 1.5,
        borderTopColor: '#E8E6EA', // Visible border
        paddingBottom: Platform.OS === 'ios' ? 30 : 15, // Safe area space
    },
    micBtn: {
        marginRight: 10,
    },
    textInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F7F7',
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 50,
        borderWidth: 1,
        borderColor: '#E8E6EA',
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#121E39',
    },
    sendBtn: {
        marginLeft: 10,
    },
});


export default ChatDetailScreen;
