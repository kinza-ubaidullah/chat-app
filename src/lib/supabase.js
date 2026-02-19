import { Platform } from 'react-native';
if (Platform.OS !== 'web') {
    require('react-native-url-polyfill/auto');
}
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// --- CONFIGURATION ---
// Precedence: 
// 1. process.env (EXPO_PUBLIC_)
// 2. Constants.expoConfig.extra (app.json)
const supabaseUrl = Constants?.expoConfig?.extra?.supabaseUrl || '';
const supabaseAnonKey = Constants?.expoConfig?.extra?.supabaseAnonKey || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing! App may not function correctly.');
}

// Create the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

console.log('Supabase Initialized with URL:', supabaseUrl);
