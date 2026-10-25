import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const getStorageKey = (currentUser) => {
  if (!currentUser || !currentUser.id) return 'cart_guest';
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
    const maxStock = Number(item.available_stock_kg ?? item.total_available_stock_kg ?? item.stock ?? 0);
    const addWeight = Number(item.weight_kg) || 1;

    if (maxStock <= 0) {
      return { success: false, reason: 'out_of_stock', message: 'Item is currently out of stock.' };
    }

    let addedSuccessfully = true;
    let finalAddedWeight = addWeight;
    let failureReason = '';

    updateAndPersistCart((prev) => {
      // Find existing item by inventory_id (cashier POS) or product_id (customer catalog)
      const existingIndex = prev.findIndex((i) => {
        if (item.inventory_id && i.inventory_id) {
          return i.inventory_id === item.inventory_id;
        }
        return i.product_id === item.product_id;
      });

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const effectiveMax = maxStock > 0 ? maxStock : (Number(existing.available_stock_kg) || 9999);
        const combinedWeight = Number((existing.weight_kg + addWeight).toFixed(3));
        const cappedWeight = Math.min(effectiveMax, combinedWeight);

        if (existing.weight_kg >= effectiveMax) {
          addedSuccessfully = false;
          failureReason = `Cannot add more: you already have the maximum available stock (${effectiveMax} kg) in your cart.`;
          return prev;
        }

        finalAddedWeight = Number((cappedWeight - existing.weight_kg).toFixed(3));
        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          ...item,
          weight_kg: cappedWeight,
          available_stock_kg: effectiveMax,
          total_available_stock_kg: effectiveMax
        };
        return updated;
      }

      const initialWeight = maxStock > 0 ? Math.min(maxStock, addWeight) : addWeight;
      const cartItem = {
        ...item,
        cart_item_id: item.cart_item_id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        weight_kg: initialWeight,
        available_stock_kg: maxStock,
        total_available_stock_kg: maxStock,
        source: item.source || (item.inventory_id ? 'walkin' : 'preorder')
      };
      return [...prev, cartItem];
    });

    return {
      success: addedSuccessfully,
      weightAdded: finalAddedWeight,
      message: addedSuccessfully ? 'Item added to cart.' : failureReason
    };
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
        weight_kg: Math.min(Number(batch.available_stock_kg), Number(item.weight_kg || 1)),
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
          const maxAllowed = Number(item.available_stock_kg ?? item.total_available_stock_kg) || 0;
          let clampedWeight = Number(Math.max(0.1, weight).toFixed(3));
          if (maxAllowed > 0 && clampedWeight > maxAllowed) {
            clampedWeight = maxAllowed;
          }
          return { ...item, weight_kg: clampedWeight };
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
  const effectiveDiscount = Math.min(Math.max(0, Number(discount) || 0), subtotal);
  const total = Math.max(0, subtotal - effectiveDiscount);
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
