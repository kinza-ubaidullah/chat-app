import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from './supabase';

export const configureGoogleSignIn = () => {
    GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'YOUR_WEB_CLIENT_ID',
        offlineAccess: true,
    });
};

export const signInWithGoogle = async () => {
    try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();

        if (userInfo.idToken) {
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: userInfo.idToken,
            });

            if (error) throw error;
            return data;
        } else {
            throw new Error('No ID token present!');
        }
    } catch (error) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            console.log('User cancelled Google Sign-in');
            return null;
        } else if (error.code === statusCodes.IN_PROGRESS) {
            throw new Error('Sign-in is already in progress.');
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            throw new Error('Google Play Services are not available or outdated.');
        } else {
            console.error('Google Sign-in detail:', error);
            throw new Error(error.message || 'An unknown error occurred during Google Sign-in.');
        }
    }
};
