import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import { initDB } from '@modules/storage';
import { loadIdentity } from '@modules/identity';
import { useStore } from '@store/index';

import { FeedScreen } from '@screens/Feed';
import { ComposeScreen } from '@screens/Compose';
import { ProfileScreen } from '@screens/Profile';
import { NetworkScreen } from '@screens/Network';
import { OnboardingScreen } from '@screens/Onboarding';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Feed: '⊡',
    Réseau: '◎',
    Profil: '○',
  };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {icons[name] ?? '•'}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarStyle: { backgroundColor: '#000', borderTopColor: '#222' },
        tabBarActiveTintColor: '#1d9bf0',
        tabBarInactiveTintColor: '#555',
        headerStyle: { backgroundColor: '#000' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Réseau" component={NetworkScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const { user, setUser } = useStore();

  useEffect(() => {
    initDB();
    loadIdentity().then((identity) => {
      if (identity) setUser(identity);
    });
  }, [setUser]);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="Compose"
              component={ComposeScreen}
              options={{ presentation: 'modal', headerShown: false }}
            />
          </>
        ) : (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
