import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

const OnboardingModal = ({ visible, onComplete, userId }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isChecked, setIsChecked] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const steps = [
        {
            id: 'welcome',
            title: 'Welcome to Dating Advice.io',
            icon: 'heart-half-outline',
            content: (
                <View>
                    <Text style={styles.text}>
                        Dating Advice.io uses advanced <Text style={styles.bold}>Artificial Intelligence</Text> to generate dating and relationship advice.
                    </Text>
                    <View style={styles.warningBox}>
                        <Text style={styles.warningTitle}>Disclaimer:</Text>
                        <Text style={styles.warningText}>This service is for informational and entertainment purposes only.</Text>
                    </View>
                    <Text style={styles.text}>
                        AI responses may be inaccurate, incomplete, or inappropriate. Do not rely on this app for professional advice (medical, psychological, legal, financial, or emergency decisions).
                    </Text>
                </View>
            ),
            checkbox: 'I understand Dating Advice.io provides AI-generated entertainment content and is not professional advice.',
            btn: 'Continue'
        },
        {
            id: 'limitations',
            title: "AI Isn't Perfect",
            icon: 'alert-circle-outline',
            content: (
                <View>
                    <Text style={styles.text}>This service uses automated systems. AI outputs:</Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bullet}>• Can be wrong, misleading, or offensive</Text>
                        <Text style={styles.bullet}>• May not reflect real-world outcomes</Text>
                        <Text style={styles.bullet}>• May vary for similar prompts</Text>
                    </View>
                    <Text style={styles.text}>You are responsible for how you use advice and for your decisions and actions.</Text>
                </View>
            ),
            checkbox: 'I understand I am responsible for my decisions and will use AI responses at my own risk.',
            btn: 'I Understand'
        },
        {
            id: 'rules',
            title: 'Content Rules',
            icon: 'shield-checkmark-outline',
            content: (
                <View>
                    <Text style={[styles.text, { color: '#E94057', fontWeight: '700' }]}>Strictly No Explicit Content</Text>
                    <Text style={styles.text}>Do not submit:</Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bullet}>• Pornography or graphic sexual content</Text>
                        <Text style={styles.bullet}>• Erotic roleplay or explicit sexual acts</Text>
                        <Text style={styles.bullet}>• Content involving minors (will be reported)</Text>
                    </View>
                    <Text style={styles.smallText}>Violations result in immediate account termination.</Text>
                </View>
            ),
            checkbox: 'I agree not to submit explicit sexual content or attempt to bypass content filters.',
            btn: 'I Agree'
        },
        {
            id: 'privacy',
            title: 'Privacy & Processing',
            icon: 'lock-closed-outline',
            content: (
                <View>
                    <Text style={styles.text}>To provide this Service, we must process your prompts and messages.</Text>
                    <Text style={styles.text}>We use data to:</Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bullet}>• Operate and secure the Service</Text>
                        <Text style={styles.bullet}>• Improve quality and safety</Text>
                        <Text style={styles.bullet}>• Enforce policies</Text>
                    </View>
                    <Text style={styles.smallText}>See our Privacy Policy for full details.</Text>
                </View>
            ),
            checkbox: 'I acknowledge the Privacy Policy and consent to processing of my prompts/messages.',
            btn: 'Continue'
        },
        {
            id: 'subscription',
            title: 'Subscription Terms',
            icon: 'calendar-outline',
            content: (
                <View>
                    <Text style={styles.text}>Transparency is key. If you choose to subscribe:</Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bullet}>• Subscriptions automatically renew unless canceled.</Text>
                        <Text style={styles.bullet}>• You can cancel anytime in account settings.</Text>
                        <Text style={styles.bullet}>• No refunds for partial periods.</Text>
                    </View>
                </View>
            ),
            checkbox: 'I understand subscriptions auto-renew and I can cancel anytime.',
            btn: 'Continue'
        },
        {
            id: 'arbitration',
            title: 'Legal Terms',
            icon: 'document-text-outline',
            content: (
                <View>
                    <Text style={styles.text}>By using the app, you agree to our Terms of Service.</Text>
                    <View style={styles.warningBox}>
                        <Text style={styles.warningTitle}>Arbitration Agreement:</Text>
                        <Text style={styles.warningText}>Most disputes will be resolved by binding arbitration, not in court. You waive the right to class actions.</Text>
                    </View>
                </View>
            ),
            checkbox: 'I acknowledge the Arbitration Agreement & Class Action Waiver in the Terms.',
            btn: 'Continue'
        },
        {
            id: 'international',
            title: 'Data Transfer',
            icon: 'globe-outline',
            content: (
                <View>
                    <Text style={styles.text}>Our servers are based in the United States.</Text>
                    <Text style={styles.text}>By using the service, you acknowledge your data will be transferred to and processed in the U.S. under appropriate safeguards.</Text>
                </View>
            ),
            checkbox: 'I acknowledge international data processing and have reviewed my rights.',
            btn: 'Finish Setup'
        }
    ];

    const handleNext = async () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
            setIsChecked(false);
        } else {
            // Final step - Finish and Initialize User
            try {
                setSubmitting(true);

                // 1. Create/Update Profile (Self-healing the trigger failure)
                const { error: profileErr } = await supabase
                    .from('profiles')
                    .upsert({
                        id: userId,
                        onboarding_completed_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });

                if (profileErr) throw profileErr;

                // 2. Create Global Usage record (Credits)
                await supabase
                    .from('user_usage')
                    .upsert({
                        user_id: userId,
                        messages_left: 10,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id' });

                onComplete(); // Triggers the Topic Selection in HomeScreen
            } catch (err) {
                console.error('Onboarding init error:', err);
                onComplete();
            } finally {
                setSubmitting(false);
            }
        }
    };

    const step = steps[currentStep];

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.container}>
                <View style={styles.modalBg} />
                <View style={styles.card}>
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Ionicons name={step.icon} size={32} color={Colors.primary} />
                        </View>
                        <Text style={styles.stepIndicator}>Step {currentStep + 1} of {steps.length}</Text>
                        <Text style={styles.title}>{step.title}</Text>
                    </View>

                    <ScrollView style={styles.content}>
                        {step.content}
                    </ScrollView>

                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => setIsChecked(!isChecked)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                            {isChecked && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={styles.checkboxLabel}>{step.checkbox}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, (!isChecked || submitting) && styles.buttonDisabled]}
                        onPress={handleNext}
                        disabled={!isChecked || submitting}
                    >
                        <Text style={styles.buttonText}>{submitting ? 'Please wait...' : step.btn}</Text>
                        {!submitting && <Ionicons name="arrow-forward" size={20} color="#FFF" />}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 20,
    },
    modalBg: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        backgroundColor: '#FFF',
        width: '100%',
        maxWidth: 400,
        borderRadius: 30,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FFF5F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    stepIndicator: {
        fontSize: 12,
        fontWeight: '700',
        color: '#999',
        textTransform: 'uppercase',
        marginBottom: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#12172D',
        textAlign: 'center',
    },
    content: {
        maxHeight: 200,
        marginBottom: 20,
    },
    text: {
        fontSize: 15,
        lineHeight: 24,
        color: '#4A4A68',
        marginBottom: 15,
        textAlign: 'center',
    },
    bold: {
        fontWeight: '700',
        color: '#12172D',
    },
    warningBox: {
        backgroundColor: '#FFF8E1',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#FFE082',
    },
    warningTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#F57F17',
        marginBottom: 4,
    },
    warningText: {
        fontSize: 13,
        color: '#F9A825',
        lineHeight: 18,
    },
    bulletList: {
        marginLeft: 10,
        marginBottom: 15,
    },
    bullet: {
        fontSize: 14,
        color: '#4A4A68',
        marginBottom: 8,
        lineHeight: 20,
    },
    smallText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
        backgroundColor: '#F7F7F9',
        padding: 15,
        borderRadius: 15,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: Colors.border,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    checkboxChecked: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 13,
        color: '#12172D',
        fontWeight: '600',
        lineHeight: 18,
    },
    button: {
        backgroundColor: Colors.primary,
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    buttonDisabled: {
        backgroundColor: '#E0E0E0',
        shadowOpacity: 0,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        marginRight: 8,
    },
});

export default OnboardingModal;
