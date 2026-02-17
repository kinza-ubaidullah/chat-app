import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import InputField from '../components/InputField';
import ScreenWrapper from '../components/ScreenWrapper';

import { supabase } from '../lib/supabase';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSend = async () => {
        setErrorMessage('');
        setSuccessMessage('');

        if (!email) {
            setErrorMessage('Please enter your email address.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

            if (error) {
                setErrorMessage(error.message);
            } else {
                // Navigate to OTPScreen with recovery type
                navigation.navigate('OTP', { email: email.trim(), type: 'recovery' });
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            setErrorMessage('Connection failed. Please check your internet.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={24} color={Colors.text} />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <View style={styles.logoRow}>
                            <View style={styles.logoSquare}>
                                <Ionicons name="heart" size={24} color="white" />
                            </View>
                            <Text style={styles.logoText}>Datingadvice</Text>
                        </View>
                        <Text style={styles.title}>Forgot Password</Text>
                        <Text style={styles.subtitle}>Enter your email address and we'll send you a link to reset your password.</Text>
                    </View>

                    {/* Messages */}
                    {errorMessage ? (
                        <View style={styles.errorBanner}>
                            <Ionicons name="alert-circle" size={20} color="#E94057" />
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        </View>
                    ) : null}

                    {successMessage ? (
                        <View style={styles.successBanner}>
                            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                            <Text style={styles.successText}>{successMessage}</Text>
                        </View>
                    ) : null}

                    <InputField
                        label="Email"
                        placeholder="you@example.com"
                        icon="mail-outline"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (errorMessage) setErrorMessage('');
                            if (successMessage) setSuccessMessage('');
                        }}
                        error={!!errorMessage && !email}
                    />

                    <TouchableOpacity
                        style={[styles.sendButton, loading && { opacity: 0.7 }]}
                        onPress={handleSend}
                        disabled={loading}
                    >
                        <Text style={styles.sendButtonText}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Remember your password? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.footerLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        paddingHorizontal: 30,
        paddingBottom: 40,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 20,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoSquare: {
        width: 40,
        height: 40,
        backgroundColor: Colors.primary,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    logoText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#121E39',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    title: {
        fontSize: 34,
        fontWeight: '700',
        color: '#121E39',
        marginBottom: 15,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#7C8BA0',
        textAlign: 'center',
        lineHeight: 24,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F5',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(233, 64, 87, 0.2)',
    },
    errorText: {
        color: '#E94057',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
        flex: 1,
    },
    successBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F9F2',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.2)',
    },
    successText: {
        color: '#4CAF50',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
        flex: 1,
    },
    sendButton: {
        width: '100%',
        height: 60,
        backgroundColor: Colors.primary,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 25,
    },
    sendButtonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: '#7C8BA0',
        fontSize: 14,
    },
    footerLink: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '700',
    },
});

export default ForgotPasswordScreen;
