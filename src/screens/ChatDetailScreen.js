import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';

const ChatDetailScreen = ({ route, navigation }) => {
    const { name } = route.params || { name: 'Sophia' };
    const [message, setMessage] = useState('');

    return (
        <ScreenWrapper>
            <SafeAreaView style={{ flex: 1 }}>
                {/* Custom Chat Header */}
                <View style={styles.chatHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#121E39" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <View style={styles.headerAvatar}>
                            <Ionicons name="person" size={20} color="#ADAFBB" />
                            <View style={styles.onlineStatus} />
                        </View>
                        <View>
                            <Text style={styles.headerName}>{name}</Text>
                            <Text style={styles.headerTitle}>Communication Expert</Text>
                        </View>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Ionicons name="call-outline" size={20} color="#121E39" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Ionicons name="ellipsis-vertical" size={20} color="#121E39" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Messages Area */}
                <ScrollView contentContainerStyle={styles.messagesContainer}>
                    <View style={styles.messageBubble}>
                        <Text style={styles.messageText}>
                            Hi there! I'm {name}, your communication expert. I'm here to help you navigate your relationships with confidence. What's on your mind today?
                        </Text>
                        <Text style={styles.messageTime}>10:49 PM</Text>
                    </View>
                </ScrollView>

                {/* Input Bar */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.inputContainer}
                >
                    <TouchableOpacity style={styles.micBtn}>
                        <Ionicons name="mic-outline" size={24} color="#121E39" />
                    </TouchableOpacity>
                    <View style={styles.textInputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type your message..."
                            value={message}
                            onChangeText={setMessage}
                        />
                        <TouchableOpacity style={styles.sendBtn}>
                            <Ionicons name="send-outline" size={20} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: Colors.white,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        position: 'relative',
    },
    onlineStatus: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4CAF50',
        borderWidth: 1,
        borderColor: Colors.white,
    },
    headerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#121E39',
    },
    headerTitle: {
        fontSize: 12,
        color: '#7C8BA0',
    },
    headerActions: {
        flexDirection: 'row',
    },
    actionBtn: {
        marginLeft: 15,
    },
    messagesContainer: {
        padding: 20,
    },
    messageBubble: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        borderTopLeftRadius: 5,
        padding: 15,
        maxWidth: '85%',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    messageText: {
        fontSize: 15,
        color: '#121E39',
        lineHeight: 22,
    },
    messageTime: {
        fontSize: 11,
        color: '#ADAFBB',
        marginTop: 5,
        alignSelf: 'flex-start',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#FDFCFB',
    },
    micBtn: {
        marginRight: 10,
    },
    textInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        paddingHorizontal: 15,
        height: 50,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#121E39',
    },
    sendBtn: {
        marginLeft: 10,
    },
});

export default ChatDetailScreen;
