import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { supabase } from '../lib/supabase';
import ScreenWrapper from '../components/ScreenWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

            // 2. Fetch Discovery Webhook from settings
            const { data: setting } = await supabase
                .from('system_settings')
                .select('key_value')
                .eq('key_name', 'N8N_DISCOVERY_WEBHOOK')
                .maybeSingle();

            if (setting?.key_value) {
                // Match Website's exact payload: { userId, answers }
                fetch(setting.key_value, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: session.user.id,
                        answers: finalAnswers
                    })
                }).catch(e => console.log('Webhook call failed (non-blocking):', e));

                // 3. Navigate back to Home and let it handle the "Analysing" state
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Main' }]
                });
            } else {
                // No webhook configured, just go home
                navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
            }

        } catch (err) {
            console.error('Submit error:', err);
            navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        } finally {
            setIsSubmitting(false);
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
        <ScreenWrapper>
            <SafeAreaView style={styles.container}>
                {/* Header with Progress Bar */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => currentStep > 1 ? animateNext(() => setCurrentStep(currentStep - 1)) : navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#12172D" />
                    </TouchableOpacity>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${(currentStep / totalSteps) * 100}%` }]} />
                    </View>
                    <View style={{ width: 44 }} />
                </View>

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

                {isSubmitting && (
                    <View style={styles.submittingOverlay}>
                        <LinearGradient
                            colors={['rgba(233, 64, 87, 0.9)', 'rgba(242, 113, 33, 0.9)']}
                            style={StyleSheet.absoluteFill}
                        />
                        <ActivityIndicator size="large" color="white" />
                        <Text style={styles.submittingText}>Analysing your profile...</Text>
                        <Text style={styles.submittingSubtext}>Preparing your personalized advice</Text>
                    </View>
                )}
            </SafeAreaView>
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
        paddingVertical: 15,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8E6EA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBarContainer: {
        flex: 1,
        height: 8,
        backgroundColor: '#F3F3F3',
        borderRadius: 4,
        marginHorizontal: 15,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#E94057',
        borderRadius: 4,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 40,
    },
    stepIndicator: {
        fontSize: 13,
        fontWeight: '900',
        color: '#E94057',
        textTransform: 'uppercase',
        marginBottom: 12,
        letterSpacing: 1.5,
    },
    questionText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#12172D',
        marginBottom: 40,
        lineHeight: 40,
    },
    optionsContainer: {
        gap: 12,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingVertical: 22,
        paddingHorizontal: 25,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: '#F3F3F3',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    optionText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#12172D',
    },
    submittingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    submittingText: {
        color: 'white',
        marginTop: 20,
        fontSize: 22,
        fontWeight: '800',
    },
    submittingSubtext: {
        color: 'rgba(255,255,255,0.8)',
        marginTop: 8,
        fontSize: 14,
        fontWeight: '500',
    },
});


export default DiscoveryScreen;
