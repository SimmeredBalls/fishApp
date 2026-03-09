import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { supabase } from './lib/supabase';
import AuthScreen from './screens/AuthScreen';
import MainShopNavigator from './navigation/MainShopNavigator'; // You'll create this next
import { CartProvider } from './context/CartContext';

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for changes (login/logout)
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <CartProvider>
      <NavigationContainer>
        {session && session.user ? (
          <MainShopNavigator /> 
        ) : (
          <AuthScreen />
        )}
      </NavigationContainer>
    </CartProvider>
  );
}