import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import LogoutModal from './LogoutModal';

const Header = ({ showLogout = true, onLogout }) => {
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

    return (
        <View style={styles.header}>
            <View style={styles.leftContainer}>
                <View style={styles.logoSquare}>
                    <Ionicons name="heart" size={24} color="white" />
                </View>
                <View style={styles.titleContainer}>
                    <Text style={styles.logoText}>Datingadvice</Text>
                    <Text style={styles.welcomeText}>Welcome back!</Text>
                </View>
            </View>

            {showLogout && (
                <>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={() => setLogoutModalVisible(true)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="log-out-outline" size={24} color={Colors.text} />
                    </TouchableOpacity>

                    <LogoutModal
                        visible={logoutModalVisible}
                        onClose={() => setLogoutModalVisible(false)}
                        onConfirm={() => {
                            setLogoutModalVisible(false);
                            if (onLogout) onLogout();
                        }}
                    />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingBottom: 15,
        backgroundColor: 'transparent',
        ...Platform.select({
            web: {
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backgroundColor: 'rgba(248, 250, 252, 0.8)',
            }
        })
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoSquare: {
        width: 48,
        height: 48,
        backgroundColor: Colors.primary,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    titleContainer: {
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 24,
        fontWeight: '900',
        color: Colors.secondary,
        letterSpacing: -0.5,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    welcomeText: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 2,
    },
    logoutButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
});

export default Header;
