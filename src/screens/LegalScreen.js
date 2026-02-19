import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, Animated, Dimensions } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import { termsData, privacyData } from '../data/legalData';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const LegalScreen = ({ navigation, route }) => {
    const { type } = route.params || { type: 'terms' };
    const data = type === 'privacy' ? privacyData : termsData;

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    // Function to render content with styled headers
    const renderStyledContent = (content) => {
        const lines = content.split('\n');
        return lines.map((line, index) => {
            // Check if it's a main section header (e.g., "1. ELIGIBILITY")
            const isHeader = /^\d+\.\s+[A-Z\s,;]+$/.test(line.trim());
            // Check if it's a sub-header (e.g., "1.1 Age Requirement")
            const isSubHeader = /^\d+\.\d+\s+/.test(line.trim());
            // Check if it's a bullet point
            const isBullet = line.trim().startsWith('•');

            if (isHeader) {
                return (
                    <Text key={index} style={styles.sectionHeader}>
                        {line.trim()}
                    </Text>
                );
            } else if (isSubHeader) {
                return (
                    <Text key={index} style={styles.subSectionHeader}>
                        {line.trim()}
                    </Text>
                );
            } else if (line.trim() === '') {
                return <View key={index} style={{ height: 10 }} />;
            } else {
                return (
                    <Text key={index} style={[styles.bodyText, isBullet && styles.bulletText]}>
                        {line.trim()}
                    </Text>
                );
            }
        });
    };

    return (
        <ScreenWrapper>
            <View style={styles.headerContainer}>
                <LinearGradient
                    colors={[Colors.primary, '#D6364D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                        >
                            <Ionicons name="chevron-back" size={28} color="white" />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerTitle}>{data.title}</Text>
                            <View style={styles.lastUpdatedBadge}>
                                <Text style={styles.lastUpdatedText}>Updated: {data.lastUpdated}</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            <Animated.View style={[
                styles.contentWrapper,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}>
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.paper}>
                        <View style={styles.introContainer}>
                            <Ionicons
                                name={type === 'privacy' ? "shield-checkmark" : "document-text"}
                                size={40}
                                color={Colors.primary}
                                style={styles.introIcon}
                            />
                            <Text style={styles.introText}>
                                Please read our {data.title} carefully to understand how we operate and your rights as a user.
                            </Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.contentBody}>
                            {renderStyledContent(data.content)}
                        </View>

                        <View style={styles.footerContainer}>
                            <LinearGradient
                                colors={['rgba(233, 64, 87, 0.05)', 'rgba(233, 64, 87, 0.02)']}
                                style={styles.footerCard}
                            >
                                <Ionicons name="mail-outline" size={24} color={Colors.primary} />
                                <Text style={styles.footerTitle}>Questions?</Text>
                                <Text style={styles.footerText}>
                                    Our support team is here to help clarify any points in our {type === 'privacy' ? 'Privacy Policy' : 'Terms'}.
                                </Text>
                                <TouchableOpacity style={styles.contactButton}>
                                    <Text style={styles.contactButtonText}>support@datingadvice.io</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    </View>
                </ScrollView>
            </Animated.View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        height: Platform.OS === 'ios' ? 140 : 120,
        width: '100%',
    },
    headerGradient: {
        flex: 1,
        justifyContent: 'flex-end',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: 'white',
        letterSpacing: -0.5,
    },
    lastUpdatedBadge: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    lastUpdatedText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    contentWrapper: {
        flex: 1,
        marginTop: -20,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 15,
        paddingBottom: 40,
    },
    paper: {
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
    },
    introContainer: {
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 10,
    },
    introIcon: {
        marginBottom: 15,
    },
    introText: {
        fontSize: 15,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '500',
        paddingHorizontal: 10,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        width: '100%',
        marginVertical: 20,
    },
    contentBody: {
        paddingBottom: 20,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.text,
        marginTop: 25,
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    subSectionHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.primary,
        marginTop: 15,
        marginBottom: 8,
    },
    bodyText: {
        fontSize: 14,
        lineHeight: 22,
        color: Colors.textSecondary,
        marginBottom: 8,
        textAlign: 'left',
    },
    bulletText: {
        paddingLeft: 10,
    },
    footerContainer: {
        marginTop: 20,
    },
    footerCard: {
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(233, 64, 87, 0.1)',
    },
    footerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.text,
        marginTop: 10,
        marginBottom: 8,
    },
    footerText: {
        fontSize: 13,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    contactButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    contactButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default LegalScreen;
