import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Animated, Dimensions, Platform, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { supabase } from '../lib/supabase';
import ScreenWrapper from '../components/ScreenWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const DiscoveryScreen = ({ navigation, route }) => {
    const params = route?.params || {};
    // Initial dummy question to preventing render crash if fetch is slow
    const [questions, setQuestions] = useState([
        { step_number: 1, question_text: "What brings you here?", options: ["Finding Love", "Building Confidence", "Fixing Relationship", "Casual Dating"], category: "goal" }
    ]);
    const [currentStep, setCurrentStep] = useState(1);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;
    const useNative = Platform.OS !== 'web';

    useEffect(() => {
        let isMounted = true;
        const fetchQuestions = async () => {
            try {
                const { data, error } = await supabase
                    .from('discovery_questions')
                    .select('*')
                    .order('step_number', { ascending: true });

                if (error) throw error;

                if (isMounted && data && data.length > 0) {
                    setQuestions(data);
                }
            } catch (err) {
                console.error('Error fetching discovery questions:', err);
                // Keep default questions if error
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchQuestions();
        return () => { isMounted = false; };
    }, []);

    const currentQuestion = questions.find(q => q.step_number === currentStep) || questions[0];
    const totalSteps = questions.length;

    const animateNext = (callback) => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: useNative }),
            Animated.timing(slideAnim, { toValue: -20, duration: 200, useNativeDriver: useNative })
        ]).start(() => {
            if (callback) callback();
            slideAnim.setValue(20);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: useNative }),
                Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: useNative })
            ]).start();
        });
    };

    const handleOptionSelect = (option) => {
        const category = currentQuestion?.category || `step_${currentStep}`;
        const newAnswers = { ...answers, [category]: option };
        setAnswers(newAnswers);

        if (currentStep < totalSteps) {
            animateNext(() => setCurrentStep(currentStep + 1));
        } else {
            handleSubmit(newAnswers);
        }
    };

    const handleSubmit = async (finalAnswers) => {
        setIsSubmitting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.log('No session found during submit');
                navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
                return;
            }

            // 1. Mark discovery as pending locally
            await AsyncStorage.setItem('discovery_pending', 'true');
            await AsyncStorage.setItem('discovery_start_time', Date.now().toString());

            // 2. Trigger Webhook if configured
            const { data: setting } = await supabase
                .from('system_settings')
                .select('key_value')
                .eq('key_name', 'N8N_DISCOVERY_WEBHOOK')
                .maybeSingle();

            if (setting?.key_value) {
                // Fire and forget webhook
                fetch(setting.key_value, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: session.user.id, answers: finalAnswers })
                }).catch(e => console.log('Webhook call failed:', e));

                // 3. Mark as pending and navigate to Home where polling happens centrally
                await AsyncStorage.setItem('discovery_pending', 'true');
                await AsyncStorage.setItem('discovery_start_time', Date.now().toString());

                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Main', params: { screen: 'Home' } }]
                });
            } else {
                console.log('No webhook URL configured');
                navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
            }

        } catch (err) {
            console.error('Submit error:', err);
            navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        }
    };

    const pollForAnalysis = async (userId) => {
        let attempts = 0;
        const maxAttempts = 20; // ~40 seconds

        const checkStatus = async () => {
            if (attempts >= maxAttempts) {
                navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
                return;
            }

            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('persona_analysis')
                    .eq('id', userId)
                    .single();

                if (profile?.persona_analysis && Object.keys(profile.persona_analysis || {}).length > 0) {
                    // Analysis Complete! Find matching advisor
                    const { data: advisors } = await supabase.from('advisors').select('*');
                    const recommendedName = profile.persona_analysis.recommended_advisors?.[0];

                    let advisor = null;
                    if (advisors && advisors.length > 0) {
                        advisor = advisors.find(a =>
                            recommendedName && (recommendedName.toLowerCase().includes(a.name.toLowerCase()) ||
                                a.name.toLowerCase().includes(recommendedName.toLowerCase()))
                        ) || advisors[0];
                    }

                    if (advisor) {
                        navigation.reset({
                            index: 1,
                            routes: [
                                { name: 'Main' },
                                {
                                    name: 'ChatDetail',
                                    params: { advisor }
                                }
                            ]
                        });
                    } else {
                        // If no specific advisor found, navigate to Main and let Home handle it.
                        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
                    }
                } else {
                    attempts++;
                    setTimeout(checkStatus, 2000);
                }
            } catch (e) {
                console.log("Polling error:", e);
                attempts++;
                setTimeout(checkStatus, 2000);
            }
        };

        checkStatus();
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={{ marginTop: 20, color: Colors.textSecondary }}>Loading questions...</Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper style={{ backgroundColor: '#fff' }}>
            <View style={styles.container}>
                {/* Header with Progress Bar */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => currentStep > 1 ? animateNext(() => setCurrentStep(currentStep - 1)) : navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={24} color={Colors.secondary} />
                    </TouchableOpacity>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0}%` }]} />
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <Text style={styles.stepIndicator}>STEP {currentStep} OF {totalSteps}</Text>
                        <Text style={styles.questionText}>
                            {currentQuestion?.question_text || "Preparing question..."}
                        </Text>

                        <View style={styles.optionsContainer}>
                            {(() => {
                                try {
                                    let options = [];
                                    if (currentQuestion && currentQuestion.options) {
                                        if (Array.isArray(currentQuestion.options)) {
                                            options = currentQuestion.options;
                                        } else if (typeof currentQuestion.options === 'string') {
                                            try {
                                                options = JSON.parse(currentQuestion.options);
                                            } catch (e) {
                                                console.log("JSON parse error:", e);
                                                options = [];
                                            }
                                        }
                                    }

                                    if (!options || options.length === 0) {
                                        return <Text style={{ color: '#999' }}>No options available.</Text>;
                                    }

                                    return options.map((option, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            activeOpacity={0.7}
                                            style={styles.optionButton}
                                            onPress={() => handleOptionSelect(option)}
                                        >
                                            <Text style={styles.optionText}>{option}</Text>
                                            <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
                                        </TouchableOpacity>
                                    ));
                                } catch (e) {
                                    console.error("Render options error:", e);
                                    return <Text>Error loading options</Text>;
                                }
                            })()}
                        </View>
                    </Animated.View>
                </ScrollView>

                {isSubmitting && (
                    <View style={styles.submittingOverlay}>
                        <LinearGradient
                            colors={['#0F172A', '#1E293B']}
                            style={StyleSheet.absoluteFill}
                        />
                        <View style={styles.overlayContent}>
                            <ActivityIndicator size="large" color="white" />
                            <Text style={styles.submittingText}>Analysing your profile...</Text>
                            <Text style={styles.submittingSubtext}>Preparing your personalized advice</Text>
                        </View>
                    </View>
                )}
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingBottom: 15,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    progressBarContainer: {
        flex: 1,
        height: 8,
        backgroundColor: Colors.border,
        borderRadius: 4,
        marginHorizontal: 15,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 4,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 25,
        paddingTop: 40,
        paddingBottom: 40,
    },
    stepIndicator: {
        fontSize: 12,
        fontWeight: '900',
        color: Colors.primary,
        textTransform: 'uppercase',
        marginBottom: 10,
        letterSpacing: 1.5,
    },
    questionText: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.secondary,
        marginBottom: 35,
        lineHeight: 40,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    optionsContainer: {
        gap: 12,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.white,
        paddingVertical: 20,
        paddingHorizontal: 25,
        borderRadius: 22,
        borderWidth: 1.5,
        borderColor: Colors.border,
        shadowColor: Colors.secondary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
    },
    optionText: {
        fontSize: 17,
        fontWeight: '800',
        color: Colors.secondary,
        flex: 1,
        marginRight: 10,
    },
    submittingOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 100,
    },
    overlayContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    submittingText: {
        color: 'white',
        marginTop: 25,
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    submittingSubtext: {
        color: 'rgba(255,255,255,0.7)',
        marginTop: 12,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default DiscoveryScreen;
