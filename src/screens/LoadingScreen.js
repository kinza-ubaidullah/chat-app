import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Text, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const LoadingScreen = ({ message = "Loading your experience..." }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.2,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(opacityAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 0.6,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ]),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Colors.white, '#FFF5F6']}
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.content}>
                <Animated.View style={[
                    styles.logoContainer,
                    {
                        transform: [{ scale: scaleAnim }],
                        opacity: opacityAnim,
                    }
                ]}>
                    <LinearGradient
                        colors={[Colors.primary, Colors.primary + 'DD']}
                        style={styles.logoSquare}
                    >
                        <Ionicons name="heart" size={50} color="white" />
                    </LinearGradient>
                </Animated.View>

                <Text style={styles.title}>Datingadvice</Text>
                <View style={styles.messageContainer}>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.dots}>
                        {/* Animated dots could go here */}
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.white,
    },
    content: {
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 30,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    logoSquare: {
        width: 100,
        height: 100,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.text,
        marginBottom: 10,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    messageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    message: {
        fontSize: 16,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
});

export default LoadingScreen;
