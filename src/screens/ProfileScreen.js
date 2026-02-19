import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, Alert, Image, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';

const ProfileScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ matches: 0, advisors: 0, rating: 4.8 });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                // Fetch profile data from the 'profiles' table
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                if (profileData) {
                    setUser({ ...authUser, profile: profileData });
                } else {
                    setUser(authUser);
                }

                // Fetch dynamic stats
                try {
                    // 1. Matches: Unique advisors the user has chatted with
                    const { data: historyData } = await supabase
                        .from('chat_history')
                        .select('advisor_id')
                        .eq('user_id', authUser.id);

                    const uniqueAdvisors = new Set((historyData || []).map(item => item.advisor_id));

                    // 2. Advisors: Total advisors available
                    const { count: advisorCount } = await supabase
                        .from('advisors')
                        .select('*', { count: 'exact', head: true });

                    setStats({
                        matches: uniqueAdvisors.size,
                        advisors: advisorCount || 0,
                        rating: 4.8 // Keep as constant profile strength rating
                    });
                } catch (statError) {
                    console.error('Error fetching profile stats:', statError);
                }
            }
        };
        fetchUserData().finally(() => setLoading(false));
    }, []);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert('Error', error.message);
        }
        // App.js will automatically handle navigation thanks to onAuthStateChange
    };

    return (
        <ScreenWrapper>
            <Header onLogout={handleLogout} />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarMain}>
                        <View style={styles.avatarCircle}>
                            {uploading ? (
                                <ActivityIndicator size="large" color={Colors.primary} />
                            ) : user?.profile?.avatar_url ? (
                                <Image
                                    source={{ uri: user.profile.avatar_url }}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <Ionicons name="person" size={70} color={Colors.primary} />
                            )}
                        </View>
                    </View>
                    <Text style={styles.userName}>
                        {user?.profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                    </Text>
                    <Text style={styles.userEmail}>{user?.email || 'Loading...'}</Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>{stats.matches}</Text>
                        <Text style={styles.statLab}>Matches</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>{stats.advisors}</Text>
                        <Text style={styles.statLab}>Advisors</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statVal, { color: Colors.accent }]}>{stats.rating}</Text>
                        <Text style={styles.statLab}>Strength</Text>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    {user?.profile?.persona_analysis && Object.keys(user.profile.persona_analysis || {}).length > 0 && (
                        <TouchableOpacity
                            style={[styles.infoCard, { backgroundColor: '#12172D', borderColor: '#12172D' }]}
                            onPress={() => navigation.navigate('Main', { screen: 'Home', params: { showAnalysis: true } })}
                        >
                            <View style={[styles.infoIconBg, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                                <Ionicons name="sparkles" size={20} color="#FFF" />
                            </View>
                            <View style={styles.infoText}>
                                <Text style={[styles.infoLabel, { color: 'rgba(255,255,255,0.6)' }]}>Your Persona</Text>
                                <Text style={[styles.infoValue, { color: '#FFF' }]}>View AI Analysis</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#FFF" />
                        </TouchableOpacity>
                    )}

                    <View style={styles.infoCard}>
                        <View style={styles.infoIconBg}>
                            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                        </View>
                        <View style={styles.infoText}>
                            <Text style={styles.infoLabel}>Member since</Text>
                            <Text style={styles.infoValue}>
                                {user ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '...'}
                            </Text>
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
                        <TouchableOpacity
                            style={styles.upgradeBtn}
                            onPress={() => navigation.navigate('Subscription')}
                        >
                            <Text style={styles.upgradeText}>Upgrade</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 120 }} />
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
        width: 140,
        height: 140,
        borderRadius: 50,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.border,
        shadowColor: Colors.secondary,
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.15,
        shadowRadius: 25,
        elevation: 10,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
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
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 20,
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
