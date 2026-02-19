import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Linking,
} from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { supabase } from '../lib/supabase';

const SignUpScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [termsUrl, setTermsUrl] = useState('https://datingadvice.io/terms'); // Default fallback

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('system_settings')
                .select('key_value')
                .eq('key_name', 'TERMS_URL')
                .maybeSingle();
            if (data?.key_value) setTermsUrl(data.key_value);
        };
        fetchSettings();
    }, []);

    const handleSignUp = async () => {
        setErrorMessage('');
        if (!email || !password || !confirmPassword || !name) {
            setErrorMessage('Please fill in all fields to create your account.');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }

        if (password.length < 6) {
            setErrorMessage('Password must be at least 6 characters long.');
            return;
        }

        if (!agreed) {
            setErrorMessage('Please agree to the Terms and Conditions to continue.');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password: password.trim(),
                options: {
                    data: {
                        full_name: name,
                    }
                }
            });

            if (error) {
                console.error('Signup Error Details:', JSON.stringify(error, null, 2));
                let friendlyMessage = error.message;
                if (error.message.includes('User already registered')) {
                    friendlyMessage = 'An account with this email already exists.';
                } else if (error.message.includes('Database error')) {
                    // Append detail for debugging
                    friendlyMessage += `\nCode: ${error.status || 'Unknown'}\nPlease check Supabase Logs.`;
                }
                setErrorMessage(friendlyMessage);
            } else {
                // Navigate to OTPScreen to verify email
                navigation.navigate('OTP', { email: email.trim(), type: 'signup' });
            }
        } catch (err) {
            setErrorMessage('Something went wrong during registration.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper style={{ paddingTop: 0 }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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
                        {/* Logo/Icon */}
                        <View style={styles.logoContainer}>
                            <View style={styles.logoCircle}>
                                <Text style={styles.logoHeart}>♥</Text>
                            </View>
                        </View>

                        {/* Main Card */}
                        <View style={styles.card}>
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title}>Create account</Text>
                                <Text style={styles.subtitle}>Start your journey to better relationships</Text>
                            </View>

                            {/* Error Message Display */}
                            {errorMessage ? (
                                <View style={styles.errorBanner}>
                                    <Ionicons name="alert-circle" size={20} color="#E94057" />
                                    <Text style={styles.errorText}>{errorMessage}</Text>
                                </View>
                            ) : null}

                            {/* Name Input */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={[styles.input, errorMessage && !name && styles.inputError]}
                                    placeholder="Full Name"
                                    placeholderTextColor="#999"
                                    value={name}
                                    onChangeText={(text) => {
                                        setName(text);
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    autoCapitalize="words"
                                />
                            </View>

                            {/* Email Input */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={[styles.input, errorMessage && !email && styles.inputError]}
                                    placeholder="Email Address"
                                    placeholderTextColor="#999"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputContainer}>
                                <View style={[styles.passwordContainer, errorMessage && !password && styles.inputError]}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Password"
                                        placeholderTextColor="#999"
                                        value={password}
                                        onChangeText={(text) => {
                                            setPassword(text);
                                            if (errorMessage) setErrorMessage('');
                                        }}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        <Ionicons
                                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                                            size={22}
                                            color="#999"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Confirm Password Input */}
                            <View style={styles.inputContainer}>
                                <View style={[styles.passwordContainer, errorMessage && !confirmPassword && styles.inputError]}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Confirm Password"
                                        placeholderTextColor="#999"
                                        value={confirmPassword}
                                        onChangeText={(text) => {
                                            setConfirmPassword(text);
                                            if (errorMessage) setErrorMessage('');
                                        }}
                                        secureTextEntry={!showConfirmPassword}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        <Ionicons
                                            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                            size={22}
                                            color="#999"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Terms Checkbox */}
                            <View style={styles.checkboxContainer}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setAgreed(!agreed);
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    activeOpacity={0.7}
                                    style={styles.checkboxRow}
                                >
                                    <View style={[styles.checkbox, agreed && styles.checkboxChecked, errorMessage && !agreed && styles.checkboxError]}>
                                        {agreed && <Ionicons name="checkmark" size={16} color="#fff" />}
                                    </View>
                                </TouchableOpacity>
                                <Text style={styles.checkboxText}>
                                    I agree to the{' '}
                                    <Text
                                        style={styles.linkText}
                                        onPress={() => navigation.navigate('Legal', { type: 'terms' })}
                                    >Terms</Text>
                                    {' '}and{' '}
                                    <Text
                                        style={styles.linkText}
                                        onPress={() => navigation.navigate('Legal', { type: 'privacy' })}
                                    >Privacy Policy</Text>
                                </Text>
                            </View>

                            {/* Sign Up Button */}
                            <TouchableOpacity
                                style={[styles.signupButton, loading && styles.signupButtonDisabled]}
                                onPress={handleSignUp}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#E94057', '#F27121']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.signupGradient}
                                >
                                    <Text style={styles.signupButtonText}>
                                        {loading ? 'Creating Account...' : 'Create Account'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Login Link */}
                            <View style={styles.loginContainer}>
                                <Text style={styles.loginText}>Already have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                    <Text style={styles.loginLink}>Sign in</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </LinearGradient>
            </KeyboardAvoidingView>
        </ScreenWrapper>
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
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 96,
        height: 96,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#E94057',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    logoHeart: {
        fontSize: 48,
        color: '#E94057',
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
        marginBottom: 32,
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: '#12172D',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        opacity: 0.7,
    },
    inputContainer: {
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#F7F8FA',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontSize: 16,
        color: '#12172D',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputError: {
        borderColor: '#E94057',
        backgroundColor: '#FFF5F5',
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
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 8,
        flex: 1,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F8FA',
        borderRadius: 16,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: '#12172D',
    },
    eyeIcon: {
        padding: 4,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#E5E5E5',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxError: {
        borderColor: '#E94057',
    },
    checkboxChecked: {
        backgroundColor: '#E94057',
        borderColor: '#E94057',
    },
    checkboxText: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    linkText: {
        color: '#E94057',
        fontWeight: '700',
    },
    signupButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
    },
    signupButtonDisabled: {
        opacity: 0.6,
    },
    signupGradient: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    signupButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '800',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        fontSize: 14,
        color: '#666',
    },
    loginLink: {
        fontSize: 14,
        color: '#E94057',
        fontWeight: '800',
    },
});

export default SignUpScreen;
