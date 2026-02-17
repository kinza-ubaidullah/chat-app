import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import InputField from '../components/InputField';
import ScreenWrapper from '../components/ScreenWrapper';

import { supabase } from '../lib/supabase';

const ResetPasswordScreen = ({ navigation }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleReset = async () => {
        setErrorMessage('');
        setSuccessMessage('');

        if (!password || !confirmPassword) {
            setErrorMessage('Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setErrorMessage('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password.trim()
            });

            if (error) {
                setErrorMessage(error.message);
            } else {
                setSuccessMessage('Your password has been reset successfully!');
                setTimeout(() => {
                    navigation.navigate('Login');
                }, 2000);
            }
        } catch (err) {
            console.error('Reset password error:', err);
            setErrorMessage('An unexpected error occurred.');
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
                        <Text style={styles.title}>New Password</Text>
                        <Text style={styles.subtitle}>Create a new password to secure your account.</Text>
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
                        label="New Password"
                        placeholder="********"
                        icon="lock-closed-outline"
                        secureTextEntry
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (errorMessage) setErrorMessage('');
                        }}
                        error={!!errorMessage && !password}
                    />

                    <InputField
                        label="Confirm Password"
                        placeholder="********"
                        icon="lock-closed-outline"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            if (errorMessage) setErrorMessage('');
                        }}
                        error={!!errorMessage && !confirmPassword}
                    />

                    <TouchableOpacity
                        style={[styles.resetButton, loading && { opacity: 0.7 }]}
                        onPress={handleReset}
                        disabled={loading}
                    >
                        <Text style={styles.resetButtonText}>
                            {loading ? 'Updating...' : 'Reset Password'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Back to </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.footerLink}>Login</Text>
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
    resetButton: {
        width: '100%',
        height: 60,
        backgroundColor: Colors.primary,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 25,
    },
    resetButtonText: {
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

export default ResetPasswordScreen;
