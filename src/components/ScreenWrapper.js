import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenWrapper = ({ children, style, useBottomInset = false }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[
            styles.container,
            {
                paddingTop: insets.top,
                paddingBottom: useBottomInset ? insets.bottom : 0
            },
            style
        ]}>
            <View style={styles.inner}>
                {children}
            </View>
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
