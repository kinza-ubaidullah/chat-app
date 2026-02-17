import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Linking } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

const ContactScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState(null);
    const [contactInfo, setContactInfo] = useState({
        title: "Get in Touch",
        email: "support@lovewise.io",
        address: "123 Heart Street, Relationship City"
    });

    useEffect(() => {
        fetchContactData();
    }, []);

    const fetchContactData = async () => {
        setLoading(true);
        try {
            // Fetch Webhook
            const { data: webhookData } = await supabase
                .from('system_settings')
                .select('key_value')
                .eq('key_name', 'N8N_CONTACT_WEBHOOK')
                .single();
            if (webhookData) setWebhookUrl(webhookData.key_value);

            // Fetch Contact Info
            const { data: info } = await supabase
                .from('contact_details')
                .select('*')
                .single();
            if (info) {
                setContactInfo({
                    title: info.title || "Contact Us",
                    email: info.email || "support@lovewise.io",
                    address: info.office_address || "Virtual Office"
                });
            }
        } catch (error) {
            console.error('Error fetching contact data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.message) {
            Alert.alert('Missing Info', 'Please fill in all fields.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        setSubmitting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(webhookUrl || 'https://n8n.datingadvice.io/webhook/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    userId: session?.user?.id || 'guest',
                }),
            });

            if (response.ok) {
                Alert.alert('Success', 'Your message has been sent!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
                setFormData({ name: '', email: '', message: '' });
            } else {
                throw new Error('Failed to send');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again later.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <View style={[styles.container, styles.centered]}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <Header onLogout={() => navigation.navigate('Login')} />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
                    <Text style={styles.backText}>BACK</Text>
                </TouchableOpacity>

                <Text style={styles.title}>{contactInfo.title}</Text>
                <Text style={styles.subtitle}>
                    Reach out to us at <Text style={styles.highlight}>{contactInfo.email}</Text> or fill out the form below.
                </Text>

                {/* Contact Info Cards */}
                <View style={styles.infoRow}>
                    <View style={styles.infoCard}>
                        <View style={[styles.iconCircle, { backgroundColor: '#EFFFF4' }]}>
                            <Ionicons name="location" size={20} color="#4CAF50" />
                        </View>
                        <Text style={styles.infoLabel}>Office</Text>
                        <Text style={styles.infoValue}>{contactInfo.address}</Text>
                    </View>

                    <View style={styles.infoCard}>
                        <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
                            <Ionicons name="mail" size={20} color="#2196F3" />
                        </View>
                        <Text style={styles.infoLabel}>Social</Text>
                        <Text style={styles.infoValue}>@lovewise_ai</Text>
                    </View>
                </View>

                {/* Form */}
                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Your Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="John Doe"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholderTextColor={Colors.placeholder}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="john@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            placeholderTextColor={Colors.placeholder}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Message</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="How can we help you today?"
                            multiline
                            numberOfLines={5}
                            value={formData.message}
                            onChangeText={(text) => setFormData({ ...formData, message: text })}
                            placeholderTextColor={Colors.placeholder}
                            textAlignVertical="top"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Text style={styles.submitText}>Send Message</Text>
                                <Ionicons name="paper-plane" size={18} color="#FFF" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFCFB',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backText: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.5,
        color: Colors.textSecondary,
        marginLeft: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        lineHeight: 24,
        marginBottom: 30,
    },
    highlight: {
        color: Colors.primary,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    infoCard: {
        width: '48%',
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text,
    },
    formCard: {
        backgroundColor: Colors.white,
        borderRadius: 30,
        padding: 25,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#F7F8FA',
        borderRadius: 15,
        padding: 16,
        fontSize: 16,
        color: Colors.text,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    textArea: {
        height: 120,
        paddingTop: 16,
    },
    submitButton: {
        backgroundColor: Colors.primary,
        borderRadius: 18,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 10,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    submitText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
});

export default ContactScreen;
