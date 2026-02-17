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

                <Text style={styles.title}>Datingadvice</Text>

                <View style={styles.subtitleContainer}>
                    <Ionicons name="sparkles-outline" size={16} color={Colors.primary} />
                    <Text style={styles.subtitle}>AI-Powered Dating Advice</Text>
                </View>

                <Text style={styles.description}>
                    Your personal guide to meaningful connections and lasting love
                </Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('SignUp')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.primaryButtonText}>Get Started</Text>
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
                    <TouchableOpacity>
                        <Text style={styles.footerLink}>Terms of Service</Text>
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
        width: 120,
        height: 120,
        backgroundColor: Colors.primary,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 48,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 10,
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
        fontSize: 18,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 28,
        marginBottom: 50,
        paddingHorizontal: 10,
    },
    buttonContainer: {
        width: '100%',
        gap: 15,
    },
    primaryButton: {
        width: '100%',
        height: 65,
        backgroundColor: Colors.primary,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    primaryButtonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '700',
    },
    secondaryButton: {
        width: '100%',
        height: 65,
        backgroundColor: 'transparent',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
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
