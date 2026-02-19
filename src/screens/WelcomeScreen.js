import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Animated } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';

const WelcomeScreen = ({ navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            })
        ]).start();
    }, []);



    return (
        <ScreenWrapper>
            <Animated.View style={[
                styles.content,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoSquare}>
                        <Ionicons name="heart" size={60} color="white" />
                    </View>
                </View>

                <Text style={styles.title}>Dating Advice</Text>

                <View style={styles.subtitleContainer}>
                    <Ionicons name="sparkles" size={16} color={Colors.primary} />
                    <Text style={styles.subtitle}>AI-Powered Guidance</Text>
                </View>

                <Text style={styles.description}>
                    Your personal guide to meaningful connections and lasting love. Expert advisors in your pocket.
                </Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('SignUp')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.primaryButtonText}>Create Account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => navigation.navigate('Login')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.secondaryButtonText}>I already have an account</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>By continuing you agree to our </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Legal', { type: 'terms' })}>
                        <Text style={styles.footerLink}>Terms</Text>
                    </TouchableOpacity>
                    <Text style={styles.footerText}> and </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Legal', { type: 'privacy' })}>
                        <Text style={styles.footerLink}>Privacy</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    logoContainer: {
        marginBottom: 20,
    },
    logoSquare: {
        width: 100,
        height: 100,
        backgroundColor: Colors.primary,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 10,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    subtitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryLight,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 25,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.primary,
        marginLeft: 6,
        letterSpacing: 0.5,
    },
    description: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    buttonContainer: {
        width: '100%',
        gap: 15,
    },
    primaryButton: {
        width: '100%',
        height: 60,
        backgroundColor: Colors.primary,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    primaryButtonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '700',
    },
    secondaryButton: {
        width: '100%',
        height: 60,
        backgroundColor: 'transparent',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: Colors.border,
    },
    secondaryButtonText: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButtonText: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        marginTop: 40,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    footerText: {
        color: Colors.textSecondary,
        fontSize: 13,
    },
    footerLink: {
        color: Colors.primary,
        fontSize: 13,
        fontWeight: '600',
    },
});

export default WelcomeScreen;
