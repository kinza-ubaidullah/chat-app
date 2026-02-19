let GoogleSignin;
try {
    const GoogleAuthModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = GoogleAuthModule.GoogleSignin;
} catch (e) {
    console.log('Google Sign-In module not found, skipping configuration.');
}

export const configureGoogleSignIn = () => {
    if (!GoogleSignin) return;
    try {
        GoogleSignin.configure({
            webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'YOUR_WEB_CLIENT_ID',
            offlineAccess: true,
        });
    } catch (e) {
        console.log('Google Sign-In configuration failed:', e);
    }
};

export const signInWithGoogle = async () => {
    if (!GoogleSignin) {
        Alert.alert("Feature unavailable", "Google Sign-In is not available in this version.");
        return null;
    }
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
        console.error('Google Sign-in detail:', error);
        throw new Error(error.message || 'An unknown error occurred during Google Sign-in.');
    }
};
