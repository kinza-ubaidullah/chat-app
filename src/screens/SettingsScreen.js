import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';

const SettingsScreen = ({ navigation }) => {
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) Alert.alert('Error', error.message);
    };

    const settingsOptions = [
        { id: '1', title: 'Notifications', screen: 'Settings' },
        { id: '2', title: 'Privacy', screen: 'Settings' },
        { id: '3', title: 'Help & Support', screen: 'Contact' },
        { id: '4', title: 'Relationship Blogs', screen: 'Blogs' },
        { id: '5', title: 'Success Stories', screen: 'SuccessStories' },
        { id: '6', title: 'About LoveWise', screen: 'About' },
    ];

    return (
        <ScreenWrapper>
            <Header onLogout={handleLogout} />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Settings</Text>

                <View style={styles.optionsContainer}>
                    {settingsOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={styles.optionCard}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate(option.screen)}
                        >
                            <Text style={styles.optionText}>{option.title}</Text>
                            <Ionicons name="chevron-forward" size={20} color="#7C8BA0" />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.signOutButton}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
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
        paddingBottom: 100, // Adjusted for tab bar
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
        padding: 24,
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    optionText: {
        fontSize: 18,
        fontWeight: '500',
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
