import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountTendered, setAmountTendered] = useState(0);

  const addToCart = (item) => {
    setCart((prev) => {
      // Always append a new cart item for every Add action so each click becomes an independent entry
      const cartItem = {
        ...item,
        cart_item_id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        weight_kg: Number(item.weight_kg || 1)
      };
      return [...prev, cartItem];
    });
  };

  const updateWeight = (inventoryIdOrProductId, weight) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cart_item_id === inventoryIdOrProductId || item.inventory_id === inventoryIdOrProductId || item.product_id === inventoryIdOrProductId) {
          return { ...item, weight_kg: Number(Math.max(0.1, weight).toFixed(3)) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (inventoryIdOrProductId) => {
    setCart((prev) => prev.filter((i) => i.cart_item_id !== inventoryIdOrProductId && i.inventory_id !== inventoryIdOrProductId && i.product_id !== inventoryIdOrProductId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setAmountTendered(0);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price_per_kg * item.weight_kg), 0);
  const total = Math.max(0, subtotal - discount);
  const change = Math.max(0, amountTendered - total);

  return (
    <CartContext.Provider
      value={{
        cart,
        discount,
        setDiscount,
        paymentMethod,
        setPaymentMethod,
        amountTendered,
        setAmountTendered,
        addToCart,
        updateWeight,
        removeFromCart,
        clearCart,
        subtotal,
        total,
        change
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
