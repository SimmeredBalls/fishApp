import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart data from Supabase on mount or when user changes
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // We join with products to get name and price for the UI
    const { data, error } = await supabase
      .from('cart')
      .select('*, products(name, price)')
      .eq('user_id', user.id);

    if (data) {
      // Format data to match our previous local structure
      const formattedCart = data.map(item => ({
        id: item.product_id,
        cart_record_id: item.id,
        name: item.products.name,
        price: item.products.price,
        quantity: item.quantity
      }));
      setCart(formattedCart);
    }
  };

  const addToCart = async (product) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      // Update quantity in database [cite: 128]
      const { error } = await supabase
        .from('cart')
        .update({ quantity: existingItem.quantity + 1 })
        .eq('user_id', user.id)
        .eq('product_id', product.id);
      
      if (!error) fetchCart();
    } else {
      // Insert new item to database [cite: 127]
      const { error } = await supabase
        .from('cart')
        .insert([{ 
          user_id: user.id, 
          product_id: product.id, 
          quantity: 1 
        }]);
      
      if (!error) fetchCart();
    }
  };

  const removeFromCart = async (productId) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Remove item from database [cite: 129]
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (!error) {
      setCart((curr) => curr.filter((item) => item.id !== productId));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0); // [cite: 130]
  };

  const clearCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('cart').delete().eq('user_id', user.id);
    setCart([]);
  };

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        getTotalPrice, 
        clearCart,
        fetchCart // Exposed so screens can manually refresh if needed
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);