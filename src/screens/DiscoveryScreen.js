import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { supabase } from '../lib/supabase';
import ScreenWrapper from '../components/ScreenWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const DiscoveryScreen = ({ navigation, route }) => {
    const { topicId } = route.params || {};
    const [questions, setQuestions] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fadeAnim = useState(new Animated.Value(1))[0];
    const slideAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const { data, error } = await supabase
                    .from('discovery_questions')
                    .select('*')
                    .order('step_number', { ascending: true });

                if (error) throw error;

                if (data && data.length > 0) {
                    setQuestions(data);
                } else {
                    // Optimized fallback questions (Matching website depth)
                    const fallbackQuestions = [
                        { step_number: 1, question_text: "What brings you here?", options: ["Finding Love", "Building Confidence", "Fixing Relationship", "Casual Dating"], category: "goal" },
                        { step_number: 2, question_text: "What is your current relationship status?", options: ["Single", "In a Relationship", "Complicated", "Divorced"], category: "status" },
                        { step_number: 3, question_text: "What is your biggest dating challenge?", options: ["First Dates", "Communication", "Meeting People", "Online Profile"], category: "challenge" },
                        { step_number: 4, question_text: "How do you usually meet people?", options: ["Dating Apps", "Social Circles", "Work/Study", "Events/Bars"], category: "environment" },
                        { step_number: 5, question_text: "What is your ideal outcome?", options: ["Long-term Marriage", "Deep Connection", "New Experiences", "Confidence Boost"], category: "outcome" }
                    ];
                    setQuestions(fallbackQuestions);
                }
            } catch (err) {
                console.error('Error fetching discovery questions:', err);
                // Last resort fallback
                setQuestions([{ step_number: 1, question_text: "What brings you here?", options: ["Finding Love", "Building Confidence"], category: "goal" }]);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    const currentQuestion = questions.find(q => q.step_number === currentStep);
    const totalSteps = questions.length;

    const animateNext = (callback) => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: -20, duration: 200, useNativeDriver: true })
        ]).start(() => {
            callback();
            slideAnim.setValue(20);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true })
            ]).start();
        });
    };

    const handleOptionSelect = (option) => {
        const category = currentQuestion?.category;
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
            if (!session) return;

            // 1. Mark discovery as pending locally for Home screen state
            await AsyncStorage.setItem('discovery_pending', 'true');
            await AsyncStorage.setItem('discovery_start_time', Date.now().toString());

            // 2. Fetch Discovery Webhook from settings
            const { data: setting } = await supabase
                .from('system_settings')
                .select('key_value')
                .eq('key_name', 'N8N_DISCOVERY_WEBHOOK')
                .maybeSingle();

            if (setting?.key_value) {
                // Trigger Webhook
                await fetch(setting.key_value, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: session.user.id, answers: finalAnswers })
                }).catch(e => console.log('Webhook call failed:', e));

                // 3. WAIT FOR ANALYSIS (Direct Flow)
                // Instead of going back to Home, we poll right here to provide a "Direct" experience
                let attempts = 0;
                const maxAttempts = 15; // 30 seconds total

                const checkStatus = async () => {
                    if (attempts >= maxAttempts) {
                        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
                        return;
                    }

                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('persona_analysis')
                        .eq('id', session.user.id)
                        .single();

                    if (profile?.persona_analysis && Object.keys(profile.persona_analysis).length > 0) {
                        // Analysis found! Get Advisors and Navigate
                        const { data: advisors } = await supabase.from('advisors').select('*').limit(10);
                        const recommendedName = profile.persona_analysis.recommended_advisors?.[0];

                        const advisor = advisors?.find(a =>
                            recommendedName && (recommendedName.toLowerCase().includes(a.name.toLowerCase()) || a.name.toLowerCase().includes(recommendedName.toLowerCase()))
                        ) || advisors?.[0];

                        if (advisor) {
                            navigation.reset({
                                index: 1,
                                routes: [
                                    { name: 'Main' },
                                    {
                                        name: 'ChatDetail',
                                        params: {
                                            name: advisor.name,
                                            id: advisor.id,
                                            image_url: advisor.image_url,
                                            specialty: advisor.specialty,
                                            initialContext: "I've just completed my profile discovery. I'm ready for your advice!"
                                        }
                                    }
                                ]
                            });
                        } else {
                            navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
                        }
                    } else {
                        attempts++;
                        setTimeout(checkStatus, 2000);
                    }
                };

                checkStatus();
            } else {
                navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
            }

        } catch (err) {
            console.error('Submit error:', err);
            navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        } finally {
            // We don't set isSubmitting(false) immediately if we are polling
            // so the overlay stays visible.
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
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
                        <Ionicons name="chevron-back" size={24} color="#12172D" />
                    </TouchableOpacity>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${(currentStep / totalSteps) * 100}%` }]} />
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <Text style={styles.stepIndicator}>STEP {currentStep} OF {totalSteps}</Text>
                        <Text style={styles.questionText}>
                            {currentQuestion?.question_text || "Preparing next question..."}
                        </Text>

                        <View style={styles.optionsContainer}>
                            {currentQuestion ? (
                                (() => {
                                    try {
                                        const options = typeof currentQuestion.options === 'string'
                                            ? JSON.parse(currentQuestion.options)
                                            : currentQuestion.options;

                                        return options.map((option, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                activeOpacity={0.7}
                                                style={styles.optionButton}
                                                onPress={() => handleOptionSelect(option)}
                                            >
                                                <Text style={styles.optionText}>{option}</Text>
                                                <Ionicons name="chevron-forward" size={18} color="#E94057" />
                                            </TouchableOpacity>
                                        ));
                                    } catch (e) {
                                        console.error("Error parsing options:", e);
                                        return <Text>Error loading options</Text>;
                                    }
                                })()
                            ) : (
                                <ActivityIndicator size="small" color="#E94057" />
                            )}
                        </View>
                    </Animated.View>
                </ScrollView>

                {isSubmitting && (
                    <View style={styles.submittingOverlay}>
                        <LinearGradient
                            colors={['#E94057', '#F27121']}
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
        backgroundColor: '#fff',
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
        paddingVertical: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8E6EA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBarContainer: {
        flex: 1,
        height: 6,
        backgroundColor: '#F3F3F3',
        borderRadius: 3,
        marginHorizontal: 15,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#E94057',
        borderRadius: 3,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 25,
        paddingTop: 30,
        paddingBottom: 40,
    },
    stepIndicator: {
        fontSize: 12,
        fontWeight: '900',
        color: '#E94057',
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 1,
    },
    questionText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#12172D',
        marginBottom: 30,
        lineHeight: 36,
    },
    optionsContainer: {
        gap: 10,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingVertical: 18,
        paddingHorizontal: 22,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#F3F3F3',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#12172D',
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
        marginTop: 20,
        fontSize: 22,
        fontWeight: '800',
        textAlign: 'center',
    },
    submittingSubtext: {
        color: 'rgba(255,255,255,0.8)',
        marginTop: 10,
        fontSize: 15,
        fontWeight: '500',
        textAlign: 'center',
    },
});


export default DiscoveryScreen;
