import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { Colors } from '../theme/colors';

const ScreenWrapper = ({ children, style }) => {
    return (
        <SafeAreaView style={[styles.container, style]}>
            <View style={styles.inner}>
                {children}
            </View>
        </SafeAreaView>
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
