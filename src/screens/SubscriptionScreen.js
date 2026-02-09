import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, Animated } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';

const SubscriptionScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('Upgrade');

    const renderUpgrade = () => (
        <View style={styles.tabContent}>
            {/* Current Plan Card */}
            <View style={styles.currentPlanCard}>
                <View style={[styles.planIconContainer, { backgroundColor: '#FAD1D7' }]}>
                    <Ionicons name="ribbon-outline" size={24} color={Colors.primary} />
                </View>
                <View style={styles.planInfo}>
                    <Text style={styles.currentPlanLabel}>Current Plan</Text>
                    <Text style={styles.currentPlanName}>Free Plan</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Choose a Plan</Text>

            {/* Free Plan */}
            <TouchableOpacity style={styles.planCard}>
                <View style={styles.planHeader}>
                    <View>
                        <Text style={styles.planName}>Free</Text>
                        <View style={styles.priceRow}>
                            <Text style={styles.currency}>$</Text>
                            <Text style={styles.price}>0</Text>
                            <Text style={styles.duration}>/forever</Text>
                        </View>
                    </View>
                    <View style={styles.radioButton} />
                </View>
                <View style={styles.features}>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.featureText}>5 chat sessions/month</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.featureText}>Text only</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.featureText}>Basic support</Text>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Pro Plan */}
            <TouchableOpacity style={[styles.planCard, styles.selectedPlanCard]}>
                <View style={styles.planHeader}>
                    <View>
                        <View style={styles.nameBadgeRow}>
                            <Text style={styles.planName}>Pro</Text>
                            <View style={styles.popularBadge}>
                                <Ionicons name="sparkles" size={12} color="white" />
                                <Text style={styles.popularText}>Popular</Text>
                            </View>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.currency}>$</Text>
                            <Text style={styles.price}>9.99</Text>
                            <Text style={styles.duration}>/month</Text>
                        </View>
                    </View>
                    <View style={[styles.radioButton, styles.radioButtonSelected]}>
                        <View style={styles.radioInner} />
                    </View>
                </View>
                <View style={styles.features}>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.featureText}>Unlimited chats</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.featureText}>Voice calls</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.featureText}>Priority support</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.featureText}>All advisors</Text>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Premium Plan */}
            <TouchableOpacity style={styles.planCard}>
                <View style={styles.planHeader}>
                    <View>
                        <Text style={styles.planName}>Premium</Text>
                        <View style={styles.priceRow}>
                            <Text style={styles.currency}>$</Text>
                            <Text style={styles.price}>19.99</Text>
                            <Text style={styles.duration}>/month</Text>
                        </View>
                    </View>
                    <View style={styles.radioButton} />
                </View>
                <View style={styles.features}>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.featureText}>Everything in Pro</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.featureText}>Video calls</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.featureText}>Personal advisor</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.featureText}>24/7 support</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );

    const renderHistory = () => (
        <View style={styles.tabContent}>
            <View style={styles.historyHeader}>
                <Text style={styles.sectionTitle}>Transaction History</Text>
                <TouchableOpacity style={styles.exportButton}>
                    <Ionicons name="download-outline" size={20} color={Colors.text} />
                    <Text style={styles.exportText}>Export</Text>
                </TouchableOpacity>
            </View>

            {[1, 2, 3].map((item) => (
                <View key={item} style={styles.historyCard}>
                    <View style={styles.historyLeft}>
                        <View style={styles.receiptIcon}>
                            <View style={styles.receiptBox}>
                                <Text style={styles.receiptSign}>$</Text>
                            </View>
                        </View>
                        <View style={styles.historyText}>
                            <Text style={styles.historyPlan}>Pro Plan - Monthly</Text>
                            <View style={styles.dateRow}>
                                <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                                <Text style={styles.historyDate}>12/20/2024</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.historyRight}>
                        <Text style={styles.historyAmount}>$9.99</Text>
                        <View style={styles.completedBadge}>
                            <Text style={styles.completedText}>completed</Text>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="card" size={20} color="white" />
                    </View>
                    <Text style={styles.headerTitle}>Subscription</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[styles.toggleButton, activeTab === 'Upgrade' && styles.activeToggleButton]}
                    onPress={() => setActiveTab('Upgrade')}
                >
                    <Text style={[styles.toggleText, activeTab === 'Upgrade' && styles.activeToggleText]}>Upgrade</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, activeTab === 'History' && styles.activeToggleButton]}
                    onPress={() => setActiveTab('History')}
                >
                    <Text style={[styles.toggleText, activeTab === 'History' && styles.activeToggleText]}>History</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {activeTab === 'Upgrade' ? renderUpgrade() : renderHistory()}
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#121E39',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    closeButton: {
        padding: 5,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        margin: 20,
        padding: 5,
    },
    toggleButton: {
        flex: 1,
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    activeToggleButton: {
        backgroundColor: Colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    activeToggleText: {
        color: Colors.text,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    tabContent: {
        flex: 1,
    },
    currentPlanCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDE1E5', // Blush pink gradient-like background
        padding: 24,
        borderRadius: 25,
        marginBottom: 30,
    },
    planIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    planInfo: {
        flex: 1,
    },
    currentPlanLabel: {
        fontSize: 14,
        color: '#7C8BA0',
        fontWeight: '500',
    },
    currentPlanName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#121E39',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#121E39',
        marginBottom: 20,
    },
    planCard: {
        backgroundColor: Colors.white,
        borderRadius: 25,
        padding: 24,
        marginBottom: 15,
        borderWidth: 1.5,
        borderColor: '#F0F0F0',
    },
    selectedPlanCard: {
        borderColor: Colors.primary,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    planName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#121E39',
        marginBottom: 5,
    },
    nameBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    popularBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        marginLeft: 10,
    },
    popularText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currency: {
        fontSize: 24,
        fontWeight: '700',
        color: '#121E39',
    },
    price: {
        fontSize: 32,
        fontWeight: '800',
        color: '#121E39',
    },
    duration: {
        fontSize: 16,
        color: '#7C8BA0',
        fontWeight: '500',
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#ADAFBB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioButtonSelected: {
        borderColor: Colors.primary,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.primary,
    },
    features: {
        marginTop: 10,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    featureText: {
        fontSize: 15,
        color: '#7C8BA0',
        fontWeight: '500',
        marginLeft: 10,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    exportButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    exportText: {
        fontSize: 16,
        color: Colors.text,
        fontWeight: '600',
        marginLeft: 5,
    },
    historyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.white,
        padding: 20,
        borderRadius: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    historyLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    receiptIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#FDF1F3',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    receiptBox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: Colors.primary,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    receiptSign: {
        color: Colors.primary,
        fontWeight: '800',
        fontSize: 12,
    },
    historyText: {
        justifyContent: 'center',
    },
    historyPlan: {
        fontSize: 16,
        fontWeight: '600',
        color: '#121E39',
        marginBottom: 4,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    historyDate: {
        fontSize: 13,
        color: '#7C8BA0',
        marginLeft: 5,
        fontWeight: '500',
    },
    historyRight: {
        alignItems: 'flex-end',
    },
    historyAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#121E39',
        marginBottom: 5,
    },
    completedBadge: {
        backgroundColor: Colors.primary, // Red-ish completed badge
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
    },
    completedText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
    },
});

export default SubscriptionScreen;
