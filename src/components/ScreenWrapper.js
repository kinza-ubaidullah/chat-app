import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenWrapper = ({ children, style, useBottomInset = false }) => {
    let insets;
    try {
        insets = useSafeAreaInsets();
    } catch (err) {
        insets = { top: 0, bottom: 0, left: 0, right: 0 };
    }

    // Safety check for web and cases where provider might be missing
    const safeInsets = insets || { top: 0, bottom: 0, left: 0, right: 0 };

    return (
        <View style={[
            styles.container,
            {
                paddingTop: safeInsets.top || 0,
                paddingBottom: useBottomInset ? (safeInsets.bottom || 0) : 0,
                minHeight: '100%', // Force visibility on web
                width: '100%',
                backgroundColor: Colors.background || '#FDFCFB'
            },
            style
        ]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background || '#FDFCFB',
    },
    inner: {
        flex: 1,
        width: '100%',
    }
});

export default ScreenWrapper;
