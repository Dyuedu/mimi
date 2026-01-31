import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CART_STORAGE_KEY = 'mimi_cart';

const CartContext = createContext(null);

function getStorageKey(userId) {
  return userId ? `${CART_STORAGE_KEY}_${userId}` : null;
}

function loadCartFromStorage(userId) {
  const key = getStorageKey(userId);
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(userId, items) {
  const key = getStorageKey(userId);
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    console.warn('Could not save cart to localStorage', e);
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync cart when user changes (login/logout)
  useEffect(() => {
    const syncUser = () => {
      try {
        const saved = sessionStorage.getItem('user');
        if (!saved) {
          setUserId(null);
          setItems([]);
          return;
        }
        const user = JSON.parse(saved);
        const id = user?.id ?? user?.userId ?? null;
        setUserId(id);
        setItems(loadCartFromStorage(id));
      } catch {
        setUserId(null);
        setItems([]);
      }
    };
    syncUser();
    const onUser = () => syncUser();
    window.addEventListener('mimi:user-updated', onUser);
    window.addEventListener('storage', (e) => e.key === 'user' && syncUser());
    return () => {
      window.removeEventListener('mimi:user-updated', onUser);
      window.removeEventListener('storage', onUser);
    };
  }, []);

  useEffect(() => {
    saveCartToStorage(userId, items);
  }, [userId, items]);

  const addToCart = useCallback((payload) => {
    const {
      productId,
      product,
      quantity = 1,
      colorLabel = '',
      sizeLabel = '',
      colorIndex,
      sizeIndex,
      imageSrc,
    } = payload;
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) =>
          String(i.productId) === String(productId) &&
          (i.colorIndex === colorIndex || (i.colorIndex == null && colorIndex == null)) &&
          (i.sizeIndex === sizeIndex || (i.sizeIndex == null && sizeIndex == null))
      );
      const price = product?.buyPrice ?? product?.rentPrice ?? product?.price ?? 0;
      const entry = {
        productId,
        product: {
          id: product?.id ?? productId,
          name: product?.name ?? '',
          price,
          imageSrc: imageSrc ?? (product?.images?.[0] ? (typeof product.images[0] === 'string' ? `/img-product/${product.images[0]}` : `/img-product/${product.images[0].imageUrl}`) : null),
        },
        quantity,
        colorLabel: colorLabel || '',
        sizeLabel: sizeLabel || '',
        colorIndex,
        sizeIndex,
      };
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        return next;
      }
      return [...prev, entry];
    });
  }, []);

  const removeFromCart = useCallback((productId, colorIndex, sizeIndex) => {
    setItems((prev) =>
      prev.filter(
        (i) =>
          String(i.productId) !== String(productId) ||
          i.colorIndex !== colorIndex ||
          i.sizeIndex !== sizeIndex
      )
    );
  }, []);

  const updateQuantity = useCallback((productId, colorIndex, sizeIndex, delta) => {
    setItems((prev) =>
      prev.map((i) => {
        if (
          String(i.productId) !== String(productId) ||
          i.colorIndex !== colorIndex ||
          i.sizeIndex !== sizeIndex
        )
          return i;
        const q = Math.max(0, i.quantity + delta);
        if (q === 0) return null;
        return { ...i, quantity: q };
      }).filter(Boolean)
    );
  }, []);

  const getCartCount = useCallback(() => {
    return items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  }, [items]);

  const isInCart = useCallback((productId, colorIndex, sizeIndex) => {
    return items.some(
      (i) =>
        String(i.productId) === String(productId) &&
        (i.colorIndex === colorIndex || (i.colorIndex == null && colorIndex == null)) &&
        (i.sizeIndex === sizeIndex || (i.sizeIndex == null && sizeIndex == null))
    );
  }, [items]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((v) => !v), []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartCount,
    isInCart,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
