// Web version of googleAuth.js
import { supabase } from './supabase';

export const configureGoogleSignIn = () => {
    // No-op on web
    console.log('Google Sign-In is not supported on Web. Skipping configuration.');
};

export const signInWithGoogle = async () => {
    // You could implement Supabase's web google auth here if needed:
    // const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    throw new Error('Google Sign-In via native library is not available on Web.');
};
