import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const TopicSelectionModal = ({ visible, onClose, onSelectTopic }) => {
    const topics = [
        { id: 'opener', label: 'Opener', icon: 'chatbubbles-outline' },
        { id: 'reply', label: 'Reply', icon: 'arrow-undo-outline' },
        { id: 'ask_out', label: 'Ask Out', icon: 'calendar-outline' },
        { id: 'profile_review', label: 'Profile', icon: 'person-outline' },
        { id: 'general', label: 'General', icon: 'bulb-outline' },
        { id: 'flirty', label: 'Flirty', icon: 'heart-outline' }
    ];

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Choose a Topic</Text>
                            <Text style={styles.subtitle}>What do you need help with?</Text>
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={24} color="#999" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.grid}>
                        {topics.map((topic) => (
                            <TouchableOpacity
                                key={topic.id}
                                style={styles.topicCard}
                                onPress={() => onSelectTopic(topic.id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.iconContainer}>
                                    <Ionicons name={topic.icon} size={28} color={Colors.primary} />
                                </View>
                                <Text style={styles.topicLabel}>{topic.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 30,
        padding: 25,
        width: '100%',
        maxWidth: 360,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 25,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#12172D',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#999',
    },
    closeButton: {
        padding: 5,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    topicCard: {
        width: '31%', // Fits 3 in a row with gap
        aspectRatio: 0.85,
        backgroundColor: '#FFF5F6',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFE0E6',
        marginBottom: 12,
    },
    iconContainer: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#E94057',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    topicLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#12172D',
        textAlign: 'center',
    },
});

export default TopicSelectionModal;
