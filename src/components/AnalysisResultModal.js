import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';

const AnalysisResultModal = ({ visible, onClose, analysis, onAdvisorSelect, allAdvisors }) => {
    if (!analysis) return null;

    return (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

                <View style={styles.modalContent}>
                    {/* Handle Bar */}
                    <View style={styles.handleBar} />

                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {/* Header */}
                        <LinearGradient
                            colors={[Colors.primary, '#FF8FA3']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.header}
                        >
                            <View style={styles.headerRow}>
                                <View style={styles.iconBox}>
                                    <Ionicons name="sparkles" size={24} color="#FFF" />
                                </View>
                                <Text style={styles.headerTitle}>AI Persona Insight</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </LinearGradient>

                        {/* Summary */}
                        <View style={styles.section}>
                            <Text style={styles.summaryText}>
                                {analysis.summary || "Your analysis is complete, but no summary is available."}
                            </Text>
                        </View>

                        {/* Improved Experts Section - Showing all 11 advisors as requested */}
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>OUR DATING EXPERTS</Text>
                            <View style={styles.tagsContainer}>
                                {(allAdvisors && allAdvisors.length > 0 ? allAdvisors : []).map((advisor, index) => {
                                    // Check if this advisor is recommended in the analysis
                                    const isRecommended = analysis.recommended_advisors?.some(recName =>
                                        recName.toLowerCase().includes(advisor.name.toLowerCase()) ||
                                        advisor.name.toLowerCase().includes(recName.split(' - ')[0].toLowerCase())
                                    );

                                    return (
                                        <TouchableOpacity
                                            key={advisor.id || index}
                                            style={[
                                                styles.tag,
                                                isRecommended ? styles.recommendedTag : styles.regularTag
                                            ]}
                                            onPress={() => {
                                                onClose();
                                                if (onAdvisorSelect) onAdvisorSelect(advisor.name);
                                            }}
                                        >
                                            <View style={styles.tagInner}>
                                                <Text style={styles.tagText}>{advisor.name}</Text>
                                                {isRecommended && (
                                                    <Ionicons name="sparkles" size={10} color="#FFF" style={{ marginLeft: 4 }} />
                                                )}
                                                <Ionicons name="chatbubble-ellipses" size={12} color="#FFF" style={{ marginLeft: 6 }} />
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '70%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
    },
    handleBar: {
        width: 40,
        height: 5,
        backgroundColor: '#E0E0E0',
        borderRadius: 2.5,
        alignSelf: 'center',
        marginVertical: 10,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 20,
        marginBottom: 25,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFF',
    },
    closeBtn: {
        padding: 5,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
    },
    section: {
        paddingHorizontal: 25,
        marginBottom: 25,
    },
    summaryText: {
        fontSize: 16,
        lineHeight: 26,
        color: '#4A4A68',
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#999',
        letterSpacing: 1,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    tag: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    tagText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 13,
    },
    tagInner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recommendedTag: {
        backgroundColor: Colors.primary, // Reddish pink
        shadowColor: Colors.primary,
        borderWidth: 0,
    },
    regularTag: {
        backgroundColor: '#12172D', // Dark navy
        shadowColor: '#12172D',
        borderWidth: 0,
    },
});

export default AnalysisResultModal;
