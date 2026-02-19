import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const TopUpModal = ({ visible, onClose, onTopUp, onStartCall, minutesBalance = 0 }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.dismissArea}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <View style={styles.card}>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Ionicons name="close" size={24} color="#9CA3AF" />
                    </TouchableOpacity>

                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="mic" size={40} color={Colors.primary} />
                        </View>
                        <View style={styles.badge}>
                            <Ionicons name="add" size={16} color="white" />
                        </View>
                    </View>

                    <Text style={styles.title}>Add Call Minutes</Text>

                    <View style={styles.balanceContainer}>
                        <Text style={styles.balanceLabel}>Current Balance</Text>
                        <Text style={styles.balanceValue}>{minutesBalance.toFixed(1)} mins</Text>
                    </View>

                    <Text style={styles.description}>
                        You need call minutes to talk with our expert advisors. Top up now to start your private consultation!
                    </Text>

                    {minutesBalance > 0.1 && (
                        <TouchableOpacity
                            style={[styles.topUpBtn, { marginBottom: 10 }]} // Keep marginBottom here
                            onPress={() => {
                                onClose();
                                // Logic to trigger the actual voice modal should be handled via a prop or parent state
                                if (onStartCall) onStartCall();
                            }}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#FF6B6B', '#E94057']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientBtn}
                            >
                                <Text style={styles.topUpBtnText}>Start Call Now</Text>
                                <Ionicons name="call" size={18} color="white" />
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.topUpBtn}
                        onPress={() => {
                            onClose();
                            onTopUp();
                        }}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#12172D', '#2D3455']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientBtn}
                        >
                            <Text style={styles.topUpBtnText}>Top Up Minutes</Text>
                            <Ionicons name="card" size={18} color="white" />
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.laterBtn}
                        onPress={onClose}
                    >
                        <Text style={styles.laterBtnText}>Maybe Later</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dismissArea: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: 'white',
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    closeBtn: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1,
    },
    iconContainer: {
        marginBottom: 20,
        position: 'relative',
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: Colors.primary,
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 3,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#12172D',
        marginBottom: 15,
        textAlign: 'center',
    },
    balanceContainer: {
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 15,
        marginBottom: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    balanceLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    balanceValue: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.primary,
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    topUpBtn: {
        width: '100%',
        height: 56,
        borderRadius: 18,
        overflow: 'hidden',
    },
    gradientBtn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    topUpBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    laterBtn: {
        paddingVertical: 10,
    },
    laterBtnText: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '600',
    }
});

export default TopUpModal;
