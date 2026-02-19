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
import ScreenWrapper from '../components/ScreenWrapper';

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
        <ScreenWrapper style={{ paddingTop: 0 }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <LinearGradient
                    colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']}
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
                                    <Ionicons name="alert-circle" size={20} color={Colors.error} />
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
                                    colors={['#0F172A', '#1E293B']}
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
        width: 100,
        height: 100,
        borderRadius: 40,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.secondary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    logoHeart: {
        fontSize: 48,
        color: Colors.primary,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 35,
        padding: 30,
        shadowColor: Colors.secondary,
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.1,
        shadowRadius: 30,
        elevation: 15,
    },
    header: {
        marginBottom: 35,
    },
    title: {
        fontSize: 34,
        fontWeight: '900',
        color: Colors.secondary,
        marginBottom: 8,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    inputContainer: {
        marginBottom: 16,
    },
    input: {
        backgroundColor: Colors.inputBackground,
        borderRadius: 18,
        paddingHorizontal: 20,
        paddingVertical: 18,
        fontSize: 16,
        color: Colors.text,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    inputError: {
        borderColor: Colors.error,
        backgroundColor: Colors.error + '10',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBackground,
        borderRadius: 18,
        paddingHorizontal: 20,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 18,
        fontSize: 16,
        color: Colors.text,
    },
    eyeIcon: {
        padding: 4,
    },
    forgotContainer: {
        alignItems: 'flex-end',
        marginBottom: 30,
    },
    forgotText: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '700',
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.error + '10',
        padding: 15,
        borderRadius: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.error + '40',
    },
    errorText: {
        color: Colors.error,
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 10,
        flex: 1,
    },
    loginButton: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 25,
        shadowColor: Colors.secondary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loginGradient: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    loginButtonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    signupLink: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '900',
    },
});

export default LoginScreen;
