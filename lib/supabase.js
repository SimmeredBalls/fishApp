import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ldrcwpszljohvkcbqiqw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkcmN3cHN6bGpvaHZrY2JxaXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzQ0MjcsImV4cCI6MjA4ODYxMDQyN30.G2hmC7GMZRQNieYLnoQrJ4WMunG88RJWuz0kDcIM-yA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});