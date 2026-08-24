import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountTendered, setAmountTendered] = useState(0);

  // Tracks the active customer pre-order being fulfilled
  const [activeOrder, setActiveOrder] = useState(null);
  // { orderId, orderNo, customerId, customerName, customerPhone }

  const addToCart = (item) => {
    setCart((prev) => {
      const cartItem = {
        ...item,
        cart_item_id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        weight_kg: Number(item.weight_kg || 1),
        source: item.source || 'walkin'   // 'preorder' | 'walkin'
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

    setCart(newCartItems);
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
    setCart([]);
    setDiscount(0);
    setAmountTendered(0);
  };

  const updateWeight = (cartItemIdOrInventoryId, weight) => {
    setCart((prev) =>
      prev.map((item) => {
        if (
          item.cart_item_id === cartItemIdOrInventoryId ||
          item.inventory_id === cartItemIdOrInventoryId
        ) {
          return { ...item, weight_kg: Number(Math.max(0.1, weight).toFixed(3)) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemIdOrInventoryId) => {
    setCart((prev) =>
      prev.filter(
        (i) =>
          i.cart_item_id !== cartItemIdOrInventoryId &&
          i.inventory_id !== cartItemIdOrInventoryId
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setAmountTendered(0);
    // NOTE: does NOT clear activeOrder — use clearActiveOrder() for that
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price_per_kg * item.weight_kg, 0);
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
