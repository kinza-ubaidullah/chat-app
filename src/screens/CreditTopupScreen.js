import React, { useEffect, useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Alert, ActivityIndicator, Linking, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import ScreenWrapper from '../components/ScreenWrapper';
import { Colors } from '../theme/colors';
import CouponSection from '../components/CouponSection';

// --- Configuration ---
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'https://datingadvice.io';

const CreditTopupScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [rates, setRates] = useState({ voice_per_dollar: 2, chat_per_dollar: 400 });
    const [amount, setAmount] = useState('10'); // Default $10
    const [type, setType] = useState('voice'); // 'voice' or 'chat'
    const [isProcessing, setIsProcessing] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    // 1. Fetch Rates from Supabase (credit_rates table)
    useEffect(() => {
        const fetchRates = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase.from('credit_rates').select('*');

                if (error) {
                    console.log("Rates Fetch Error:", error.message);
                } else if (data && data.length > 0) {
                    const mappedRates = data.reduce((acc, curr) => ({
                        ...acc,
                        [curr.rate_id]: curr.units_per_dollar
                    }), {});
                    setRates(prev => ({ ...prev, ...mappedRates }));
                }
            } catch (err) {
                console.log("Rates Fetch Runtime Error:", err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchRates();
    }, []);

    // 2. Calculate Credits dynamically
    const calculatedCredits = useMemo(() => {
        const rate_id = type === 'voice' ? 'voice_per_dollar' : 'chat_per_dollar';
        const rate = rates[rate_id] || (type === 'voice' ? 2 : 400);
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount)) return 0;
        return Math.floor(parsedAmount * rate);
    }, [amount, type, rates]);

    // 3. Handle Top-up Purchase
    const handleTopUp = async () => {
        try {
            const parsedAmount = parseFloat(amount);
            if (isNaN(parsedAmount) || parsedAmount < 1) {
                Alert.alert("Invalid Amount", "Kam az kam $1 ka top-up zaroori hai.");
                return;
            }

            setIsProcessing(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                Alert.alert("Login Required", "Please login to purchase credits.");
                navigation.navigate('Login');
                return;
            }

            console.log(`Creating top-up session for ${amount} via ${BACKEND_URL} with coupon: ${appliedCoupon?.code}`);

            const response = await fetch(`${BACKEND_URL}/api/payments/stripe/create-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: session.user.id,
                    type: 'credit',
                    amount: parsedAmount,
                    credits: calculatedCredits,
                    creditType: type,
                    origin: 'mobile',
                    couponCode: appliedCoupon ? appliedCoupon.code : undefined
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Session create nahi ho saka.");
            }

            const data = await response.json();
            if (data.url) {
                Linking.openURL(data.url);
            } else {
                throw new Error("Payment URL missing.");
            }
        } catch (err) {
            console.error('Top-up purchase error:', err);
            Alert.alert("Payment Error", err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <View style={styles.centered}>
                    <ActivityIndicator color={Colors.primary} size="large" />
                    <Text style={{ marginTop: 10, color: '#9CA3AF' }}>Loading rates...</Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Credits</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Select Type</Text>
                <View style={styles.tabBar}>
                    <TouchableOpacity
                        onPress={() => setType('voice')}
                        style={[styles.tab, type === 'voice' && styles.activeTab]}
                    >
                        <Ionicons name="mic" size={18} color={type === 'voice' ? '#E94057' : '#9CA3AF'} />
                        <Text style={[styles.tabText, type === 'voice' && styles.activeTabText]}>Voice</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setType('chat')}
                        style={[styles.tab, type === 'chat' && styles.activeTab]}
                    >
                        <Ionicons name="chatbubble-ellipses" size={18} color={type === 'chat' ? '#E94057' : '#9CA3AF'} />
                        <Text style={[styles.tabText, type === 'chat' && styles.activeTabText]}>Chat</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputCard}>
                    <Text style={styles.inputLabel}>Enter Amount (USD)</Text>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.dollarSign}>$</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0"
                        />
                    </View>
                </View>

                <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>You Will Receive</Text>
                    <Text style={styles.resultValue}>{calculatedCredits}</Text>
                    <Text style={styles.resultUnit}>{type === 'voice' ? 'Voice Minutes' : 'Chat Credits'}</Text>
                </View>

                <CouponSection
                    originalPrice={parseFloat(amount) || 0}
                    onCouponApplied={(coupon) => setAppliedCoupon(coupon)}
                />

                <TouchableOpacity
                    style={[styles.payBtn, isProcessing && { opacity: 0.7 }]}
                    onPress={handleTopUp}
                    disabled={isProcessing}
                >
                    {isProcessing ? <ActivityIndicator color="#FFF" /> : (
                        <>
                            <Text style={styles.payBtnText}>Buy Now</Text>
                            <Ionicons name="card" size={18} color="#FFF" />
                        </>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    backButton: { padding: 5 },
    content: { padding: 25 },
    label: { fontSize: 12, fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 10 },
    tabBar: { flexDirection: 'row', gap: 10, marginBottom: 30 },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 15, backgroundColor: '#F3F4F6', borderRadius: 15 },
    activeTab: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E94057' },
    tabText: { fontWeight: 'bold', color: '#9CA3AF' },
    activeTabText: { color: '#E94057' },
    inputCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 2 },
    inputLabel: { fontSize: 10, fontWeight: 'bold', color: '#9CA3AF', marginBottom: 5 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center' },
    dollarSign: { fontSize: 24, fontWeight: 'bold', marginRight: 5 },
    input: { flex: 1, fontSize: 32, fontWeight: '900' },
    resultCard: { alignItems: 'center', marginVertical: 40 },
    resultLabel: { fontSize: 12, fontWeight: 'bold', color: '#9CA3AF' },
    resultValue: { fontSize: 56, fontWeight: '900', color: '#E94057' },
    resultUnit: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
    payBtn: { backgroundColor: '#111827', padding: 20, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 },
    payBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

export default CreditTopupScreen;
