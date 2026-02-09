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

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');

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
                            <Text style={styles.logoText}>LoveWise</Text>
                        </View>
                        <Text style={styles.title}>Forgot Password</Text>
                        <Text style={styles.subtitle}>Enter your email address and we'll send you a code to reset your password.</Text>
                    </View>

                    <InputField
                        label="Email"
                        placeholder="you@example.com"
                        icon="mail-outline"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={() => navigation.navigate('ResetPassword')}
                    >
                        <Text style={styles.sendButtonText}>Send Reset Link</Text>
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
