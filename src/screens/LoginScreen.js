import React, { useState } from 'react';
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
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async () => {
        setErrorMessage('');
        if (!email || !password) {
            setErrorMessage('Please enter both email and password.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password.trim(),
            });

            if (error) {
                setErrorMessage(error.message);
                console.error('Login error:', error);
            }
            // Success navigation is handled by App.js session listener
        } catch (err) {
            setErrorMessage('An unexpected error occurred. Please check your connection.');
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
                            <Text style={styles.title}>Welcome back</Text>
                            <Text style={styles.subtitle}>Sign in to continue your journey</Text>
                        </View>

                        {/* Error Message Display */}
                        {errorMessage ? (
                            <View style={styles.errorBanner}>
                                <Ionicons name="alert-circle" size={20} color="#E94057" />
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        ) : null}

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

                        {/* Forgot Password Link */}
                        <TouchableOpacity
                            style={styles.forgotContainer}
                            onPress={() => navigation.navigate('ForgotPassword')}
                        >
                            <Text style={styles.forgotText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#E94057', '#F27121']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.loginGradient}
                            >
                                <Text style={styles.loginButtonText}>
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Sign Up Link */}
                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                                <Text style={styles.signupLink}>Create one</Text>
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
    forgotContainer: {
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    forgotText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
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
    loginButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
    },
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loginGradient: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '800',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        fontSize: 14,
        color: '#666',
    },
    signupLink: {
        fontSize: 14,
        color: '#E94057',
        fontWeight: '800',
    },
});

export default LoginScreen;
