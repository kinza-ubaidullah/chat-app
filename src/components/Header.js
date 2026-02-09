import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

const Header = ({ showLogout = true, onLogout }) => {
    return (
        <View style={styles.header}>
            <View style={styles.leftContainer}>
                <View style={styles.logoSquare}>
                    <Ionicons name="heart" size={24} color="white" />
                </View>
                <View style={styles.titleContainer}>
                    <Text style={styles.logoText}>LoveWise</Text>
                    <Text style={styles.welcomeText}>Welcome back!</Text>
                </View>
            </View>
            {showLogout && (
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={onLogout}
                    activeOpacity={0.7}
                >
                    <Ionicons name="log-out-outline" size={24} color={Colors.text} />
                </TouchableOpacity>
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
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.white,
        ...Platform.select({
            web: {
                position: 'sticky',
                top: 0,
                zIndex: 100,
            }
        })
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoSquare: {
        width: 46,
        height: 46,
        backgroundColor: Colors.primary,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    titleContainer: {
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.text,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    welcomeText: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '500',
        marginTop: -1,
    },
    logoutButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Colors.inputBackground,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Header;
