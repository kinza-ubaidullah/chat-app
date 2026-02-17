import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    Dimensions,
    Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

const AnalysisScreen = ({ navigation }) => {
    const [questions, setQuestions] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchQuestions();
    }, []);

    useEffect(() => {
        if (questions.length > 0) {
            Animated.timing(progressAnim, {
                toValue: (currentStep / questions.length) * 100,
                duration: 500,
                useNativeDriver: false
            }).start();
        }
    }, [currentStep, questions]);

    const fetchQuestions = async () => {
        try {
            const { data, error } = await supabase
                .from('discovery_questions')
                .select('*')
                .order('step_number', { ascending: true });

            if (error) throw error;
            setQuestions(data || []);
        } catch (error) {
            console.error('Error fetching questions:', error);
            Alert.alert('Error', 'Failed to load analysis questions.');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (option) => {
        const currentQuestion = questions.find(q => q.step_number === currentStep);
        if (!currentQuestion) return;

        setAnswers(prev => ({
            ...prev,
            [currentQuestion.category]: option
        }));

        if (currentStep < questions.length) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                Alert.alert('Error', 'User not authenticated');
                return;
            }

            // 1. Get Webhook URL
            const { data: setting, error: dbError } = await supabase
                .from('system_settings')
                .select('key_value')
                .eq('key_name', 'N8N_DISCOVERY_WEBHOOK')
                .maybeSingle();

            if (dbError || !setting?.key_value) {
                throw new Error('Analysis configuration missing');
            }

            // 2. Call N8N Webhook
            const response = await fetch(setting.key_value, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.id,
                    answers
                })
            });

            if (response.ok) {
                // Fetch default advisor to start chatting with immediately
                const { data: advisors, error: advisorError } = await supabase
                    .from('advisors')
                    .select('*')
                    .limit(1)
                    .order('id', { ascending: true }); // Assume first one is main AI

                if (advisors && advisors.length > 0) {
                    const advisor = advisors[0];
                    // Navigate to chat with "I just completed my profile analysis" context
                    navigation.replace('ChatDetail', {
                        id: advisor.id,
                        name: advisor.name,
                        image_url: advisor.image_url,
                        initialContext: "I've just completed my persona analysis. What insights do you have for me?"
                    });
                } else {
                    Alert.alert('Analysis Complete', 'Your profile is updated!');
                    navigation.replace('Main');
                }
            } else {
                throw new Error('Analysis service busy');
            }

        } catch (error) {
            console.error('Analysis error:', error);
            Alert.alert('Error', 'Analysis failed. Please try again later.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        } else {
            navigation.goBack();
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading questions...</Text>
            </View>
        );
    }

    const currentQuestion = questions.find(q => q.step_number === currentStep);
    const totalSteps = questions.length;
    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%']
    });

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#FFF', '#FFF5F5']}
                style={styles.gradient}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#12172D" />
                    </TouchableOpacity>
                    <View style={styles.progressBarContainer}>
                        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
                    </View>
                    <Text style={styles.stepText}>{currentStep}/{totalSteps}</Text>
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Question Section */}
                    <View style={styles.questionContainer}>
                        <Text style={styles.stepLabel}>STEP {currentStep}</Text>
                        <Text style={styles.questionText}>
                            {currentQuestion?.question_text}
                        </Text>
                    </View>

                    {/* Options */}
                    <View style={styles.optionsContainer}>
                        {currentQuestion?.options?.map((option, index) => {
                            const isSelected = answers[currentQuestion.category] === option;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.optionButton,
                                        isSelected && styles.optionSelected
                                    ]}
                                    onPress={() => handleOptionSelect(option)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        isSelected && styles.optionTextSelected
                                    ]}>
                                        {option}
                                    </Text>
                                    {isSelected && (
                                        <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Submit Button (Only on last step) */}
                    {currentStep === totalSteps && answers[currentQuestion?.category] && (
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Ionicons name="sparkles" size={20} color="#FFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.submitText}>Analyze Profile</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    gradient: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 5,
    },
    progressBarContainer: {
        flex: 1,
        height: 6,
        backgroundColor: '#F0F0F0',
        borderRadius: 3,
        marginHorizontal: 15,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 3,
    },
    stepText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#999',
    },
    content: {
        padding: 24,
    },
    questionContainer: {
        marginBottom: 32,
    },
    stepLabel: {
        fontSize: 12,
        fontWeight: '900',
        color: Colors.primary,
        marginBottom: 8,
        letterSpacing: 1,
    },
    questionText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#12172D',
        lineHeight: 36,
    },
    optionsContainer: {
        gap: 12,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#F5F5F5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    optionSelected: {
        borderColor: Colors.primary,
        backgroundColor: '#FFF5F6',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#12172D',
        flex: 1,
    },
    optionTextSelected: {
        color: Colors.primary,
        fontWeight: '700',
    },
    submitButton: {
        marginTop: 40,
        marginBottom: 20,
        backgroundColor: '#12172D',
        borderRadius: 20,
        paddingVertical: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    submitText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
});

export default AnalysisScreen;
