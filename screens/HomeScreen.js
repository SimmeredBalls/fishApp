import React, { useEffect, useState } from 'react';
// Added Image to the imports
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';

export default function HomeScreen() {
  const [fish, setFish] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFish();
  }, []);

  async function fetchFish() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Error fetching fish:', error);
    } else {
      setFish(data);
    }
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        {/* Product Image Section */}
        <Image 
          source={{ 
            uri: item.image_url || 'https://via.placeholder.com/100?text=No+Image' 
          }} 
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Details Section */}
        <View style={styles.details}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.category}>{item.category || 'General'}</Text>
          <Text style={styles.price}>₱{item.price}</Text>
          <Text style={{ color: item.stock > 0 ? 'green' : 'red', fontSize: 12 }}>
            Stock: {item.stock > 0 ? item.stock : 'Out of Stock'}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: item.stock > 0 ? '#2ecc71' : '#ccc' }]} 
        onPress={() => item.stock > 0 ? addToCart(item) : Alert.alert("Out of Stock")}
        disabled={item.stock <= 0}
      >
        <Text style={styles.buttonText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList 
        data={fish} 
        renderItem={renderItem} 
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  card: { backgroundColor: '#fff', padding: 15, marginVertical: 8, borderRadius: 10, elevation: 3 },
  row: { flexDirection: 'row', marginBottom: 10 },
  image: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#eee' },
  details: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  name: { fontSize: 18, fontWeight: 'bold' },
  category: { fontSize: 12, color: '#666', marginBottom: 2 },
  price: { fontSize: 16, color: '#333', fontWeight: '600' },
  addButton: { padding: 12, marginTop: 5, borderRadius: 5 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' }
});