import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import InputField from '../components/InputField';
import ScreenWrapper from '../components/ScreenWrapper';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={24} color={Colors.text} />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <View style={styles.logoRow}>
                            <View style={styles.logoSquare}>
                                <Ionicons name="heart" size={28} color="white" />
                            </View>
                            <Text style={styles.logoText}>Datingadvice</Text>
                        </View>
                        <Text style={styles.title}>Welcome back</Text>
                        <Text style={styles.subtitle}>Sign in to continue your journey</Text>
                    </View>

                    <View style={styles.buttonGroup}>
                        <TouchableOpacity style={styles.socialButton}>
                            <FontAwesome name="google" size={20} color={Colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <FontAwesome name="facebook" size={20} color="#1877F2" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <FontAwesome name="apple" size={20} color={Colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.dividerRow}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>or login with email</Text>
                        <View style={styles.divider} />
                    </View>

                    <InputField
                        label="Email Address"
                        placeholder="you@example.com"
                        icon="mail-outline"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <InputField
                        label="Password"
                        placeholder="••••••••"
                        icon="lock-closed-outline"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <TouchableOpacity
                        style={styles.forgotPassword}
                        onPress={() => navigation.navigate('ForgotPassword')}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.signInButton}
                        onPress={() => navigation.navigate('Main')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.signInButtonText}>Sign In</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                            <Text style={styles.footerLink}>Create one</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 30,
        paddingBottom: 40,
        paddingTop: 20,
    },
    backButton: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    header: {
        marginBottom: 40,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    logoSquare: {
        width: 50,
        height: 50,
        backgroundColor: Colors.primary,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    logoText: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.text,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    title: {
        fontSize: 34,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    socialButton: {
        width: '30%',
        height: 60,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    divider: {
        flex: 1,
        height: 1.5,
        backgroundColor: Colors.border,
    },
    dividerText: {
        marginHorizontal: 15,
        color: Colors.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 30,
        marginTop: -5,
    },
    forgotPasswordText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '700',
    },
    signInButton: {
        width: '100%',
        height: 65,
        backgroundColor: Colors.primary,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 8,
    },
    signInButtonText: {
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
        color: Colors.textSecondary,
        fontSize: 15,
    },
    footerLink: {
        color: Colors.primary,
        fontSize: 15,
        fontWeight: '700',
    },
});

export default LoginScreen;
