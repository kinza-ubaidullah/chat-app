import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

const BlogsScreen = ({ navigation }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('blogs')
                .select('id, slug, title, excerpt, image_url, published_at, author')
                .eq('is_published', true)
                .order('published_at', { ascending: false });

            if (error) console.error('Error fetching blogs:', error);
            else setPosts(data || []);
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <ScreenWrapper>
            <Header onLogout={() => navigation.navigate('Login')} />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
                    <Text style={styles.backText}>BACK</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.title}>Relationship Insights</Text>
                    <Text style={styles.subtitle}>Expert advice and the latest trends in AI-powered dating.</Text>
                </View>

                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : posts.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No articles found.</Text>
                    </View>
                ) : (
                    posts.map((post) => (
                        <TouchableOpacity
                            key={post.id}
                            style={styles.blogCard}
                            activeOpacity={0.9}
                            onPress={() => navigation.navigate('BlogPost', { slug: post.slug, title: post.title })}
                        >
                            <Image
                                source={{ uri: post.image_url }}
                                style={styles.blogImage}
                                resizeMode="cover"
                            />
                            <View style={styles.blogInfo}>
                                <View style={styles.metaRow}>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
                                        <Text style={styles.metaText}>{formatDate(post.published_at)}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="person-outline" size={12} color={Colors.textSecondary} />
                                        <Text style={styles.metaText}>{post.author}</Text>
                                    </View>
                                </View>
                                <Text style={styles.blogTitle}>{post.title}</Text>
                                <Text style={styles.blogExcerpt} numberOfLines={3}>{post.excerpt}</Text>
                                <View style={styles.readMore}>
                                    <Text style={styles.readMoreText}>Read Article</Text>
                                    <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}

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
        marginBottom: 30,
        alignItems: 'center',
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
    centered: {
        marginTop: 50,
        alignItems: 'center',
    },
    blogCard: {
        backgroundColor: Colors.white,
        borderRadius: 30,
        overflow: 'hidden',
        marginBottom: 25,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    blogImage: {
        width: '100%',
        height: 200,
    },
    blogInfo: {
        padding: 20,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginBottom: 12,
        opacity: 0.6,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    metaText: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    blogTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 10,
        lineHeight: 28,
    },
    blogExcerpt: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 22,
        marginBottom: 15,
    },
    readMore: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    readMoreText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.primary,
    },
    emptyContainer: {
        marginTop: 50,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: 16,
    },
});

export default BlogsScreen;
