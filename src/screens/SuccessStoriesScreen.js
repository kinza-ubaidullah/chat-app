import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const successStories = [
    {
        name: "Sarah J. & Michael",
        role: "Married",
        text: "The AI advisors gave me the confidence to be myself. I've been with my partner for 6 months now thanks to the conversation starters! We actually met on a rainy Tuesday and everything clicked because of the advice I got here.",
        image: "https://images.unsplash.com/photo-1516589174184-c6852661448c?w=400&h=400&fit=crop",
        tags: ["Confidence", "Dating Advice"]
    },
    {
        name: "Mark T.",
        role: "Found a Partner",
        text: "I used to struggle with first dates. The practice voice calls helped me stay calm and actually enjoy the process. My communication skills have improved so much, and now I'm in a committed relationship.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        tags: ["Communication", "Anxiety"]
    },
    {
        name: "Jessica W.",
        role: "Profile Boosted",
        text: "The profile audit was a game changer. I went from zero matches to meaningful conversations in just one week. The AI literally rewrote my bio to reflect my true self while making it appealing to others.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
        tags: ["Profile Optimization", "Results"]
    },
    {
        name: "David L. & Emily",
        role: "Dating for 1 Year",
        text: "I was skeptical about AI dating advice, but David's transformation after using this app was incredible. He became more attentive, a better listener, and more confident in expressing his feelings.",
        image: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=400&h=400&fit=crop",
        tags: ["Listening", "Soft Skills"]
    },
    {
        name: "Rachel M.",
        role: "Rediscovered Love",
        text: "After my divorce, I didn't know how to start again. This platform gave me a safe space to practice and re-learn the dating scene. It felt like having a supportive best friend in my pocket.",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
        tags: ["New Beginnings", "Supportive"]
    },
    {
        name: "Chris P.",
        role: "Mastered First Impressions",
        text: "The first message is the hardest. The AI suggested icebreakers that actually felt like me, but better. I've had more successful first dates in the last month than in the previous three years.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
        tags: ["Icebreakers", "First Dates"]
    }
];

const SuccessStoriesScreen = ({ navigation }) => {
    return (
        <ScreenWrapper>
            <Header onLogout={() => navigation.navigate('Login')} />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
                    <Text style={styles.backText}>BACK</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <View style={styles.heartCircle}>
                        <Ionicons name="heart" size={30} color={Colors.primary} />
                    </View>
                    <Text style={styles.title}>Real Love Stories</Text>
                    <Text style={styles.subtitle}>See how our AI-powered advisors are helping people find meaningful connections and build lasting relationships.</Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {[
                        { value: "5,000+", label: "Happy Couples", icon: "heart" },
                        { value: "98%", label: "Satisfaction", icon: "shield-checkmark" },
                        { value: "24/7", label: "AI Support", icon: "chatbubble-ellipses" },
                        { value: "15min", label: "First Result", icon: "sparkles" },
                    ].map((stat, idx) => (
                        <View key={idx} style={styles.statCard}>
                            <Ionicons name={stat.icon} size={24} color={Colors.primary} style={{ opacity: 0.4, marginBottom: 10 }} />
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Stories Grid */}
                <View style={styles.storiesContainer}>
                    {successStories.map((story, idx) => (
                        <View key={idx} style={styles.storyCard}>
                            <View style={styles.storyHeader}>
                                <View style={styles.imageWrapper}>
                                    <Image source={{ uri: story.image }} style={styles.storyImage} />
                                    <View style={styles.ratingBox}>
                                        <Text style={styles.ratingStars}>★★★★★</Text>
                                    </View>
                                </View>
                                <View>
                                    <Text style={styles.storyName}>{story.name}</Text>
                                    <Text style={styles.storyRole}>{story.role}</Text>
                                </View>
                            </View>

                            <View style={styles.quoteWrapper}>
                                <Ionicons name="quote" size={30} color={Colors.primary} style={styles.quoteIcon} />
                                <Text style={styles.storyText}>{story.text}</Text>
                            </View>

                            <View style={styles.tagContainer}>
                                {story.tags.map((tag, tIdx) => (
                                    <View key={tIdx} style={styles.tag}>
                                        <Text style={styles.tagText}>{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                </View>

                {/* Extra Feature Section (Dark Banner) */}
                <View style={styles.darkBanner}>
                    <View style={styles.darkBannerContent}>
                        <Text style={styles.darkBannerTitle}>Your story is {"\n"}<Text style={{ color: '#FB7185' }}>waiting to be told.</Text></Text>

                        <View style={styles.featureList}>
                            {[
                                "AI-optimized dating profile",
                                "Real-time conversation coaching",
                                "Expert-level first date planning",
                                "Post-date analysis & feedback"
                            ].map((item, i) => (
                                <View key={i} style={styles.featureItem}>
                                    <View style={styles.featureDot} />
                                    <Text style={styles.featureText}>{item}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.bannerImageContainer}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1543807535-eceef0bc65c9?w=800&q=80' }}
                                style={styles.bannerImage}
                            />
                            <View style={styles.floatingTestimonial}>
                                <Ionicons name="star" size={16} color="#FBBF24" />
                                <Text style={styles.floatingText}>"The best decision for my love life."</Text>
                                <Text style={styles.floatingAuthor}>— Tommy K.</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* CTA Section */}
                <View style={styles.ctaSection}>
                    <LinearGradient
                        colors={[Colors.primary, '#D6364D']}
                        style={styles.ctaGradient}
                    >
                        <Text style={styles.ctaTitle}>Ready to find {"\n"}your person?</Text>
                        <Text style={styles.ctaSubtitle}>Join thousands of others who have transformed their dating life with our AI-powered guidance.</Text>

                        <TouchableOpacity
                            style={styles.ctaButton}
                            onPress={() => navigation.navigate('Main', { screen: 'Home' })}
                        >
                            <Text style={styles.ctaButtonText}>Start Your Journey</Text>
                            <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
                        </TouchableOpacity>

                        <Text style={styles.noCardText}>NO CREDIT CARD REQUIRED TO START</Text>
                    </LinearGradient>
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
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    heartCircle: {
        width: 64,
        height: 64,
        borderRadius: 24,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5,
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: 12,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    subtitle: {
        fontSize: 18,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 10,
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
        borderRadius: 25,
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
        fontSize: 10,
        fontWeight: '800',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    storiesContainer: {
        marginBottom: 40,
    },
    storyCard: {
        backgroundColor: Colors.white,
        borderRadius: 40,
        padding: 30,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 10,
    },
    storyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
        gap: 15,
    },
    imageWrapper: {
        position: 'relative',
    },
    storyImage: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    ratingBox: {
        position: 'absolute',
        bottom: -10,
        right: -10,
        backgroundColor: 'white',
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    ratingStars: {
        fontSize: 8,
        color: '#FBBF24',
        fontWeight: 'bold',
    },
    storyName: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.text,
    },
    storyRole: {
        fontSize: 12,
        fontWeight: '800',
        color: Colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    quoteWrapper: {
        position: 'relative',
        marginBottom: 25,
    },
    quoteIcon: {
        position: 'absolute',
        top: -10,
        left: -10,
        opacity: 0.05,
    },
    storyText: {
        fontSize: 16,
        lineHeight: 26,
        color: Colors.textSecondary,
        fontStyle: 'italic',
        fontWeight: '500',
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: Colors.primary + '10',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 30,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    darkBanner: {
        backgroundColor: '#12172D',
        borderRadius: 50,
        padding: 40,
        marginBottom: 40,
        overflow: 'hidden',
    },
    darkBannerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.white,
        marginBottom: 30,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    featureList: {
        gap: 15,
        marginBottom: 40,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FB7185',
    },
    featureText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
    },
    bannerImageContainer: {
        position: 'relative',
        width: '100%',
        height: 300,
        borderRadius: 40,
        overflow: 'hidden',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        transform: [{ rotate: '2deg' }],
    },
    floatingTestimonial: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    floatingText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#12172D',
        marginVertical: 4,
    },
    floatingAuthor: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    ctaSection: {
        borderRadius: 50,
        overflow: 'hidden',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
        elevation: 15,
    },
    ctaGradient: {
        padding: 40,
        alignItems: 'center',
    },
    ctaTitle: {
        fontSize: 36,
        fontWeight: '800',
        color: Colors.white,
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    ctaSubtitle: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 35,
    },
    ctaButton: {
        backgroundColor: Colors.white,
        paddingHorizontal: 40,
        paddingVertical: 20,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    ctaButtonText: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.primary,
    },
    noCardText: {
        marginTop: 25,
        fontSize: 10,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 1.5,
    }
});

export default SuccessStoriesScreen;
