import React, { useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

const LogoutModal = ({ visible, onClose, onConfirm }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(height)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: height,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                >
                    <Animated.View style={[styles.blur, { opacity: fadeAnim }]} />
                </TouchableOpacity>

                <Animated.View
                    style={[
                        styles.modalContainer,
                        { transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <View style={styles.content}>
                        <View style={styles.indicator} />

                        <View style={styles.iconContainer}>
                            <LinearGradient
                                colors={['#FF9A9E', '#E94057']}
                                style={styles.iconGradient}
                            >
                                <Ionicons name="log-out" size={40} color="white" />
                            </LinearGradient>
                        </View>

                        <Text style={styles.title}>Are you sure?</Text>
                        <Text style={styles.subtitle}>
                            You are about to log out. You will need to sign in again to access your dating insights and chats.
                        </Text>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onClose}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.cancelText}>Stay Logged In</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.logoutButton}
                                onPress={onConfirm}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#E94057', '#F27121']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.logoutGradient}
                                >
                                    <Text style={styles.logoutText}>Yes, Log Out</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    blur: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(18, 23, 45, 0.7)',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        paddingBottom: Platform.OS === 'ios' ? 40 : 30,
        width: '100%',
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    indicator: {
        width: 40,
        height: 5,
        backgroundColor: '#E8E6EA',
        borderRadius: 3,
        marginBottom: 25,
    },
    iconContainer: {
        marginBottom: 20,
        shadowColor: '#E94057',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    iconGradient: {
        width: 80,
        height: 80,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#12172D',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
        marginBottom: 35,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    logoutButton: {
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
    },
    logoutGradient: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    logoutText: {
        color: 'white',
        fontSize: 17,
        fontWeight: '700',
    },
    cancelButton: {
        width: '100%',
        paddingVertical: 18,
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#E8E6EA',
    },
    cancelText: {
        color: '#12172D',
        fontSize: 17,
        fontWeight: '600',
    },
});

export default LogoutModal;
