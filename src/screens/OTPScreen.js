import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const OTPScreen = ({ route, navigation }) => {
    const { email, type } = route.params; // type: 'signup' or 'login'
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [timer, setTimer] = useState(60);
    const inputs = useRef([]);

    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleOtpChange = (value, index) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value.length > 0 && index < 5) {
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyPress = (e, index) => {
        // Move to previous input on backspace if current is empty
        if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length < 6) {
            setErrorMessage('Please enter the complete 6-digit code.');
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            let verifyType = 'email';
            if (type === 'signup') verifyType = 'signup';
            if (type === 'recovery') verifyType = 'recovery';

            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token: otpString,
                type: verifyType,
            });

            if (error) {
                setErrorMessage(error.message);
            } else {
                console.log('OTP Verified successfully:', type);
                if (type === 'recovery') {
                    // Navigate to password reset screen
                    navigation.navigate('ResetPassword', { email });
                } else {
                    // Explicitly navigate to Main to trigger Home screen useEffect immediately
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Main' }],
                    });
                }
            }
        } catch (err) {
            setErrorMessage('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;

        setLoading(true);
        setErrorMessage('');
        try {
            if (type === 'recovery') {
                const { error } = await supabase.auth.resetPasswordForEmail(email);
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: {
                        shouldCreateUser: type === 'signup',
                    },
                });
                if (error) throw error;
            }

            setTimer(60);
            setErrorMessage('');
        } catch (err) {
            setErrorMessage(err.message || 'Failed to resend code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <LinearGradient
                colors={['#FF9A9E', '#FAD0C4', '#F7F3EE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#12172D" />
                    </TouchableOpacity>

                    <View style={styles.card}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Verify Code</Text>
                            <Text style={styles.subtitle}>
                                We've sent a 6-digit verification code to {'\n'}
                                <Text style={styles.emailText}>{email}</Text>
                            </Text>
                        </View>

                        {errorMessage ? (
                            <View style={styles.errorBanner}>
                                <Ionicons name="alert-circle" size={20} color="#E94057" />
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        ) : null}

                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    style={[
                                        styles.otpInput,
                                        digit ? styles.otpInputActive : null,
                                        errorMessage ? styles.otpInputError : null
                                    ]}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    value={digit}
                                    onChangeText={(value) => handleOtpChange(value, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    ref={(ref) => (inputs.current[index] = ref)}
                                    selectionColor="#E94057"
                                />
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[styles.verifyButton, loading && styles.buttonDisabled]}
                            onPress={handleVerify}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#E94057', '#F27121']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Verify Now</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.resendContainer}>
                            <Text style={styles.resendText}>Didn't receive code? </Text>
                            <TouchableOpacity
                                onPress={handleResend}
                                disabled={timer > 0 || loading}
                            >
                                <Text style={[styles.resendLink, timer > 0 && styles.resendDisabled]}>
                                    {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 24,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 32,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 15,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#12172D',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    emailText: {
        color: '#12172D',
        fontWeight: '700',
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F5',
        padding: 12,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(233, 64, 87, 0.2)',
    },
    errorText: {
        color: '#E94057',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 8,
        flex: 1,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    otpInput: {
        width: 45,
        height: 55,
        backgroundColor: '#F7F8FA',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E5E5',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '700',
        color: '#12172D',
    },
    otpInputActive: {
        borderColor: '#E94057',
        backgroundColor: '#fff',
    },
    otpInputError: {
        borderColor: 'rgba(233, 64, 87, 0.3)',
    },
    verifyButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
    },
    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '800',
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    resendText: {
        fontSize: 14,
        color: '#666',
    },
    resendLink: {
        fontSize: 14,
        color: '#E94057',
        fontWeight: '800',
    },
    resendDisabled: {
        color: '#999',
    },
});

export default OTPScreen;
