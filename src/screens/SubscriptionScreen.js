import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, Animated, ActivityIndicator, TextInput, Alert, Modal } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import { supabase } from '../lib/supabase';

const SubscriptionScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('Upgrade');
    const [prices, setPrices] = useState({ pro: '9.99', premium: '19.99' });
    const [currency, setCurrency] = useState('$');
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [userUsage, setUserUsage] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [customAmount, setCustomAmount] = useState('10');
    const [customType, setCustomType] = useState('chat'); // chat or voice

    // Checkout Modal State
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);

    useEffect(() => {
        fetchSubscriptionSettings();
    }, []);

    const fetchSubscriptionSettings = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: usage } = await supabase.from('user_usage').select('*').eq('user_id', user.id).single();
                setUserUsage(usage);
            }

            const { data: settings } = await supabase
                .from('system_settings')
                .select('key_name, key_value')
                .in('key_name', ['SUBSCRIPTION_PRICE_PRO', 'SUBSCRIPTION_PRICE_PREMIUM', 'SUBSCRIPTION_CURRENCY']);

            if (settings && settings.length > 0) {
                const newPrices = { ...prices };
                let newCurrency = currency;

                settings.forEach(setting => {
                    if (setting.key_name === 'SUBSCRIPTION_PRICE_PRO') newPrices.pro = setting.key_value;
                    if (setting.key_name === 'SUBSCRIPTION_PRICE_PREMIUM') newPrices.premium = setting.key_value;
                    if (setting.key_name === 'SUBSCRIPTION_CURRENCY') newCurrency = setting.key_value;
                });

                setPrices(newPrices);
                setCurrency(newCurrency);
            }
        } catch (error) {
            console.error('Error fetching subscription settings:', error);
        } finally {
            setLoadingSettings(false);
        }
    };

    const handlePlanPress = (planType, price) => {
        setSelectedPlanDetails({ planType, price: `${currency}${price}` });
        setShowCheckoutModal(true);
    };

    const handleUpgrade = async () => {
        if (!selectedPlanDetails || processing) return;
        const { planType } = selectedPlanDetails;

        setProcessing(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                Alert.alert('Auth Error', 'Please log in.');
                return;
            }

            const { data: currentUsage } = await supabase.from('user_usage').select('*').eq('user_id', user.id).single();

            let newUsage = {
                user_id: user.id,
                updated_at: new Date().toISOString()
            };

            if (planType.startsWith('TopUp')) {
                const amount = parseInt(customAmount || 0);
                if (planType.includes('Chat')) {
                    newUsage.messages_left = (currentUsage?.messages_left || 0) + (amount * 50);
                } else {
                    newUsage.voice_minutes_left = (currentUsage?.voice_minutes_left || 0) + (amount * 5);
                }
            } else {
                newUsage.plan_type = planType;
                newUsage.messages_left = planType === 'Pro' ? 1000 : planType === 'Premium' ? 5000 : 5;
                newUsage.voice_minutes_left = planType === 'Pro' ? 60 : planType === 'Premium' ? 300 : 0;
            }

            const { error } = await supabase.from('user_usage').upsert(newUsage);

            if (error) throw error;

            setShowCheckoutModal(false);
            Alert.alert('Success', `Thank you! Your ${planType} plan is now active.`);
            navigation.goBack();
        } catch (error) {
            console.error('Billing Error:', error);
            Alert.alert('Error', 'Failed to process transaction.');
        } finally {
            setProcessing(false);
        }
    };

    const renderCheckoutModal = () => (
        <Modal
            visible={showCheckoutModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCheckoutModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Checkout</Text>
                        <TouchableOpacity onPress={() => setShowCheckoutModal(false)}>
                            <Ionicons name="close" size={24} color={Colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.orderSummary}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Plan Selected</Text>
                            <Text style={styles.summaryValue}>{selectedPlanDetails?.planType}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Amount</Text>
                            <Text style={styles.summaryPrice}>{selectedPlanDetails?.price}</Text>
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, { fontSize: 16, marginTop: 20 }]}>Select Payment Method</Text>

                    <TouchableOpacity style={styles.paymentMethodCard} onPress={handleUpgrade}>
                        <View style={styles.paymentIconBg}>
                            <Ionicons name="card" size={24} color={Colors.primary} />
                        </View>
                        <View style={styles.paymentText}>
                            <Text style={styles.paymentName}>Credit / Debit Card</Text>
                            <Text style={styles.paymentDesc}>Visa, Mastercard, Amex</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.border} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.paymentMethodCard} onPress={handleUpgrade}>
                        <View style={[styles.paymentIconBg, { backgroundColor: '#F5F5F7' }]}>
                            <Ionicons name="logo-apple" size={24} color="#000" />
                        </View>
                        <View style={styles.paymentText}>
                            <Text style={styles.paymentName}>Apple Pay</Text>
                            <Text style={styles.paymentDesc}>Fast & Secure</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.border} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.paymentMethodCard} onPress={handleUpgrade}>
                        <View style={[styles.paymentIconBg, { backgroundColor: '#E8F0FE' }]}>
                            <Ionicons name="logo-google" size={24} color="#4285F4" />
                        </View>
                        <View style={styles.paymentText}>
                            <Text style={styles.paymentName}>Google Pay</Text>
                            <Text style={styles.paymentDesc}>Quick checkout</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.border} />
                    </TouchableOpacity>

                    <View style={styles.secureBadge}>
                        <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
                        <Text style={styles.secureText}>PCI-DSS Secure Checkout</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.payButton, processing && { opacity: 0.7 }]}
                        onPress={handleUpgrade}
                        disabled={processing}
                    >
                        {processing ? <ActivityIndicator color="#FFF" /> : (
                            <Text style={styles.payButtonText}>Confirm Purchase</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const renderUpgrade = () => (
        <View style={styles.tabContent}>

            {/* Current Plan Card */}
            <View style={styles.currentPlanCard}>
                <View style={[styles.planIconContainer, { backgroundColor: '#FAD1D7' }]}>
                    <Ionicons name="ribbon-outline" size={24} color={Colors.primary} />
                </View>
                <View style={styles.planInfo}>
                    <Text style={styles.currentPlanLabel}>Current Plan</Text>
                    <Text style={styles.currentPlanName}>{userUsage?.plan_type || 'Free Plan'}</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Choose a Plan</Text>

            {/* Free Plan */}
            <TouchableOpacity style={styles.planCard}>
                <View style={styles.planHeader}>
                    <View>
                        <Text style={styles.planName}>Free</Text>
                        <View style={styles.priceRow}>
                            <Text style={styles.currency}>{currency}</Text>
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
            <TouchableOpacity
                style={[styles.planCard, userUsage?.plan_type === 'Pro' && styles.selectedPlanCard]}
                onPress={() => handlePlanPress('Pro', prices.pro)}
                disabled={processing || userUsage?.plan_type === 'Pro'}
            >
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
                            <Text style={styles.currency}>{currency}</Text>
                            <Text style={styles.price}>{loadingSettings ? '...' : prices.pro}</Text>
                            <Text style={styles.duration}>/month</Text>
                        </View>
                    </View>
                    <View style={[styles.radioButton, userUsage?.plan_type === 'Pro' && styles.radioButtonSelected]}>
                        {userUsage?.plan_type === 'Pro' && <View style={styles.radioInner} />}
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
            <TouchableOpacity
                style={[styles.planCard, userUsage?.plan_type === 'Premium' && styles.selectedPlanCard]}
                onPress={() => handlePlanPress('Premium', prices.premium)}
                disabled={processing || userUsage?.plan_type === 'Premium'}
            >
                <View style={styles.planHeader}>
                    <View>
                        <Text style={styles.planName}>Premium</Text>
                        <View style={styles.priceRow}>
                            <Text style={styles.currency}>{currency}</Text>
                            <Text style={styles.price}>{loadingSettings ? '...' : prices.premium}</Text>
                            <Text style={styles.duration}>/month</Text>
                        </View>
                    </View>
                    <View style={[styles.radioButton, userUsage?.plan_type === 'Premium' && styles.radioButtonSelected]}>
                        {userUsage?.plan_type === 'Premium' && <View style={styles.radioInner} />}
                    </View>
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

    const renderCredits = () => (
        <View style={styles.tabContent}>
            <View style={styles.topUpCard}>
                <Text style={styles.sectionTitle}>Custom Top-Up</Text>

                <View style={styles.typeToggle}>
                    <TouchableOpacity
                        style={[styles.typeBtn, customType === 'chat' && styles.activeTypeBtn]}
                        onPress={() => setCustomType('chat')}
                    >
                        <Text style={[styles.typeBtnText, customType === 'chat' && styles.activeTypeText]}>Chat Credits</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeBtn, customType === 'voice' && styles.activeTypeBtn]}
                        onPress={() => setCustomType('voice')}
                    >
                        <Text style={[styles.typeBtnText, customType === 'voice' && styles.activeTypeText]}>Voice Mins</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.amountInputContainer}>
                    <Text style={styles.inputLabel}>Amount (USD)</Text>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.currencySign}>$</Text>
                        <TextInput
                            style={styles.amountInput}
                            keyboardType="numeric"
                            value={customAmount}
                            onChangeText={setCustomAmount}
                        />
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.yieldContainer}>
                    <Text style={styles.yieldValue}>
                        {customType === 'chat' ? (parseInt(customAmount || 0) * 50) : (parseInt(customAmount || 0) * 5)}
                    </Text>
                    <Text style={styles.yieldLabel}>{customType === 'chat' ? 'Messages' : 'Minutes'}</Text>
                </View>

                <TouchableOpacity
                    style={[styles.actionButton, processing && { opacity: 0.7 }]}
                    onPress={() => handlePlanPress(customType === 'chat' ? 'TopUp-Chat' : 'TopUp-Voice', customAmount)}
                    disabled={processing}
                >
                    <Text style={styles.actionButtonText}>{processing ? 'Processing...' : 'Purchase Credits'}</Text>
                </TouchableOpacity>
            </View>
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
                    <Text style={[styles.toggleText, activeTab === 'Upgrade' && styles.activeToggleText]}>Plans</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, activeTab === 'Credits' && styles.activeToggleButton]}
                    onPress={() => setActiveTab('Credits')}
                >
                    <Text style={[styles.toggleText, activeTab === 'Credits' && styles.activeToggleText]}>Top Up</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, activeTab === 'History' && styles.activeToggleButton]}
                    onPress={() => setActiveTab('History')}
                >
                    <Text style={[styles.toggleText, activeTab === 'History' && styles.activeToggleText]}>History</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {activeTab === 'Upgrade' ? renderUpgrade() : activeTab === 'Credits' ? renderCredits() : renderHistory()}
            </ScrollView>

            {renderCheckoutModal()}
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
    topUpCard: {
        backgroundColor: Colors.white,
        borderRadius: 25,
        padding: 30,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        alignItems: 'center',
    },
    typeToggle: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        padding: 5,
        width: '100%',
        marginVertical: 20,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    activeTypeBtn: {
        backgroundColor: Colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        elevation: 2,
    },
    typeBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#7C8BA0',
    },
    activeTypeText: {
        color: Colors.primary,
    },
    amountInputContainer: {
        width: '100%',
        marginBottom: 25,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#7C8BA0',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 15,
        paddingHorizontal: 20,
    },
    currencySign: {
        fontSize: 24,
        fontWeight: '800',
        color: '#121E39',
        marginRight: 10,
    },
    amountInput: {
        flex: 1,
        height: 60,
        fontSize: 28,
        fontWeight: '800',
        color: '#121E39',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 20,
    },
    yieldContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    yieldValue: {
        fontSize: 48,
        fontWeight: '900',
        color: Colors.primary,
    },
    yieldLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#7C8BA0',
        textTransform: 'uppercase',
    },
    actionButton: {
        width: '100%',
        height: 60,
        backgroundColor: '#121E39',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        padding: 30,
        minHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#121E39',
    },
    orderSummary: {
        backgroundColor: '#F9FAFB',
        borderRadius: 20,
        padding: 20,
        marginBottom: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    summaryPrice: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.primary,
    },
    paymentMethodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 15,
        marginTop: 15,
        borderWidth: 1.5,
        borderColor: '#F0F0F0',
    },
    paymentIconBg: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: '#FDF1F3',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    paymentText: {
        flex: 1,
    },
    paymentName: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 2,
    },
    paymentDesc: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 25,
    },
    secureText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '700',
        marginLeft: 6,
        textTransform: 'uppercase',
    },
    payButton: {
        backgroundColor: '#121E39',
        height: 65,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    payButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
    },
});

export default SubscriptionScreen;
