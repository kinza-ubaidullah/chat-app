import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import OnboardingModal from '../components/OnboardingModal';
import AnalysisResultModal from '../components/AnalysisResultModal';
import VoiceCallModal from '../components/VoiceCallModal';

import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [advisors, setAdvisors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showAnalysisResult, setShowAnalysisResult] = useState(false);
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [selectedAdvisorForVoice, setSelectedAdvisorForVoice] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [usage, setUsage] = useState(null);
    const [analysisError, setAnalysisError] = useState(false);
    const welcomeEmailTriggered = React.useRef(false);

    useEffect(() => {
        if (navigation.getState()?.routes.find(r => r.name === 'Home')?.params?.showAnalysis) {
            setShowAnalysisResult(true);
        }
    }, [navigation.getState()?.routes]);

    useEffect(() => {
        const checkPendingAnalysis = async () => {
            const pending = await AsyncStorage.getItem('discovery_pending');
            if (pending === 'true') setIsAnalyzing(true);
        };
        checkPendingAnalysis();
        fetchData();

        // --- REALTIME SUBSCRIPTION (Same as website) ---
        let channel;
        const subscribeToProfile = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                channel = supabase
                    .channel(`profile_${authUser.id}`)
                    .on('postgres_changes', {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'profiles',
                        filter: `id=eq.${authUser.id}`
                    }, async (payload) => {
                        console.log('Profile update received:', payload.new);
                        const newProfile = payload.new;
                        setUser(prev => ({ ...prev, profile: newProfile }));
                        if (newProfile.persona_analysis && Object.keys(newProfile.persona_analysis).length > 0) {
                            const pending = await AsyncStorage.getItem('discovery_pending');
                            if (pending === 'true') {
                                console.log('Setting auto-chat flag from realtime update');
                                await AsyncStorage.setItem('should_auto_chat', 'true');
                                await AsyncStorage.removeItem('discovery_pending');
                            }
                            setIsAnalyzing(false);
                            setUser(prev => ({ ...prev, profile: newProfile }));
                        }
                    })
                    .on('postgres_changes', {
                        event: '*',
                        schema: 'public',
                        table: 'user_usage',
                        filter: `user_id=eq.${authUser.id}`
                    }, (payload) => {
                        console.log('Usage update received:', payload.new);
                        setUsage(payload.new);
                    })
                    .subscribe();
            }
        };
        subscribeToProfile();

        // --- POLLING FALLBACK (Same as website) ---
        const pollInterval = setInterval(async () => {
            const pending = await AsyncStorage.getItem('discovery_pending');
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (pending === 'true' && authUser) {
                console.log('Polling for analysis...');
                const { data: newProfile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();

                if (newProfile && newProfile.persona_analysis && Object.keys(newProfile.persona_analysis).length > 0) {
                    console.log('Analysis ready!');
                    await AsyncStorage.setItem('should_auto_chat', 'true');
                    await AsyncStorage.removeItem('discovery_pending');
                    setUser(prev => ({ ...prev, profile: newProfile }));
                    setIsAnalyzing(false);
                    setAnalysisError(false);
                } else {
                    // Check if it's been too long (e.g., 2 mins)
                    const startTime = await AsyncStorage.getItem('discovery_start_time');
                    if (startTime && (Date.now() - parseInt(startTime)) > 120000) {
                        setAnalysisError(true);
                    }
                }
            }
        }, 3000); // Polling faster for better UX

        return () => {
            if (channel) supabase.removeChannel(channel);
            clearInterval(pollInterval);
        };
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (authUser) {
            // Sequential fetches for clarity and to handle potential missing usage records
            const [profileRes, usageRes, advisorsRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle(),
                supabase.from('user_usage').select('*').eq('user_id', authUser.id).maybeSingle(),
                supabase.from('advisors').select('*').order('id', { ascending: true })
            ]);

            const profileData = profileRes.data;
            const profileError = profileRes.error;
            const usageData = usageRes.data;

            if (profileError || !profileData) {
                setUser(authUser);
                setShowOnboarding(true);
            } else {
                const updatedUser = { ...authUser, profile: profileData };
                setUser(updatedUser);
                setUsage(usageData);

                // --- WELCOME EMAIL TRIGGER (Website Logic) ---
                if (profileData.welcome_email_sent === false && !welcomeEmailTriggered.current) {
                    welcomeEmailTriggered.current = true;
                    // Attempt to trigger welcome email (silently)
                    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
                    fetch(`${apiUrl}/api/notifications/welcome`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: authUser.email,
                            name: profileData.full_name || authUser.user_metadata?.full_name,
                            userId: authUser.id
                        })
                    }).catch(e => console.log('Email trigger failed (expected in local dev):', e));
                }

                // --- ONBOARDING AUTO-TRIGGER ---
                if (!profileData.onboarding_completed_at) {
                    setShowOnboarding(true);
                }

                if (profileData.persona_analysis && Object.keys(profileData.persona_analysis).length > 0) {
                    await AsyncStorage.removeItem('discovery_pending');
                    setIsAnalyzing(false);
                }
            }

            // --- ADVISOR FETCH WITH FALLBACK (Website Mirror) ---
            if (advisorsRes.data && advisorsRes.data.length > 0) {
                setAdvisors(advisorsRes.data);
            } else {
                console.log("No advisors in DB, using fallback list");
                setAdvisors([
                    {
                        id: 'fallback-chloe',
                        name: 'Chloé',
                        specialty: 'The "Attachment" Fixer',
                        rating: 4.9,
                        image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
                        is_online: true
                    },
                    {
                        id: 'fallback-malik',
                        name: 'Malik',
                        specialty: 'The Long-term Advisor',
                        rating: 4.8,
                        image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
                        is_online: true
                    },
                    {
                        id: 'fallback-kenji',
                        name: 'Kenji',
                        specialty: 'The Conversation Deepener',
                        rating: 4.8,
                        image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
                        is_online: true
                    },
                    {
                        id: 'fallback-valentina',
                        name: 'Valentina',
                        specialty: 'The Red Flag Spotter',
                        rating: 4.9,
                        image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
                        is_online: true
                    }
                ]);
            }

            // Final credit safety check
            if (!usageData) {
                const { data: retryUsage } = await supabase.from('user_usage').select('*').eq('user_id', authUser.id).maybeSingle();
                if (retryUsage) setUsage(retryUsage);
            }
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) Alert.alert('Error', error.message);
    };

    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
        // Website Flow: After rules, we must get the Analysis questions done
        navigation.navigate('Discovery');
        fetchData();
    };

    // Removed handleTopicSelect as it is no longer needed

    // --- AUTO-NAVIGATION (Website Pattern) ---
    useEffect(() => {
        if (!loading && user?.profile) {
            const hasAnalysis = user.profile.persona_analysis && Object.keys(user.profile.persona_analysis).length > 0;

            // 0. If onboarding is NOT completed, show the modal immediately
            if (!user.profile.onboarding_completed_at) {
                setShowOnboarding(true);
                return;
            }

            // ✨ REVERTED: Skip manual topic selection, go to Discovery if analysis missing
            if (user.profile.onboarding_completed_at && !hasAnalysis) {
                AsyncStorage.getItem('discovery_pending').then(pending => {
                    if (pending !== 'true') {
                        navigation.navigate('Discovery');
                    }
                });
            }

            // 2. ✨ AUTO-OPEN CHAT: When analysis finishes, go straight to recommended advisor
            if (hasAnalysis && !isAnalyzing && advisors.length > 0) {
                AsyncStorage.getItem('should_auto_chat').then(shouldAuto => {
                    if (shouldAuto === 'true') {
                        const recommendedName = user.profile.persona_analysis.recommended_advisors?.[0];
                        const advisor = advisors.find(a =>
                            recommendedName && (recommendedName.toLowerCase().includes(a.name.toLowerCase()) || a.name.toLowerCase().includes(recommendedName.toLowerCase()))
                        ) || advisors.find(a => a.name === 'Maya') || advisors[0];

                        if (advisor) {
                            AsyncStorage.removeItem('should_auto_chat');
                            console.log('Opening chat with recommended advisor:', advisor.name);
                            navigation.navigate('ChatDetail', {
                                name: advisor.name,
                                id: advisor.id,
                                image_url: advisor.image_url,
                                specialty: advisor.specialty,
                                initialContext: "I've just completed my persona discovery. I'm ready for your advice!"
                            });
                        }
                    }
                });
            }
        }
    }, [user, loading, navigation, isAnalyzing, advisors]);

    const handleAnalysisPress = () => {
        if (user?.profile?.persona_analysis && Object.keys(user?.profile?.persona_analysis).length > 0) {
            // If analysis exists, show result modal
            setShowAnalysisResult(true);
        } else {
            // Keep "Refine" text logic, but if they want to RE-do analysis, they can navigate.
            // Wait, if they have analysis, user asked for "View my analysis".
            // If they want to re-analyze, we can add a button inside the modal for that?
            // For now, let's treat the card click as "View" if exists, "Start" if not.
            // However, previous prompt asked to "Refine". If "Refine" implies re-doing, then navigate.
            // But user SPECIFICALLY said "view my analysis k functionality b same implement kro".
            // So View is priority. I'll add "Retake Analysis" button inside the modal if needed, or just let View be View.
            // Actually, if I show the modal, I can close it. If they really want to re-do, they can go to settings or maybe a "Retake" button in modal.
            // Let's stick to View for now.
            setShowAnalysisResult(true);
        }
    };

    // Helper to allow retake from modal if we wanted, or just separate button?
    // Let's assume logic:
    // If analysis exists -> Show View Modal.
    // Inside View Modal -> Maybe have "Update Persona" button?
    // For now, simple VIEW.

    /* helper for retake if needed in future */

    const handleAdvisorSelectByName = (name) => {
        // More robust matching: Check if the provided name starts with or contains the advisor's name
        // (Handles "Chloe - The Fixer" matching with "Chloe")
        const advisor = advisors.find(a =>
            name.toLowerCase().includes(a.name.toLowerCase()) ||
            a.name.toLowerCase().includes(name.split(' - ')[0].toLowerCase())
        );

        if (advisor) {
            navigation.navigate('ChatDetail', {
                name: advisor.name,
                id: advisor.id,
                image_url: advisor.image_url,
                specialty: advisor.specialty
            });
        } else {
            // Fallback if no match found
            Alert.alert('Advisor lookup', `We couldn't find ${name} in our database, but you can chat with our lead expert.`);
            const lead = advisors.find(a => a.name === 'Maya') || advisors[0];
            if (lead) {
                navigation.navigate('ChatDetail', {
                    name: lead.name,
                    id: lead.id,
                    image_url: lead.image_url,
                    specialty: lead.specialty
                });
            }
        }
    };

    return (
        <ScreenWrapper>
            <Header onLogout={handleLogout} />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Welcome Banner */}
                <View style={styles.banner}>
                    <Text style={styles.userName}>
                        Welcome back, {user?.profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}!
                    </Text>
                    <Text style={styles.wavingHand}>👋</Text>
                    <Text style={styles.bannerSubtitle}>Ready to connect with your advisor today?</Text>
                </View>

                {/* Analysis CTA (Always visible) */}
                <TouchableOpacity
                    style={styles.analysisCard}
                    onPress={async () => {
                        const hasAnalysis = user?.profile?.persona_analysis && Object.keys(user.profile.persona_analysis).length > 0;
                        if (hasAnalysis) {
                            setShowAnalysisResult(true);
                        } else if (isAnalyzing) {
                            // If stuck, allow manual refresh
                            fetchData();
                        } else {
                            navigation.navigate('Discovery');
                        }
                    }}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={analysisError ? ['#4A1212', '#2D1212'] : ['#12172D', '#2D3455']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.analysisGradient}
                    >
                        <View style={styles.analysisContent}>
                            <View style={styles.analysisIcon}>
                                {isAnalyzing && !analysisError ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : analysisError ? (
                                    <Ionicons name="alert-circle" size={24} color="#FFF" />
                                ) : (
                                    <Ionicons name="sparkles" size={24} color="#FFF" />
                                )}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.analysisTitle}>
                                    {isAnalyzing && !analysisError
                                        ? "Analysing your persona..."
                                        : analysisError
                                            ? "Analysis is taking longer than usual"
                                            : (!user?.profile?.persona_analysis || Object.keys(user?.profile?.persona_analysis || {}).length === 0)
                                                ? "Unlock Your Dating Persona"
                                                : "View Your Dating Persona"}
                                </Text>
                                <Text style={styles.analysisSubtitle}>
                                    {isAnalyzing && !analysisError
                                        ? "Our AI is busy crunching the numbers. Please wait a moment."
                                        : analysisError
                                            ? "Tap here to refresh or try again later. Your data is safe."
                                            : (!user?.profile?.persona_analysis || Object.keys(user?.profile?.persona_analysis || {}).length === 0)
                                                ? "Take a quick analysis to get personalized advice tailored to your style."
                                                : "See your AI-generated insights and recommended dating strategy."}
                                </Text>
                            </View>
                            {!isAnalyzing || analysisError ? <Ionicons name={analysisError ? "refresh" : "arrow-forward"} size={24} color="#FFF" /> : null}
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Grid Stats */}
                <View style={styles.gridContainer}>
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('Subscription')}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: '#FDF1F3' }]}>
                            <Ionicons name="card" size={20} color={Colors.primary} />
                        </View>
                        <Text style={styles.cardLabel}>Plan</Text>
                        <Text style={styles.cardValue}>{usage?.plan_type || 'Free'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Subscription')}>
                        <View style={[styles.iconCircle, { backgroundColor: '#EFFFF4' }]}>
                            <Ionicons name="chatbubble-ellipses" size={20} color="#4CAF50" />
                        </View>
                        <Text style={styles.cardLabel}>Chat</Text>
                        <Text style={styles.cardValue}>{usage?.messages_left || 0}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Subscription')}>
                        <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
                            <Ionicons name="call" size={20} color="#2196F3" />
                        </View>
                        <Text style={styles.cardLabel}>Voice</Text>
                        <Text style={styles.cardValue}>{usage?.voice_minutes_left || 0}m</Text>
                    </TouchableOpacity>
                </View>

                {/* Available Advisors */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Available Advisors</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={Colors.primary} />
                ) : advisors.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No advisors available at the moment.</Text>
                    </View>
                ) : (
                    advisors.map((advisor) => (
                        <TouchableOpacity
                            key={advisor.id}
                            style={styles.advisorCard}
                            onPress={() => navigation.navigate('ChatDetail', {
                                name: advisor.name,
                                id: advisor.id,
                                image_url: advisor.image_url,
                                specialty: advisor.specialty
                            })}
                        >
                            <View style={styles.advisorInfo}>
                                <View style={styles.avatarContainer}>
                                    <View style={styles.avatarPlaceholder}>
                                        <Image source={{ uri: advisor.image_url }} style={styles.advisorAvatar} />
                                    </View>
                                    {advisor.is_online && <View style={[styles.onlineBadge, { backgroundColor: '#4CAF50' }]} />}
                                </View>
                                <View style={styles.advisorText}>
                                    <Text style={styles.advisorName}>{advisor.name}</Text>
                                    <Text style={styles.advisorTitle}>{advisor.specialty}</Text>
                                    <View style={styles.ratingRow}>
                                        <Ionicons name="star" size={14} color="#FFB800" />
                                        <Text style={styles.ratingText}>{advisor.rating} (Verified)</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.advisorActions}>
                                <TouchableOpacity
                                    style={styles.callIconBtn}
                                    onPress={() => {
                                        setSelectedAdvisorForVoice(advisor);
                                        setShowVoiceModal(true);
                                    }}
                                >
                                    <Ionicons name="call" size={18} color="#FFF" />
                                </TouchableOpacity>
                                <View style={styles.arrowCircle}>
                                    <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Modals */}
            <OnboardingModal
                visible={showOnboarding}
                onComplete={handleOnboardingComplete}
                userId={user?.id}
            />

            <AnalysisResultModal
                visible={showAnalysisResult}
                onClose={() => setShowAnalysisResult(false)}
                analysis={user?.profile?.persona_analysis}
                allAdvisors={advisors}
                onAdvisorSelect={handleAdvisorSelectByName}
            />

            <VoiceCallModal
                visible={showVoiceModal}
                onClose={() => setShowVoiceModal(false)}
                advisor={selectedAdvisorForVoice}
                userId={user?.id}
            />

        </ScreenWrapper>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: 20,
    },
    banner: {
        backgroundColor: Colors.primaryLight,
        borderRadius: 30,
        padding: 25,
        marginTop: 20,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#FAD1D7',
    },
    analysisCard: {
        borderRadius: 20,
        marginBottom: 25,
        shadowColor: '#12172D',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    analysisGradient: {
        borderRadius: 20,
        padding: 20,
    },
    analysisContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    analysisIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    analysisTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    analysisSubtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        lineHeight: 18,
        flexShrink: 1,
    },
    userName: {
        fontSize: 26,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 5,
    },
    wavingHand: {
        fontSize: 32,
        marginBottom: 15,
    },
    bannerSubtitle: {
        fontSize: 17,
        color: Colors.textSecondary,
        lineHeight: 24,
        fontWeight: '500',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 35,
    },
    card: {
        width: '48%',
        backgroundColor: Colors.white,
        borderRadius: 25,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1.5,
        borderColor: Colors.border,
        shadowColor: '#121E39',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    cardLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.text,
    },
    advisorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.white,
        borderRadius: 25,
        padding: 18,
        marginBottom: 15,
        borderWidth: 1.5,
        borderColor: Colors.border,
    },
    advisorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 18,
    },
    avatarPlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: Colors.inputBackground,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    advisorAvatar: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    onlineBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 3,
        borderColor: Colors.white,
    },
    advisorText: {
        justifyContent: 'center',
    },
    advisorName: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.text,
    },
    advisorTitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginVertical: 4,
        fontWeight: '500',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginLeft: 6,
        fontWeight: '600',
    },
    advisorActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    callIconBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrowCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    emptyText: {
        color: '#999',
    },
});

export default HomeScreen;
