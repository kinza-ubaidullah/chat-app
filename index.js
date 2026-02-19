import 'react-native-gesture-handler';
import { Platform } from 'react-native'; // Import Platform from react-native for the polyfill check
import Constants from 'expo-constants'; // Import Constants for accessing extra config
if (typeof Platform !== 'undefined' && Platform.OS !== 'web') {
    require('react-native-url-polyfill/auto');
}
import { registerRootComponent } from 'expo';
import App from './App';


// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
registerRootComponent(App);
