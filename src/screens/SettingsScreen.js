import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';

const SettingsScreen = ({ navigation }) => {
    const settingsOptions = [
        { id: '1', title: 'Notifications' },
        { id: '2', title: 'Privacy' },
        { id: '3', title: 'Help & Support' },
        { id: '4', title: 'About' },
    ];

    return (
        <ScreenWrapper>
            <Header onLogout={() => navigation.navigate('Login')} />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Settings</Text>

                <View style={styles.optionsContainer}>
                    {settingsOptions.map((option) => (
                        <TouchableOpacity key={option.id} style={styles.optionCard} activeOpacity={0.7}>
                            <Text style={styles.optionText}>{option.title}</Text>
                            <Ionicons name="chevron-forward" size={20} color="#7C8BA0" />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.signOutButton}
                    onPress={() => navigation.navigate('Login')}
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
