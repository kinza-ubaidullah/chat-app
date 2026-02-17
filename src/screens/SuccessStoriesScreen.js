import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
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
        text: "The AI advisors gave me the confidence to be myself. I've been with my partner for 6 months now thanks to the conversation starters!",
        image: "https://images.unsplash.com/photo-1516589174184-c6852661448c?w=400&h=400&fit=crop",
        tags: ["Confidence", "Dating Advice"]
    },
    {
        name: "Mark T.",
        role: "Found a Partner",
        text: "I used to struggle with first dates. The practice voice calls helped me stay calm and actually enjoy the process.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        tags: ["Communication", "Anxiety"]
    },
    {
        name: "Jessica W.",
        role: "Profile Boosted",
        text: "The profile audit was a game changer. I went from zero matches to meaningful conversations in just one week.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
        tags: ["Profile Optimization", "Results"]
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
                    <Text style={styles.subtitle}>See how our AI-powered advisors are helping people find meaningful connections.</Text>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>10k+</Text>
                        <Text style={styles.statLabel}>Successes</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>98%</Text>
                        <Text style={styles.statLabel}>Happy</Text>
                    </View>
                </View>

                {/* Stories Grid */}
                <View style={styles.storiesContainer}>
                    {successStories.map((story, idx) => (
                        <View key={idx} style={styles.storyCard}>
                            <View style={styles.storyHeader}>
                                <Image source={{ uri: story.image }} style={styles.storyImage} />
                                <View>
                                    <Text style={styles.storyName}>{story.name}</Text>
                                    <Text style={styles.storyRole}>{story.role}</Text>
                                </View>
                            </View>
                            <Text style={styles.storyText}>"{story.text}"</Text>
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

                {/* Dark Banner */}
                <View style={styles.darkBanner}>
                    <Text style={styles.darkBannerTitle}>Your story is waiting to be told.</Text>
                    <TouchableOpacity
                        style={styles.whiteButton}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Text style={styles.whiteButtonText}>Start Now</Text>
                        <Ionicons name="arrow-forward" size={18} color="#12172D" />
                    </TouchableOpacity>
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
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 40,
    },
    statBox: {
        backgroundColor: Colors.white,
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    statNumber: {
        fontSize: 22,
        fontWeight: '900',
        color: Colors.primary,
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
        borderRadius: 30,
        padding: 25,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    storyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 15,
    },
    storyImage: {
        width: 50,
        height: 50,
        borderRadius: 12,
    },
    storyName: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.text,
    },
    storyRole: {
        fontSize: 11,
        fontWeight: '800',
        color: Colors.primary,
        textTransform: 'uppercase',
    },
    storyText: {
        fontSize: 15,
        lineHeight: 24,
        color: Colors.textSecondary,
        fontStyle: 'italic',
        marginBottom: 20,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: Colors.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.primary,
    },
    darkBanner: {
        backgroundColor: '#12172D',
        borderRadius: 35,
        padding: 40,
        alignItems: 'center',
    },
    darkBannerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.white,
        textAlign: 'center',
        marginBottom: 25,
    },
    whiteButton: {
        backgroundColor: Colors.white,
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    whiteButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#12172D',
    },
});

export default SuccessStoriesScreen;
