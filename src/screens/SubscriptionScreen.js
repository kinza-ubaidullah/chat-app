import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Linking, Alert, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import ScreenWrapper from '../components/ScreenWrapper';
import { Colors } from '../theme/colors';
import CouponSection from '../components/CouponSection';

// --- Configuration ---
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'https://datingadvice.io';

const SubscriptionScreen = ({ navigation }) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPlanForCoupon, setSelectedPlanForCoupon] = useState(null);
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    // 1. Supabase se plans fetch karna
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);
                console.log('Fetching plans from Supabase...');

                // Try plan_settings table
                const { data, error } = await supabase
                    .from('plan_settings')
                    .select('*');

                if (error) throw error;

                console.log('Plans fetched successfully:', data);

                // Map data to handle different potential column names (name/plan_name, price/price_usd)
                const formattedPlans = (data || []).map(plan => ({
                    ...plan,
                    displayName: plan.name || plan.plan_name || 'Premium Plan',
                    displayPrice: plan.price ?? plan.price_usd ?? 0,
                })).sort((a, b) => a.displayPrice - b.displayPrice);

                setPlans(formattedPlans);
                if (formattedPlans.length > 0) {
                    setSelectedPlanForCoupon(formattedPlans[0]);
                }
            } catch (err) {
                console.error('Fetch plans error:', err);
                Alert.alert("Data Error", "Pricing load nahi ho saki. Please check your connection.");
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    // 2. Stripe Checkout process start karna
    const handleSubscribe = async (planName) => {
        try {
            setIsProcessing(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                Alert.alert("Login Required", "Please login to subscribe.");
                navigation.navigate('Login');
                return;
            }

            console.log(`Creating payment session for ${planName} via ${BACKEND_URL} with coupon: ${appliedCoupon?.code}`);

            const response = await fetch(`${BACKEND_URL}/api/payments/stripe/create-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: session.user.id,
                    type: 'plan',
                    planName: planName,
                    origin: 'mobile',
                    couponCode: appliedCoupon ? appliedCoupon.code : undefined
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const data = await response.json();
            if (data.url) {
                console.log('Redirecting to Stripe:', data.url);
                Linking.openURL(data.url);
            } else {
                throw new Error(data.error || "Payment session URL missing.");
            }
        } catch (err) {
            console.error('Purchase error:', err);
            Alert.alert("Payment Error", err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={{ marginTop: 15, color: Colors.textSecondary, fontSize: 16, fontWeight: '600' }}>Loading VIP Plans...</Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            {/* Header Area */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={Colors.secondary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Premium Plans</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.topInfo}>
                    <Ionicons name="sparkles" size={56} color={Colors.gold} />
                    <Text style={styles.title}>Go VIP Today</Text>
                    <Text style={styles.subtitle}>Supercharge your dating experience with elite AI</Text>
                </View>

                {plans.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No premium plans available right now.</Text>
                    </View>
                ) : (
                    plans.map((plan) => (
                        <TouchableOpacity
                            key={plan.id}
                            style={[
                                styles.card,
                                (selectedPlanForCoupon?.id === plan.id) && styles.selectedCard,
                                (plan.displayName === 'Elite' || plan.is_popular) && styles.eliteCardBorder
                            ]}
                            onPress={() => setSelectedPlanForCoupon(plan)}
                            activeOpacity={0.9}
                        >
                            {(plan.displayName === 'Elite' || plan.is_popular) && (
                                <View style={styles.popularBadge}><Text style={styles.popularText}>BEST VALUE</Text></View>
                            )}

                            <View style={styles.planHeader}>
                                <Text style={styles.planName}>{plan.displayName}</Text>
                                <View style={styles.priceRow}>
                                    <Text style={styles.price}>${plan.displayPrice}</Text>
                                    <Text style={styles.period}>/mo</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.features}>
                                {Array.isArray(plan.features) && plan.features.map((f, i) => (
                                    <View key={i} style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={18} color="#E94057" />
                                        <Text style={styles.featureText}>{f}</Text>
                                    </View>
                                ))}
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                {selectedPlanForCoupon && (
                    <CouponSection
                        originalPrice={selectedPlanForCoupon.displayPrice}
                        onCouponApplied={(coupon) => setAppliedCoupon(coupon)}
                    />
                )}

                <TouchableOpacity
                    style={[styles.subBtn, (selectedPlanForCoupon?.displayName === 'Elite' || selectedPlanForCoupon?.is_popular) && styles.eliteBtn, isProcessing && { opacity: 0.7 }]}
                    onPress={() => handleSubscribe(selectedPlanForCoupon?.displayName)}
                    disabled={isProcessing || !selectedPlanForCoupon}
                >
                    <Text style={styles.subBtnText}>
                        {isProcessing ? 'Connecting...' : `Upgrade to ${selectedPlanForCoupon?.displayName || 'VIP'}`}
                    </Text>
                </TouchableOpacity>

                <View style={styles.secureBadgeText}>
                    <Ionicons name="shield-checkmark" size={14} color="#9CA3AF" />
                    <Text style={styles.secureText}>SECURE PCI-COMPLIANT CHECKOUT</Text>
                </View>

                <TouchableOpacity
                    style={styles.topupLink}
                    onPress={() => navigation.navigate('CreditTopup')}
                >
                    <Text style={styles.topupText}>Need more credits only? <Text style={styles.topupAction}>Top Up Credits</Text></Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: Colors.background,
    },
    headerTitle: { fontSize: 24, fontWeight: '900', color: Colors.secondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    backButton: { padding: 5 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 60 },
    topInfo: { alignItems: 'center', marginBottom: 40, marginTop: 10 },
    title: { fontSize: 36, fontWeight: '900', marginTop: 15, color: Colors.secondary, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    subtitle: { color: Colors.textSecondary, fontSize: 16, marginTop: 8, fontWeight: '500', textAlign: 'center' },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 35,
        padding: 30,
        marginBottom: 20,
        borderWidth: 1.5,
        borderColor: Colors.border,
        shadowColor: Colors.secondary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
    },
    selectedCard: { borderColor: Colors.primary, borderWidth: 2, backgroundColor: Colors.primaryLight },
    eliteCardBorder: { borderColor: Colors.primary },
    popularBadge: {
        backgroundColor: Colors.primary,
        alignSelf: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        marginBottom: 15
    },
    popularText: { color: Colors.white, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    planName: { fontSize: 26, fontWeight: '900', color: Colors.secondary },
    priceRow: { flexDirection: 'row', alignItems: 'baseline' },
    price: { fontSize: 34, fontWeight: '900', color: Colors.secondary },
    period: { color: Colors.textSecondary, fontSize: 14, marginLeft: 2, fontWeight: '700' },
    divider: { height: 1.5, backgroundColor: Colors.border, marginVertical: 25 },
    features: { marginBottom: 35 },
    featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
    featureText: { fontSize: 16, color: Colors.text, fontWeight: '600' },
    subBtn: { backgroundColor: Colors.secondary, paddingVertical: 20, borderRadius: 22, alignItems: 'center', shadowColor: Colors.secondary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 },
    eliteBtn: { backgroundColor: Colors.primary, shadowColor: Colors.primary },
    subBtnText: { color: Colors.white, fontWeight: '900', fontSize: 18, textTransform: 'uppercase', letterSpacing: 1 },
    emptyContainer: { alignItems: 'center', padding: 40 },
    emptyText: { color: Colors.textSecondary, fontSize: 16, fontWeight: '500' },
    secureBadgeText: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15, gap: 6 },
    secureText: { fontSize: 10, color: Colors.muted, fontWeight: '800', letterSpacing: 1 },
    topupLink: {
        marginTop: 30,
        alignItems: 'center',
        padding: 10,
    },
    topupText: {
        color: Colors.textSecondary,
        fontSize: 15,
        fontWeight: '500'
    },
    topupAction: {
        color: Colors.primary,
        fontWeight: '900',
    }
});

export default SubscriptionScreen;
