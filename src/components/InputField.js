import React, { useState, useRef } from 'react';
import { StyleSheet, View, TextInput, Text, Animated, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

const InputField = ({ icon, placeholder, value, onChangeText, secureTextEntry, label }) => {
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useRef(new Animated.Value(0)).current;

    const handleFocus = () => {
        setIsFocused(true);
        Animated.timing(focusAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: false,
        }).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        Animated.timing(focusAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: false,
        }).start();
    };

    const borderColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [Colors.border, Colors.primary],
    });

    const shadowOpacity = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.1],
    });

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <Animated.View style={[
                styles.inputWrapper,
                {
                    borderColor: borderColor,
                    shadowOpacity: shadowOpacity,
                    backgroundColor: isFocused ? Colors.surface : Colors.white,
                    transform: [{
                        scale: focusAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.01],
                        })
                    }]
                }
            ]}>
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={isFocused ? Colors.primary : Colors.placeholder}
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    underlineColorAndroid="transparent"
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 60,
        borderRadius: 16,
        borderWidth: 1.5,
        paddingHorizontal: 16,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 2,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        color: Colors.text,
        fontSize: 16,
        fontWeight: '500',
        ...Platform.select({
            web: {
                outlineStyle: 'none',
            }
        })
    },
});

export default InputField;
