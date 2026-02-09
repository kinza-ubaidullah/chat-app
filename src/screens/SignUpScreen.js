import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Animated
} from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import InputField from '../components/InputField';
import ScreenWrapper from '../components/ScreenWrapper';

const SignUpScreen = ({ navigation }) => {
    const [agreed, setAgreed] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <Animated.ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    style={{ opacity: fadeAnim }}
                >
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={24} color={Colors.text} />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <View style={styles.logoRow}>
                            <View style={styles.logoSquare}>
                                <Ionicons name="heart" size={28} color="white" />
                            </View>
                            <Text style={styles.logoText}>LoveWise</Text>
                        </View>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join our community of heart-seekers</Text>
                    </View>

                    <InputField
                        label="Full Name"
                        placeholder="John Doe"
                        icon="person-outline"
                        value={name}
                        onChangeText={setName}
                    />

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
                        style={styles.checkboxContainer}
                        onPress={() => setAgreed(!agreed)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.checkbox, agreed && styles.checkboxSelected]}>
                            {agreed && <Ionicons name="checkmark" size={16} color="white" />}
                        </View>
                        <Text style={styles.checkboxText}>
                            I agree to the <Text style={styles.link}>Terms & Conditions</Text>
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.createButton, !agreed && styles.createButtonDisabled]}
                        disabled={!agreed}
                        onPress={() => navigation.navigate('Main')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.createButtonText}>Create Account</Text>
                    </TouchableOpacity>

                    <View style={styles.dividerRow}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>or sign up with</Text>
                        <View style={styles.divider} />
                    </View>

                    <View style={styles.socialGroup}>
                        <TouchableOpacity style={styles.socialButton}>
                            <FontAwesome name="google" size={24} color={Colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <FontAwesome name="apple" size={24} color={Colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.footerLink}>Sign in</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.ScrollView>
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
    },
    header: {
        marginBottom: 35,
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
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
        paddingLeft: 4,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        backgroundColor: Colors.white,
    },
    checkboxSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    checkboxText: {
        fontSize: 15,
        color: Colors.textSecondary,
    },
    link: {
        color: Colors.primary,
        fontWeight: '700',
    },
    createButton: {
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
    createButtonDisabled: {
        backgroundColor: '#FAD1D7',
        shadowOpacity: 0,
    },
    createButtonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '700',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
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
    socialGroup: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 30,
    },
    socialButton: {
        width: 70,
        height: 70,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
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

export default SignUpScreen;
