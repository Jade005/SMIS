import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const getStorageKey = (currentUser) => {
  if (!currentUser || !currentUser.id) return null;
  if (currentUser.role === 'cashier') return `cart_cashier_${currentUser.id}`;
  return `cart_${currentUser.id}`;
};

const loadStoredCart = (key) => {
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load stored cart:', err);
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const currentKey = getStorageKey(user);
  const activeKeyRef = useRef(currentKey);

  const [cart, setCart] = useState(() => loadStoredCart(currentKey));
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountTendered, setAmountTendered] = useState(0);

  // Tracks the active customer pre-order being fulfilled
  const [activeOrder, setActiveOrder] = useState(null);
  // { orderId, orderNo, customerId, customerName, customerPhone }

  // Synchronize cart state whenever the authenticated user changes (login, logout, switch account)
  useEffect(() => {
    activeKeyRef.current = currentKey;
    if (currentKey) {
      setCart(loadStoredCart(currentKey));
    } else {
      setCart([]);
      setActiveOrder(null);
      setDiscount(0);
      setPaymentMethod('cash');
      setAmountTendered(0);
    }
  }, [currentKey]);

  // Helper to update React state and simultaneously persist to the isolated user storage
  const updateAndPersistCart = (updaterOrNewCart) => {
    setCart((prev) => {
      const nextCart = typeof updaterOrNewCart === 'function' ? updaterOrNewCart(prev) : updaterOrNewCart;
      const key = activeKeyRef.current;
      if (key) {
        try {
          localStorage.setItem(key, JSON.stringify(nextCart));
        } catch (err) {
          console.error('Failed to save user cart:', err);
        }
      }
      return nextCart;
    });
  };

  const addToCart = (item) => {
    updateAndPersistCart((prev) => {
      const cartItem = {
        ...item,
        cart_item_id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        weight_kg: Number(item.weight_kg || 1),
        source: item.source || 'walkin' // 'preorder' | 'walkin'
      };
      return [...prev, cartItem];
    });
  };

  /**
   * Load a pending customer order into the cart.
   * `orderDetails`  — the full order object from GET /orders/:id (includes .items[])
   * `batches`       — the currently loaded inventory batches (used to resolve inventory_id from product_id)
   * Returns an array of product names that could NOT be resolved to an inventory batch (stock warning).
   */
  const loadOrderIntoCart = (orderDetails, batches = []) => {
    const unresolved = [];
    const newCartItems = [];

    for (const item of orderDetails.items || []) {
      // Find the first available inventory batch for this product_id
      const batch = batches.find(
        (b) => b.product_id === item.product_id && Number(b.available_stock_kg) > 0
      );

      if (!batch) {
        unresolved.push(item.product_name || `Product #${item.product_id}`);
        continue;
      }

      newCartItems.push({
        cart_item_id: `preorder-${item.id || item.product_id}-${Date.now()}`,
        inventory_id: batch.id,
        product_id: item.product_id,
        product_name: item.product_name || batch.product_name,
        meat_cut: item.meat_cut || batch.meat_cut,
        price_per_kg: Number(item.price_per_kg || batch.price_per_kg),
        available_stock_kg: Number(batch.available_stock_kg),
        weight_kg: Number(item.weight_kg || 1),
        source: 'preorder'
      });
    }

    updateAndPersistCart(newCartItems);
    setDiscount(0);
    setAmountTendered(0);
    setActiveOrder({
      orderId: orderDetails.id,
      orderNo: orderDetails.order_no,
      customerId: orderDetails.customer_id,
      customerName: orderDetails.customer_name,
      customerPhone: orderDetails.customer_phone || null
    });

    return unresolved; // caller can warn cashier if any items couldn't be resolved
  };

  /**
   * Deselect the active customer order and reset the cart to walk-in mode.
   */
  const clearActiveOrder = () => {
    setActiveOrder(null);
    updateAndPersistCart([]);
    setDiscount(0);
    setAmountTendered(0);
  };

  const updateWeight = (cartItemIdOrInventoryId, weight) => {
    updateAndPersistCart((prev) =>
      prev.map((item) => {
        if (
          item.cart_item_id === cartItemIdOrInventoryId ||
          item.inventory_id === cartItemIdOrInventoryId ||
          item.product_id === cartItemIdOrInventoryId
        ) {
          return { ...item, weight_kg: Number(Math.max(0.1, weight).toFixed(3)) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemIdOrInventoryId) => {
    updateAndPersistCart((prev) =>
      prev.filter(
        (i) =>
          i.cart_item_id !== cartItemIdOrInventoryId &&
          i.inventory_id !== cartItemIdOrInventoryId &&
          i.product_id !== cartItemIdOrInventoryId
      )
    );
  };

  const clearCart = () => {
    updateAndPersistCart([]);
    setDiscount(0);
    setAmountTendered(0);
    // NOTE: does NOT clear activeOrder — use clearActiveOrder() for that
  };

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price_per_kg) || 0) * (Number(item.weight_kg) || 0), 0);
  const total = Math.max(0, subtotal - discount);
  const change = Math.max(0, amountTendered - total);

  return (
    <CartContext.Provider
      value={{
        // Cart state
        cart,
        discount,
        setDiscount,
        paymentMethod,
        setPaymentMethod,
        amountTendered,
        setAmountTendered,
        // Customer order session
        activeOrder,
        loadOrderIntoCart,
        clearActiveOrder,
        // Cart actions
        addToCart,
        updateWeight,
        removeFromCart,
        clearCart,
        // Computed totals
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
