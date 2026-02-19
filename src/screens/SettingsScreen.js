import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import LogoutModal from '../components/LogoutModal';

const SettingsScreen = ({ navigation }) => {
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) Alert.alert('Error', error.message);
    };

    const settingsOptions = [
        { id: '1', title: 'Notifications', screen: 'Settings' },
        { id: '4', title: 'Relationship Blogs', screen: 'Blogs' },
        { id: '5', title: 'Success Stories', screen: 'SuccessStories' },
        { id: '6', title: 'About Dating Advice', screen: 'About' },
        { id: '7', title: 'Terms of Service', screen: 'Legal', params: { type: 'terms' } },
        { id: '8', title: 'Privacy Policy', screen: 'Legal', params: { type: 'privacy' } },
        { id: '3', title: 'Help & Support', screen: 'Contact' },
    ];

    return (
        <ScreenWrapper>
            <Header onLogout={() => setLogoutModalVisible(true)} />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Settings</Text>

                <View style={styles.optionsContainer}>
                    {settingsOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={styles.optionCard}
                            activeOpacity={0.7}
                            onPress={() => {
                                if (option.title === 'Notifications') {
                                    Alert.alert('Notifications', 'Push notification settings will be available in the next update.');
                                } else {
                                    navigation.navigate(option.screen, option.params);
                                }
                            }}
                        >
                            <View style={styles.optionLeft}>
                                <View style={[styles.iconBox, { backgroundColor: option.title === 'Notifications' ? '#FEF2F2' : '#F8FAFC' }]}>
                                    <Ionicons
                                        name={
                                            option.title === 'Notifications' ? "notifications" :
                                                option.title === 'Privacy Policy' ? "shield-checkmark" :
                                                    option.title === 'Terms of Service' ? "document-text" :
                                                        option.title === 'Success Stories' ? "heart" :
                                                            option.title === 'Relationship Blogs' ? "book" :
                                                                "chevron-forward"
                                        }
                                        size={20}
                                        color={option.title === 'Notifications' ? Colors.primary : Colors.text}
                                    />
                                </View>
                                <Text style={styles.optionText}>{option.title}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#7C8BA0" />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.signOutButton}
                    onPress={() => setLogoutModalVisible(true)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>

            <LogoutModal
                visible={logoutModalVisible}
                onClose={() => setLogoutModalVisible(false)}
                onConfirm={() => {
                    setLogoutModalVisible(false);
                    handleLogout();
                }}
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFCFB',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 120, // Adjusted for tab bar
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#121E39',
        marginVertical: 30,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    optionsContainer: {
        marginBottom: 20,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#121E39',
    },
    signOutButton: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        marginTop: 10,
    },
    signOutText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.primary,
    },
});

export default SettingsScreen;
