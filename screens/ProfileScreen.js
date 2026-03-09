import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Fetch Profile Info
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // 2. Fetch User's Orders
    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (profileData) setProfile(profileData);
    if (orderData) setOrders(orderData);
    setLoading(false);
  }

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View>
        <Text style={styles.orderId}>Order ID: #{item.id.slice(0, 8)}</Text>
        <Text style={styles.orderDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.orderPrice}>₱{item.total_price}</Text>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      renderItem={renderOrder}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.avatar}>
          {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
          ) : (
              <Text style={styles.avatarText}>{profile?.full_name?.charAt(0) || '?'}</Text>
          )}
          </View>
          <Text style={styles.name}>{profile?.full_name || 'Guest User'}</Text>
          <Text style={styles.username}>@{profile?.username || 'user'}</Text>
          
          <TouchableOpacity 
            style={styles.editBtn} 
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Order History</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.emptyText}>No orders yet.</Text>}
      ListFooterComponent={
        <TouchableOpacity style={styles.logoutBtn} onPress={() => supabase.auth.signOut()}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      }
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f8f9fa' },
  header: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#2ecc71', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  username: { color: '#7f8c8d' },
  editBtn: { marginTop: 15, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#2ecc71' },
  editBtnText: { color: '#2ecc71', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', alignSelf: 'flex-start', marginTop: 30, marginBottom: 10 },
  orderCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, elevation: 2 },
  orderId: { fontWeight: 'bold' },
  orderDate: { fontSize: 12, color: '#999' },
  orderPrice: { fontWeight: 'bold', color: '#2ecc71' },
  logoutBtn: { marginTop: 40, padding: 15, backgroundColor: '#ff4757', borderRadius: 10 },
  logoutText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20 },
  avatarImage: { width: 70, height: 70, borderRadius: 35 }
});