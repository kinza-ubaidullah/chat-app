import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const BlogPostScreen = ({ route, navigation }) => {
    const { slug, title: initialTitle } = route.params;
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPost();
    }, []);

    const fetchPost = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('blogs')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) console.error('Error fetching blog post:', error);
            else setPost(data);
        } catch (error) {
            console.error('Error fetching blog post:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <Header onLogout={() => navigation.navigate('Login')} />
                <View style={[styles.container, styles.centered]}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </ScreenWrapper>
        );
    }

    if (!post) {
        return (
            <ScreenWrapper>
                <Header onLogout={() => navigation.navigate('Login')} />
                <View style={[styles.container, styles.centered]}>
                    <Text style={styles.errorText}>Article not found.</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <Header onLogout={() => navigation.navigate('Login')} />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
                    <Text style={styles.backText}>BACK TO BLOGS</Text>
                </TouchableOpacity>

                <Image
                    source={{ uri: post.image_url }}
                    style={styles.heroImage}
                    resizeMode="cover"
                />

                <View style={styles.contentContainer}>
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
                            <Text style={styles.metaText}>{formatDate(post.published_at)}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="person-outline" size={14} color={Colors.primary} />
                            <Text style={styles.metaText}>By {post.author}</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>{post.title}</Text>

                    <View style={styles.divider} />

                    <Text style={styles.content}>{post.content}</Text>

                    {/* Placeholder for more content if needed */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Thanks for reading!</Text>
                        <TouchableOpacity
                            style={styles.shareCard}
                            onPress={() => navigation.navigate('Contact')}
                        >
                            <Text style={styles.shareTitle}>Have a question?</Text>
                            <Text style={styles.shareSubtitle}>Ask our experts for advice.</Text>
                            <Ionicons name="chatbubbles-outline" size={24} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>
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
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingTop: 20,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    backText: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.5,
        color: Colors.textSecondary,
        marginLeft: 8,
    },
    heroImage: {
        width: width,
        height: 250,
        marginBottom: -30,
    },
    contentContainer: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        paddingHorizontal: 25,
        paddingTop: 40,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginBottom: 20,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.textSecondary,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: Colors.text,
        lineHeight: 36,
        marginBottom: 20,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        width: '40%',
        marginBottom: 25,
    },
    content: {
        fontSize: 16,
        lineHeight: 28,
        color: Colors.text,
        textAlign: 'justify',
    },
    errorText: {
        fontSize: 18,
        color: Colors.textSecondary,
        marginBottom: 20,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 20,
    },
    shareCard: {
        width: '100%',
        backgroundColor: '#F8F9FB',
        borderRadius: 25,
        padding: 25,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    shareTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 4,
    },
    shareSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 15,
    },
});

export default BlogPostScreen;
