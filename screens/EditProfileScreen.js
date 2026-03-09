import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(false);
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    let { data } = await supabase.from('profiles').select(`*`).eq('id', user.id).single();
    if (data) {
      setFullname(data.full_name);
      setUsername(data.username);
      setAvatarUrl(data.avatar_url);
    }
  }

  async function pickImage() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  }

    async function uploadImage(uri) {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            // Normalizing the URI for Android
            const photoUri = Platform.OS === 'android' ? uri.replace('file://', '') : uri;

            const response = await fetch(uri);
            const blob = await response.blob();
            
            const filePath = `${user.id}/avatar.jpg`; 

            const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, blob, {
                contentType: 'image/jpeg',
                upsert: true 
            });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
            
        } catch (err) {
            // If it's still failing, the console will tell us if it's a 403 (Policy) or 500 (Network)
            console.log("Full Error Object:", JSON.stringify(err, null, 2));
            Alert.alert("Upload Error", "Network request failed. Please check your connection.");
        } finally {
            setLoading(false);
        }
    }

  async function updateProfile() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const updates = { id: user.id, full_name: fullname, username: username, avatar_url: avatarUrl, updated_at: new Date() };

    const { error } = await supabase.from('profiles').upsert(updates);
    if (error) Alert.alert(error.message);
    else Alert.alert("Success", "Profile updated!");
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: '#ccc' }]} />
        )}
        <Text style={{ color: '#2ecc71', marginTop: 10 }}>Change Photo</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Full Name</Text>
      <TextInput style={styles.input} value={fullname} onChangeText={setFullname} />
      
      <Text style={styles.label}>Username</Text>
      <TextInput style={styles.input} value={username} onChangeText={setUsername} />

      <TouchableOpacity style={styles.button} onPress={updateProfile} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Update Profile'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  avatarContainer: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  label: { fontWeight: 'bold', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 5, marginBottom: 20 },
  button: { backgroundColor: '#2ecc71', padding: 15, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});