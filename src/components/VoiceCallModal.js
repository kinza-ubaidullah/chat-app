import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Animated, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { supabase } from '../lib/supabase';

// Conditional import for native-only Vapi SDK
let Vapi = null;
try {
    if (Platform.OS !== 'web') {
        Vapi = require('@vapi-ai/react-native').default;
    }
} catch (e) {
    console.log('Vapi module failed to load:', e);
}

const VoiceCallModal = ({ visible, onClose, advisor, userId }) => {
    const [status, setStatus] = useState('ready'); // ready, connecting, active, ended
    const [duration, setDuration] = useState(0);
    const [usage, setUsage] = useState(null);
    const [vapi, setVapi] = useState(null);
    const timerRef = useRef(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible) {
            setupVapi();
            fetchUsage();
            setStatus('ready');
            setDuration(0);
        } else {
            if (vapi) vapi.stop();
            stopTimer();
        }
    }, [visible]);

    const setupVapi = async () => {
        try {
            const { data: settings } = await supabase
                .from('system_settings')
                .select('key_value')
                .eq('key_name', 'VAPI_PUBLIC_KEY')
                .single();

            const publicKey = settings?.key_value || process.env.EXPO_PUBLIC_VAPI_PUBLIC_KEY;

            if (!publicKey) {
                console.error("Vapi Public Key missing in system_settings");
                return;
            }

            if (!Vapi) {
                console.log("Vapi SDK not available on this platform");
                return;
            }
            const vapiInstance = new Vapi(publicKey);

            vapiInstance.on('call-start', () => {
                setStatus('active');
                startTimer();
                startPulse();
            });

            vapiInstance.on('call-end', async () => {
                setStatus('ended');
                stopTimer();

                // Deduct minutes based on actual duration (Website Logic)
                setDuration(currentDur => {
                    if (currentDur > 0) {
                        const minsUsed = currentDur / 60;
                        supabase.from('user_usage')
                            .select('voice_minutes_left')
                            .eq('user_id', userId)
                            .single()
                            .then(({ data }) => {
                                if (data) {
                                    supabase.from('user_usage')
                                        .update({
                                            voice_minutes_left: Math.max(0, data.voice_minutes_left - minsUsed),
                                            updated_at: new Date().toISOString()
                                        })
                                        .eq('user_id', userId)
                                        .then(() => console.log(`Deducted ${minsUsed.toFixed(2)} mins`));
                                }
                            });
                    }
                    return currentDur;
                });

                setTimeout(onClose, 1500);
            });

            vapiInstance.on('error', (e) => {
                console.error('Vapi Error:', e);
                setStatus('ready');
                alert("Connection error occurred.");
            });

            setVapi(vapiInstance);
        } catch (e) {
            console.error("Error setting up Vapi:", e);
        }
    };

    const fetchUsage = async () => {
        const { data } = await supabase.from('user_usage').select('*').eq('user_id', userId).single();
        if (data) setUsage(data);
    };

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const startPulse = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
            ])
        ).start();
    };

    const handleCall = async () => {
        if (status === 'active') {
            vapi.stop();
            return;
        }

        if (usage?.voice_minutes_left <= 0.1) {
            alert("No minutes left. Please top up.");
            onClose();
            return;
        }

        if (!vapi) {
            alert("Vapi not initialized.");
            return;
        }

        setStatus('connecting');

        // Advisor ID logic
        const assistantId = advisor.vapi_assistant_id || 'default-id';

        try {
            vapi.start(assistantId, {
                assistant: {
                    variableValues: {
                        userName: "User", // Can be extended
                    }
                }
            });
        } catch (e) {
            console.error("Vapi Start Error:", e);
            setStatus('ready');
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!advisor) return null;

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.container}>
                <View style={styles.blurBg} />

                <View style={styles.content}>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Ionicons name="close" size={28} color="#FFF" />
                    </TouchableOpacity>

                    <View style={styles.advisorInfo}>
                        <Animated.View style={[styles.avatarContainer, status === 'active' && { transform: [{ scale: pulseAnim }] }]}>
                            <Image source={{ uri: advisor.image_url }} style={styles.avatar} />
                            {status === 'active' && <View style={styles.liveBadge} />}
                        </Animated.View>
                        <Text style={styles.name}>{advisor.name}</Text>
                        <Text style={styles.specialty}>{advisor.specialty}</Text>
                    </View>

                    <View style={styles.statusBox}>
                        <Text style={styles.statusText}>
                            {status === 'ready' ? 'Voice Ready' :
                                status === 'connecting' ? 'Connecting...' :
                                    status === 'active' ? 'Live Call' : 'Call Ended'}
                        </Text>
                        {status === 'active' && (
                            <Text style={styles.timer}>{formatTime(duration)}</Text>
                        )}
                        {status === 'ready' && (
                            <Text style={styles.usageText}>{usage?.voice_minutes_left?.toFixed(1) || '0.0'} Mins Available</Text>
                        )}
                    </View>

                    <View style={styles.controls}>
                        <TouchableOpacity style={styles.auxBtn}>
                            <Ionicons name="mic-off" size={24} color="#FFF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.callBtn, status === 'active' ? styles.endBtn : status === 'connecting' ? styles.connectingBtn : styles.startBtn]}
                            onPress={handleCall}
                            disabled={status === 'connecting'}
                        >
                            {status === 'connecting' ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Ionicons name="call" size={32} color="#FFF" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.auxBtn}>
                            <Ionicons name="volume-high" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '100%',
        alignItems: 'center',
        padding: 40,
    },
    closeBtn: {
        position: 'absolute',
        top: 20,
        right: 30,
        padding: 10,
    },
    advisorInfo: {
        alignItems: 'center',
        marginBottom: 60,
    },
    avatarContainer: {
        width: 180,
        height: 180,
        borderRadius: 90,
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 20,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 82,
        borderWidth: 4,
        borderColor: '#FFF',
    },
    liveBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#4CAF50',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    name: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 5,
    },
    specialty: {
        fontSize: 12,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    statusBox: {
        alignItems: 'center',
        marginBottom: 80,
    },
    statusText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 10,
    },
    timer: {
        fontSize: 40,
        fontWeight: '800',
        color: Colors.primary,
    },
    usageText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.3)',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 40,
    },
    callBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    startBtn: {
        backgroundColor: '#4CAF50',
    },
    connectingBtn: {
        backgroundColor: '#666',
    },
    endBtn: {
        backgroundColor: '#F44336',
        transform: [{ rotate: '135deg' }],
    },
    auxBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default VoiceCallModal;
