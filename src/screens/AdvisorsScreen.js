import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, Image,
    TouchableOpacity, ActivityIndicator, SafeAreaView, TextInput, Platform
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import { Colors } from '../theme/colors';
import VoiceCallModal from '../components/VoiceCallModal';
import TopUpModal from '../components/TopUpModal';
import { fetchAdvisors, fetchUserUsage } from '../lib/dataService';

const AdvisorsScreen = ({ navigation }) => {
    const [advisors, setAdvisors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [userId, setUserId] = useState(null);
    const [usage, setUsage] = useState(null);
    const [selectedAdvisorForCall, setSelectedAdvisorForCall] = useState(null);
    const [showTopUpModal, setShowTopUpModal] = useState(false);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUserId(session.user.id);
                const userUsage = await fetchUserUsage(session.user.id);
                setUsage(userUsage);
            }
            const data = await fetchAdvisors();
            setAdvisors(data);
            setLoading(false);
        };
        init();
    }, []);

    const filteredAdvisors = advisors.filter(item =>
        (item.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.specialty || '').toLowerCase().includes(search.toLowerCase())
    );

    const renderAdvisor = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ChatDetail', { advisor: item })}
            activeOpacity={0.9}
        >
            <View style={styles.cardHeader}>
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: item.image_url }} style={styles.avatar} />
                    {item.is_online && <View style={styles.onlineDot} />}
                </View>
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={10} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating || '5.0'}</Text>
                </View>
            </View>

            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.specialty} numberOfLines={2}>{item.specialty}</Text>

            <View style={styles.cardFooter}>
                <TouchableOpacity
                    style={styles.chatAction}
                    onPress={() => navigation.navigate('ChatDetail', { advisor: item })}
                >
                    <Ionicons name="chatbubble-ellipses" size={14} color="#FFF" />
                    <Text style={styles.actionText}>Chat Now</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.callAction}
                    onPress={() => {
                        setSelectedAdvisorForCall(item);
                        setShowTopUpModal(true);
                    }}
                >
                    <Ionicons name="mic" size={16} color="#E94057" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Dating AI Advisors</Text>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={18} color="#9CA3AF" />
                        <TextInput
                            placeholder="Search expertise..."
                            style={styles.searchInput}
                            value={search}
                            onChangeText={setSearch}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#E94057" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={filteredAdvisors}
                        renderItem={renderAdvisor}
                        keyExtractor={item => item.id.toString()}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#9CA3AF', marginTop: 50 }}>No advisors found.</Text>}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            <VoiceCallModal
                visible={!!selectedAdvisorForCall && !showTopUpModal} // Only show voice modal if topup is closed and advisor selected
                onClose={() => setSelectedAdvisorForCall(null)}
                advisor={selectedAdvisorForCall}
                userId={userId}
                onRequireTopUp={() => {
                    setSelectedAdvisorForCall(null);
                    setShowTopUpModal(true);
                }}
            />

            <TopUpModal
                visible={showTopUpModal}
                onClose={() => setShowTopUpModal(false)}
                onTopUp={() => navigation.navigate('CreditTopup')}
                onStartCall={() => {
                    // setSelectedAdvisorForCall(item) is already done in onPress
                }}
                minutesBalance={usage?.voice_minutes_left || 0}
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 25 },
    headerTitle: { fontSize: 32, fontWeight: '900', color: Colors.secondary, marginBottom: 20, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, paddingHorizontal: 15, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    searchInput: { flex: 1, padding: 14, fontSize: 15, color: Colors.text },
    list: { padding: 15, paddingBottom: 100 },
    row: { justifyContent: 'space-between' },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 30,
        padding: 20,
        width: '48%',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: Colors.secondary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
    avatarContainer: { position: 'relative' },
    avatar: { width: 64, height: 64, borderRadius: 22, backgroundColor: Colors.background },
    onlineDot: { position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, backgroundColor: Colors.success, borderRadius: 7, borderWidth: 2, borderColor: Colors.white },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, gap: 3 },
    ratingText: { fontSize: 11, fontWeight: '900', color: Colors.gold },
    name: { fontSize: 18, fontWeight: '800', color: Colors.secondary },
    specialty: { fontSize: 11, color: Colors.textSecondary, marginTop: 4, height: 35, lineHeight: 16 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 15, gap: 10 },
    chatAction: { flex: 1, backgroundColor: Colors.secondary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 16, gap: 6 },
    actionText: { color: Colors.white, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
    callAction: { width: 44, height: 44, backgroundColor: Colors.primaryLight, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: Colors.white }
});

export default AdvisorsScreen;
