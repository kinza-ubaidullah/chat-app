import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';

const ChatListScreen = ({ navigation }) => {
    const chats = [
        { id: '1', name: 'Sophia', preview: 'Hi! How can I help you today?', time: '2h ago', unread: true },
        { id: '2', name: 'James', preview: 'The session was great! Let me know...', time: '5h ago', unread: false },
    ];

    return (
        <ScreenWrapper>
            <Header onLogout={() => navigation.navigate('Login')} />
            <View style={styles.container}>
                <View style={styles.listHeader}>
                    <Text style={styles.title}>Recent Chats</Text>
                    <TouchableOpacity style={styles.searchBtn}>
                        <Ionicons name="search-outline" size={22} color={Colors.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {chats.map(chat => (
                        <TouchableOpacity
                            key={chat.id}
                            style={styles.chatCard}
                            onPress={() => navigation.navigate('ChatDetail', { name: chat.name })}
                            activeOpacity={0.8}
                        >
                            <View style={styles.avatarContainer}>
                                <View style={styles.avatarPlaceholder}>
                                    <Ionicons name="person" size={28} color="#ADAFBB" />
                                </View>
                                <View style={styles.onlineBadge} />
                            </View>

                            <View style={styles.textContainer}>
                                <View style={styles.nameRow}>
                                    <Text style={styles.name}>{chat.name}</Text>
                                    <Text style={[styles.time, chat.unread && { color: Colors.primary }]}>{chat.time}</Text>
                                </View>
                                <View style={styles.previewRow}>
                                    <Text style={[styles.preview, chat.unread && styles.unreadText]} numberOfLines={1}>
                                        {chat.preview}
                                    </Text>
                                    {chat.unread && <View style={styles.unreadBadge} />}
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
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
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    previewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    preview: {
        fontSize: 14,
        color: Colors.textSecondary,
        flex: 1,
        marginRight: 10,
    },
    unreadText: {
        color: Colors.text,
        fontWeight: '600',
    },
    unreadBadge: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
    },
});

export default ChatListScreen;
