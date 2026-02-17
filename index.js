import '@expo/metro-runtime';
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import App from './App';

try {
    registerRootComponent(App);
} catch (error) {
    console.error('Failed to register root component:', error);
}
