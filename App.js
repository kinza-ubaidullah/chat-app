import { Platform, View, Text, StatusBar } from 'react-native';
if (Platform.OS !== 'web') {
  require('react-native-url-polyfill/auto');
}
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from './src/theme/colors';
import { supabase } from './src/lib/supabase';
import { configureGoogleSignIn } from './src/lib/googleAuth';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import LoginScreen from './src/screens/LoginScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import OTPScreen from './src/screens/OTPScreen';
import HomeScreen from './src/screens/HomeScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import ChatDetailScreen from './src/screens/ChatDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import DiscoveryScreen from './src/screens/DiscoveryScreen';
import AboutScreen from './src/screens/AboutScreen';
import ContactScreen from './src/screens/ContactScreen';
import BlogsScreen from './src/screens/BlogsScreen';
import BlogPostScreen from './src/screens/BlogPostScreen';
import SuccessStoriesScreen from './src/screens/SuccessStoriesScreen';
import LoadingScreen from './src/screens/LoadingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#ADAFBB',
        tabBarHideOnKeyboard: Platform.OS !== 'web',
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 70, // Standard height
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 5,
        }
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatListScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Google Sign-In (Native only)
    if (Platform.OS !== 'web') {
      configureGoogleSignIn();
    }

    const loadApp = async () => {
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 5000));
      const sessionCheck = supabase.auth.getSession().catch(err => {
        console.error('Session error:', err);
        return { data: { session: null } };
      });

      const [_, { data: { session } }] = await Promise.all([minLoadTime, sessionCheck]);

      console.log('Initial session check:', session ? 'User logged in' : 'No session');
      setSession(session);
      setLoading(false);
    };

    loadApp();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session ? 'User logged in' : 'No session');
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FDFCFB', justifyContent: 'center', alignItems: 'center' }}>
        <LoadingScreen message="Initializing session..." />
      </View>
    );
  }

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: '#FDFCFB' }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <View style={{ flex: 1, backgroundColor: '#FDFCFB' }}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: Platform.OS === 'web' ? 'none' : 'slide_from_right'
            }}
          >
            {session ? (
              /* App Flow */
              <>
                <Stack.Screen name="Main" component={MainTabs} />
                <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
                <Stack.Screen name="Subscription" component={SubscriptionScreen} />
                <Stack.Screen name="Analysis" component={AnalysisScreen} />
                <Stack.Screen name="Discovery" component={DiscoveryScreen} />
                <Stack.Screen name="About" component={AboutScreen} />
                <Stack.Screen name="Contact" component={ContactScreen} />
                <Stack.Screen name="Blogs" component={BlogsScreen} />
                <Stack.Screen name="BlogPost" component={BlogPostScreen} />
                <Stack.Screen name="SuccessStories" component={SuccessStoriesScreen} />
              </>
            ) : (
              /* Auth Flow */
              <>
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen name="OTP" component={OTPScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}

