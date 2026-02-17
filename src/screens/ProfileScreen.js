import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, Alert, Image, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                // Fetch profile data from the 'profiles' table
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                if (profileData) {
                    setUser({ ...authUser, profile: profileData });
                } else {
                    setUser(authUser);
                }
            }
        };
        fetchUserData();
    }, []);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert('Error', error.message);
        }
        // App.js will automatically handle navigation thanks to onAuthStateChange
    };

    const handleImagePick = async () => {
        try {
            // Request permissions
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                Alert.alert('Permission Required', 'Please allow access to your photo library to upload a profile picture.');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                await uploadImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const uploadImage = async (uri) => {
        setUploading(true);
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) {
                Alert.alert('Error', 'Please log in to upload a profile picture.');
                return;
            }

            // Create a unique file name
            const fileExt = uri.split('.').pop();
            const fileName = `${authUser.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Convert URI to blob for upload
            const response = await fetch(uri);
            const blob = await response.blob();

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, blob, {
                    contentType: `image/${fileExt}`,
                    upsert: true
                });

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            if (!urlData?.publicUrl) {
                throw new Error('Failed to get public URL');
            }

            // Update profile with new avatar URL
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: urlData.publicUrl })
                .eq('id', authUser.id);

            if (updateError) {
                throw updateError;
            }

            // Update local state
            setUser(prev => ({
                ...prev,
                profile: {
                    ...prev.profile,
                    avatar_url: urlData.publicUrl
                }
            }));

            Alert.alert('Success', 'Profile picture updated successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Upload Failed', error.message || 'Failed to upload profile picture. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <ScreenWrapper>
            <Header onLogout={handleLogout} />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarMain}>
                        <View style={styles.avatarCircle}>
                            {user?.profile?.avatar_url ? (
                                <Image
                                    source={{ uri: user.profile.avatar_url }}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <Ionicons name="person" size={70} color={Colors.primary} />
                            )}
                        </View>
                        <TouchableOpacity
                            style={styles.editBadge}
                            onPress={handleImagePick}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Ionicons name="camera" size={20} color="white" />
                            )}
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>
                        {user?.profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                    </Text>
                    <Text style={styles.userEmail}>{user?.email || 'Loading...'}</Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>8</Text>
                        <Text style={styles.statLab}>Matches</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>12</Text>
                        <Text style={styles.statLab}>Advisors</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>4.8</Text>
                        <Text style={styles.statLab}>Rating</Text>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    {user?.profile?.persona_analysis && Object.keys(user.profile.persona_analysis).length > 0 && (
                        <TouchableOpacity
                            style={[styles.infoCard, { backgroundColor: '#12172D', borderColor: '#12172D' }]}
                            onPress={() => navigation.navigate('Main', { screen: 'Home', params: { showAnalysis: true } })}
                        >
                            <View style={[styles.infoIconBg, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                                <Ionicons name="sparkles" size={20} color="#FFF" />
                            </View>
                            <View style={styles.infoText}>
                                <Text style={[styles.infoLabel, { color: 'rgba(255,255,255,0.6)' }]}>Your Persona</Text>
                                <Text style={[styles.infoValue, { color: '#FFF' }]}>View AI Analysis</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#FFF" />
                        </TouchableOpacity>
                    )}

                    <View style={styles.infoCard}>
                        <View style={styles.infoIconBg}>
                            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                        </View>
                        <View style={styles.infoText}>
                            <Text style={styles.infoLabel}>Member since</Text>
                            <Text style={styles.infoValue}>
                                {user ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '...'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoCard}>
                        <View style={styles.infoIconBg}>
                            <Ionicons name="star-outline" size={20} color={Colors.primary} />
                        </View>
                        <View style={styles.infoText}>
                            <Text style={styles.infoLabel}>Subscription</Text>
                            <Text style={styles.infoValue}>Free Plan</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.upgradeBtn}
                            onPress={() => navigation.navigate('Subscription')}
                        >
                            <Text style={styles.upgradeText}>Upgrade</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </ScreenWrapper>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: 20,
    },
    profileHeader: {
        alignItems: 'center',
        marginVertical: 40,
    },
    avatarMain: {
        position: 'relative',
        marginBottom: 20,
    },
    avatarCircle: {
        width: 130,
        height: 130,
        borderRadius: 45,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: Colors.white,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        width: 40,
        height: 40,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: Colors.white,
    },
    userName: {
        fontSize: 26,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 6,
    },
    userEmail: {
        fontSize: 15,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 25,
        padding: 20,
        marginBottom: 35,
        borderWidth: 1.5,
        borderColor: Colors.border,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
    },
    statVal: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.text,
    },
    statLab: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
        fontWeight: '600',
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: Colors.border,
    },
    infoSection: {
        gap: 15,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 25,
        padding: 20,
        borderWidth: 1.5,
        borderColor: Colors.border,
    },
    infoIconBg: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    infoText: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: 4,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.text,
    },
    upgradeBtn: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 12,
    },
    upgradeText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: '700',
    },
});

export default ProfileScreen;
