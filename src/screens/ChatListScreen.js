import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';

const ChatListScreen = ({ navigation }) => {
    const [advisors, setAdvisors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdvisors = async () => {
            // Fetch only advisors with n8n capabilities enabled (Website-like AI)
            const { data, error } = await supabase
                .from('advisors')
                .select('*')
                .order('id', { ascending: true });

            if (error) {
                console.error('Error fetching advisors:', error);
            } else if (data && data.length > 0) {
                setAdvisors(data);
            } else {
                // Fallback experts (Mirroring analysis)
                setAdvisors([
                    {
                        id: 'fallback-chloe',
                        name: 'Chloé',
                        specialty: 'The "Attachment" Fixer',
                        image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
                        is_online: true
                    },
                    {
                        id: 'fallback-malik',
                        name: 'Malik',
                        specialty: 'The Long-term Advisor',
                        image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
                        is_online: true
                    },
                    {
                        id: 'fallback-kenji',
                        name: 'Kenji',
                        specialty: 'The Conversation Deepener',
                        image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
                        is_online: true
                    },
                    {
                        id: 'fallback-valentina',
                        name: 'Valentina',
                        specialty: 'The Red Flag Spotter',
                        image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
                        is_online: true
                    }
                ]);
            }
            setLoading(false);
        };
        fetchAdvisors();
    }, []);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) Alert.alert('Error', error.message);
    };

    return (
        <ScreenWrapper>
            <Header onLogout={handleLogout} />
            <View style={styles.container}>
                <View style={styles.listHeader}>
                    <Text style={styles.title}>Your AI Advisors</Text>
                    <TouchableOpacity style={styles.searchBtn}>
                        <Ionicons name="search-outline" size={22} color={Colors.text} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={Colors.primary} />
                ) : advisors.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={60} color={Colors.border} />
                        <Text style={styles.emptyText}>No AI advisors available at the moment.</Text>
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {advisors.map(advisor => (
                            <TouchableOpacity
                                key={advisor.id}
                                style={styles.chatCard}
                                onPress={() => navigation.navigate('ChatDetail', {
                                    name: advisor.name,
                                    id: advisor.id,
                                    image_url: advisor.image_url,
                                    specialty: advisor.specialty
                                })}
                                activeOpacity={0.8}
                            >
                                <View style={styles.avatarContainer}>
                                    {advisor.image_url ? (
                                        <Image
                                            source={{ uri: advisor.image_url }}
                                            style={styles.avatarImage}
                                        />
                                    ) : (
                                        <View style={styles.avatarPlaceholder}>
                                            <Ionicons name="person" size={28} color="#ADAFBB" />
                                        </View>
                                    )}
                                    {advisor.is_online && <View style={styles.onlineBadge} />}
                                </View>

                                <View style={styles.textContainer}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.name}>{advisor.name}</Text>
                                        <Text style={styles.time}>Online</Text>
                                    </View>
                                    <View style={styles.previewRow}>
                                        <View style={styles.badgeContainer}>
                                            <Text style={styles.badgeText}>{advisor.specialty || 'Advisor'}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.preview} numberOfLines={1}>
                                        Tap to start consultation
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                        <View style={{ height: 120 }} />
                    </ScrollView>
                )}
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: 20,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 25,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.text,
    },
    searchBtn: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: Colors.white,
        borderWidth: 1.5,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chatCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 25,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: Colors.border,
        shadowColor: '#121E39',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: Colors.inputBackground,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarImage: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: Colors.inputBackground,
    },
    onlineBadge: {
        position: 'absolute',
        bottom: -1,
        right: -1,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#4CAF50',
        borderWidth: 2.5,
        borderColor: Colors.white,
    },
    textContainer: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.text,
    },
    time: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '600',
    },
    previewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    preview: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    badgeContainer: {
        backgroundColor: 'rgba(233, 64, 87, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.primary,
        textTransform: 'uppercase',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
        opacity: 0.5,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: Colors.textSecondary,
        fontWeight: '500',
        textAlign: 'center',
        width: '80%'
    },
});

export default ChatListScreen;
