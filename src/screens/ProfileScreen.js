import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';

const ProfileScreen = ({ navigation }) => {
    return (
        <ScreenWrapper>
            <Header onLogout={() => navigation.navigate('Login')} />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarMain}>
                        <View style={styles.avatarCircle}>
                            <Ionicons name="person" size={70} color={Colors.primary} />
                        </View>
                        <TouchableOpacity style={styles.editBadge}>
                            <Ionicons name="camera" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>kinzaubaidullah62</Text>
                    <Text style={styles.userEmail}>kinzaubaidullah62@gmail.com</Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>8</Text>
                        <Text style={styles.statLab}>Matches</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>12</Text>
                        <Text style={styles.statLab}>Advisors</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>4.8</Text>
                        <Text style={styles.statLab}>Rating</Text>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.infoCard}>
                        <View style={styles.infoIconBg}>
                            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                        </View>
                        <View style={styles.infoText}>
                            <Text style={styles.infoLabel}>Member since</Text>
                            <Text style={styles.infoValue}>December 2024</Text>
                        </View>
                    </View>

                    <View style={styles.infoCard}>
                        <View style={styles.infoIconBg}>
                            <Ionicons name="star-outline" size={20} color={Colors.primary} />
                        </View>
                        <View style={styles.infoText}>
                            <Text style={styles.infoLabel}>Subscription</Text>
                            <Text style={styles.infoValue}>Free Plan</Text>
                        </View>
                        <TouchableOpacity style={styles.upgradeBtn}>
                            <Text style={styles.upgradeText}>Upgrade</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: 20,
    },
    profileHeader: {
        alignItems: 'center',
        marginVertical: 40,
    },
    avatarMain: {
        position: 'relative',
        marginBottom: 20,
    },
    avatarCircle: {
        width: 130,
        height: 130,
        borderRadius: 45,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: Colors.white,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        width: 40,
        height: 40,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: Colors.white,
    },
    userName: {
        fontSize: 26,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 6,
    },
    userEmail: {
        fontSize: 15,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 25,
        padding: 20,
        marginBottom: 35,
        borderWidth: 1.5,
        borderColor: Colors.border,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
    },
    statVal: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.text,
    },
    statLab: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
        fontWeight: '600',
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: Colors.border,
    },
    infoSection: {
        gap: 15,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 25,
        padding: 20,
        borderWidth: 1.5,
        borderColor: Colors.border,
    },
    infoIconBg: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    infoText: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: 4,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.text,
    },
    upgradeBtn: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 12,
    },
    upgradeText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: '700',
    },
});

export default ProfileScreen;
