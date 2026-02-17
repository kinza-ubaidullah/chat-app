import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import { aboutData } from '../data/aboutData';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const AboutScreen = ({ navigation }) => {
    return (
        <ScreenWrapper>
            <Header onLogout={() => navigation.navigate('Login')} />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Back Button */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
                    <Text style={styles.backText}>BACK</Text>
                </TouchableOpacity>

                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Text style={styles.title}>{aboutData.title}</Text>
                    <Text style={styles.subtitle}>{aboutData.subtitle}</Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {aboutData.stats.map((stat, idx) => (
                        <View key={idx} style={styles.statCard}>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Mission Section */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '20' }]}>
                            <Ionicons name="locate" size={24} color={Colors.primary} />
                        </View>
                        <Text style={styles.cardHeading}>{aboutData.mission.heading}</Text>
                    </View>
                    <Text style={styles.cardContent}>{aboutData.mission.content}</Text>
                </View>

                {/* Vision Section */}
                <LinearGradient
                    colors={['#FFF5F6', '#F0F4FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientCard}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.iconContainerWhite}>
                            <Ionicons name="eye" size={24} color={Colors.primary} />
                        </View>
                        <Text style={styles.cardHeading}>{aboutData.vision.heading}</Text>
                    </View>
                    <Text style={styles.cardContent}>{aboutData.vision.content}</Text>
                </LinearGradient>

                {/* Values Section */}
                <Text style={styles.sectionTitle}>Our Core Values</Text>
                <View style={styles.valuesContainer}>
                    {aboutData.values.map((value, idx) => (
                        <View key={idx} style={styles.valueCard}>
                            <View style={[styles.smallIconContainer, { backgroundColor: Colors.primary + '15' }]}>
                                <Ionicons name="sparkles" size={18} color={Colors.primary} />
                            </View>
                            <Text style={styles.valueTitle}>{value.title}</Text>
                            <Text style={styles.valueDescription}>{value.description}</Text>
                        </View>
                    ))}
                </View>

                {/* CTA Section */}
                <TouchableOpacity
                    style={styles.ctaCard}
                    onPress={() => navigation.navigate('Home')}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={[Colors.primary, '#D6364D']}
                        style={styles.ctaGradient}
                    >
                        <Ionicons name="heart" size={40} color="#FFF" style={styles.ctaIcon} />
                        <Text style={styles.ctaHeading}>{aboutData.cta.heading}</Text>
                        <Text style={styles.ctaDescription}>{aboutData.cta.description}</Text>
                        <View style={styles.ctaButton}>
                            <Text style={styles.ctaButtonText}>{aboutData.cta.buttonText}</Text>
                            <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={{ height: 50 }} />
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFCFB',
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
    heroSection: {
        marginBottom: 30,
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 12,
        lineHeight: 42,
    },
    subtitle: {
        fontSize: 18,
        color: Colors.textSecondary,
        lineHeight: 26,
        fontWeight: '500',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    statCard: {
        width: '48%',
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 20,
        marginBottom: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '900',
        color: Colors.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 30,
        padding: 25,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    gradientCard: {
        borderRadius: 30,
        padding: 25,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: '#FFE4E6',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    iconContainerWhite: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    cardHeading: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.text,
    },
    cardContent: {
        fontSize: 16,
        lineHeight: 24,
        color: Colors.textSecondary,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: 25,
    },
    valuesContainer: {
        marginBottom: 40,
    },
    valueCard: {
        backgroundColor: Colors.white,
        borderRadius: 25,
        padding: 25,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    smallIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    valueTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
    },
    valueDescription: {
        fontSize: 14,
        lineHeight: 22,
        color: Colors.textSecondary,
    },
    ctaCard: {
        borderRadius: 30,
        overflow: 'hidden',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    ctaGradient: {
        padding: 35,
        alignItems: 'center',
    },
    ctaIcon: {
        marginBottom: 20,
    },
    ctaHeading: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.white,
        textAlign: 'center',
        marginBottom: 12,
    },
    ctaDescription: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        marginBottom: 25,
    },
    ctaButton: {
        backgroundColor: Colors.white,
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    ctaButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.primary,
    },
});

export default AboutScreen;
