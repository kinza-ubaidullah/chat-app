export const configureGoogleSignIn = () => {
    // No-op for web or specific web config
    console.log('Google Sign-In configuration skipped for web.');
};

export const signInWithGoogle = async () => {
    console.log('Google Sign-In not implemented for web in this demo.');
    alert('Google Sign-In is only available on mobile devices in this preview.');
    return null;
};
