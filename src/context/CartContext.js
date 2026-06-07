"use client";

import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const initialState = {
  items: [], // Array of { menuItem, name, price, quantity, image }
  isLoaded: false,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'LOAD_CART':
      return { ...state, items: action.payload, isLoaded: true };
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.menuItem === action.payload.menuItem
      );
      
      let newItems;
      if (existingItemIndex >= 0) {
        newItems = [...state.items];
        newItems[existingItemIndex].quantity += 1;
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }];
      }
      return { ...state, items: newItems };
    }
    case 'UPDATE_QUANTITY': {
      const { menuItem, quantity } = action.payload;
      let newItems;
      if (quantity <= 0) {
        newItems = state.items.filter((item) => item.menuItem !== menuItem);
      } else {
        newItems = state.items.map((item) =>
          item.menuItem === menuItem ? { ...item, quantity } : item
        );
      }
      return { ...state, items: newItems };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.menuItem !== action.payload),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('brewAndBiteCart');
      if (savedCart) {
        dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) });
      } else {
        dispatch({ type: 'LOAD_CART', payload: [] });
      }
    } catch (error) {
      console.error('Failed to load cart', error);
      dispatch({ type: 'LOAD_CART', payload: [] });
    }
  }, []);

  // Save to local storage on every change, but only after initial load
  useEffect(() => {
    if (state.isLoaded) {
      localStorage.setItem('brewAndBiteCart', JSON.stringify(state.items));
    }
  }, [state.items, state.isLoaded]);

  const addItem = (item) => dispatch({ type: 'ADD_ITEM', payload: item });
  const updateQuantity = (menuItem, quantity) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { menuItem, quantity } });
  const removeItem = (menuItem) =>
    dispatch({ type: 'REMOVE_ITEM', payload: menuItem });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const cartCount = state.items.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = state.items.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isLoaded: state.isLoaded,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
