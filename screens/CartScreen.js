import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

export default function CartScreen() {
  const { cart, removeFromCart, getTotalPrice, clearCart } = useCart();
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (cart.length === 0) return Alert.alert("Empty Cart");
    if (!address || !contact) return Alert.alert("Missing Info", "Please provide delivery details.");
    
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Create Order (Order Processing) [cite: 132]
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ 
        user_id: user.id, 
        total_price: getTotalPrice(), 
        delivery_address: address,
        contact_number: contact,
        status: 'pending' 
      }])
      .select().single();

    if (order) {
      // 2. Insert Order Details [cite: 91]
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      
      if (!itemsError) {
        Alert.alert("Order Confirmation", "Your order has been placed!"); // [cite: 133]
        clearCart();
        setAddress('');
        setContact('');
      }
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <FlatList 
        data={cart} 
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.name} (x{item.quantity})</Text>
            <TouchableOpacity onPress={() => removeFromCart(item.id)}>
              <Text style={{ color: 'red' }}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Delivery Address" value={address} onChangeText={setAddress} />
        <TextInput style={styles.input} placeholder="Contact Number" value={contact} onChangeText={setContact} keyboardType="phone-pad" />
        <Text style={styles.total}>Total: ₱{getTotalPrice()}</Text>
        <TouchableOpacity style={styles.btn} onPress={handleCheckout} disabled={loading}>
          <Text style={styles.btnText}>Confirm Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  item: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1 },
  form: { marginTop: 20, padding: 15, backgroundColor: '#eee', borderRadius: 10 },
  input: { backgroundColor: '#fff', padding: 10, borderRadius: 5, marginBottom: 10 },
  total: { fontSize: 18, fontWeight: 'bold', textAlign: 'right', marginBottom: 10 },
  btn: { backgroundColor: '#2ecc71', padding: 15, borderRadius: 5 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' }
});