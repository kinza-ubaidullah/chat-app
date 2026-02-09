import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';

const HomeScreen = ({ navigation }) => {
    return (
        <ScreenWrapper>
            <Header onLogout={() => navigation.navigate('Login')} />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Welcome Banner */}
                <View style={styles.banner}>
                    <Text style={styles.userName}>Hello, kinzaubaidullah62!</Text>
                    <Text style={styles.wavingHand}>👋</Text>
                    <Text style={styles.bannerSubtitle}>Ready to connect with your advisor today?</Text>
                </View>

                {/* Grid Stats */}
                <View style={styles.gridContainer}>
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('Subscription')}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: '#FDF1F3' }]}>
                            <Ionicons name="card" size={20} color={Colors.primary} />
                        </View>
                        <Text style={styles.cardLabel}>Subscription</Text>
                        <Text style={styles.cardValue}>Free Plan</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.card}>
                        <View style={[styles.iconCircle, { backgroundColor: '#EFFFF4' }]}>
                            <Ionicons name="call" size={20} color="#4CAF50" />
                        </View>
                        <Text style={styles.cardLabel}>Voice Calls</Text>
                        <Text style={styles.cardValue}>Available</Text>
                    </TouchableOpacity>

                    <View style={[styles.card, { height: 'auto', paddingVertical: 20 }]}>
                        <Text style={styles.statValue}>3</Text>
                        <Text style={styles.statLabel}>Sessions This Month</Text>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: '30%' }]} />
                        </View>
                    </View>

                    <View style={[styles.card, { height: 'auto', paddingVertical: 20 }]}>
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Total Sessions</Text>
                        <Ionicons name="stats-chart" size={16} color={Colors.textSecondary} style={{ marginTop: 8 }} />
                    </View>
                </View>

                {/* Available Advisors */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Available Advisors</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.advisorCard}
                    onPress={() => navigation.navigate('ChatDetail', { name: 'Sophia' })}
                >
                    <View style={styles.advisorInfo}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarPlaceholder}>
                                <Ionicons name="person" size={40} color="#ADAFBB" />
                            </View>
                            <View style={[styles.onlineBadge, { backgroundColor: '#4CAF50' }]} />
                        </View>
                        <View style={styles.advisorText}>
                            <Text style={styles.advisorName}>Sophia</Text>
                            <Text style={styles.advisorTitle}>Communication Expert</Text>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={14} color="#FFB800" />
                                <Text style={styles.ratingText}>4.9 (124 reviews)</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.arrowCircle}>
                        <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
                    </View>
                </TouchableOpacity>

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
    banner: {
        backgroundColor: Colors.primaryLight,
        borderRadius: 30,
        padding: 25,
        marginTop: 20,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#FAD1D7',
    },
    userName: {
        fontSize: 26,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 5,
    },
    wavingHand: {
        fontSize: 32,
        marginBottom: 15,
    },
    bannerSubtitle: {
        fontSize: 17,
        color: Colors.textSecondary,
        lineHeight: 24,
        fontWeight: '500',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 35,
    },
    card: {
        width: '48%',
        backgroundColor: Colors.white,
        borderRadius: 25,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1.5,
        borderColor: Colors.border,
        shadowColor: '#121E39',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    cardLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    progressBar: {
        height: 6,
        backgroundColor: Colors.border,
        borderRadius: 3,
        marginTop: 12,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.text,
    },
    seeAll: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '700',
        backgroundColor: Colors.primaryLight,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    advisorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.white,
        borderRadius: 25,
        padding: 18,
        marginBottom: 15,
        borderWidth: 1.5,
        borderColor: Colors.border,
    },
    advisorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 18,
    },
    avatarPlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: Colors.inputBackground,
        alignItems: 'center',
        justifyContent: 'center',
    },
    onlineBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 3,
        borderColor: Colors.white,
    },
    advisorText: {
        justifyContent: 'center',
    },
    advisorName: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.text,
    },
    advisorTitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginVertical: 4,
        fontWeight: '500',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginLeft: 6,
        fontWeight: '600',
    },
    arrowCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default HomeScreen;
