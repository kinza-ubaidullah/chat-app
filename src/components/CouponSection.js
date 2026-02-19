import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const CouponSection = ({ originalPrice, onCouponApplied }) => {
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 1. Validate Coupon against Supabase
    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return;

        setLoading(true);
        setError('');

        try {
            const { data: coupon, error: fetchError } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponInput.trim().toUpperCase())
                .eq('is_enabled', true)
                .single();

            if (fetchError || !coupon) {
                setError('INVALID CODE');
                setAppliedCoupon(null);
                onCouponApplied(null); // No discount
            } else {
                // Basic validation for expiry if exists in table
                if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
                    setError('EXPIRED CODE');
                    return;
                }

                setAppliedCoupon(coupon);
                onCouponApplied(coupon); // Pass successful coupon back
                Alert.alert("Success", `Coupon ${coupon.code} applied!`);
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    // 2. Calculate Discount Value
    const discountAmount = appliedCoupon
        ? (appliedCoupon.type === 'percent' ? (originalPrice * (appliedCoupon.value / 100)) : appliedCoupon.value)
        : 0;

    const finalPrice = Math.max(0, originalPrice - discountAmount);

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Apply Coupon</Text>

            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    placeholder="ENTER CODE (e.g. SAVE20)"
                    value={couponInput}
                    onChangeText={(txt) => setCouponInput(txt.toUpperCase())}
                    autoCapitalize="characters"
                    placeholderTextColor="#999"
                />
                <TouchableOpacity
                    style={styles.applyBtn}
                    onPress={handleApplyCoupon}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Text style={styles.applyBtnText}>APPLY</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Status Messages */}
            {error ? (
                <View style={styles.statusRow}>
                    <Ionicons name="alert-circle" size={14} color="#EF4444" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            {appliedCoupon ? (
                <View style={styles.statusRow}>
                    <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                    <Text style={styles.successText}>COUPON APPLIED: {appliedCoupon.code}</Text>
                </View>
            ) : null}

            {/* Summary Area */}
            <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Price</Text>
                    <Text style={styles.summaryValue}>${originalPrice.toFixed(2)}</Text>
                </View>

                {appliedCoupon && (
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: '#22C55E' }]}>Discount Applied</Text>
                        <Text style={[styles.summaryValue, { color: '#22C55E' }]}>-${discountAmount.toFixed(2)}</Text>
                    </View>
                )}

                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Grand Total</Text>
                    <Text style={styles.totalValue}>${finalPrice.toFixed(2)}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { backgroundColor: '#FFF', padding: 20, borderRadius: 25, marginVertical: 15, borderSize: 1, borderColor: '#F3F4F6', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
    sectionTitle: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 10 },
    inputRow: { flexDirection: 'row', gap: 10 },
    input: { flex: 1, backgroundColor: '#F9FAFB', padding: 15, borderRadius: 15, fontWeight: '800', color: '#111827' },
    applyBtn: { backgroundColor: '#111827', paddingHorizontal: 20, justifyContent: 'center', borderRadius: 15, minWidth: 80 },
    applyBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, paddingHorizontal: 10 },
    errorText: { color: '#EF4444', fontSize: 11, fontWeight: 'bold' },
    successText: { color: '#22C55E', fontSize: 11, fontWeight: 'bold' },
    summaryContainer: { borderTopWidth: 1, borderTopColor: '#F3F4F6', marginTop: 20, paddingTop: 20 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
    summaryValue: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
    totalRow: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 15 },
    totalLabel: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', color: '#9CA3AF' },
    totalValue: { fontSize: 32, fontWeight: '900', color: '#E94057' }
});

export default CouponSection;
