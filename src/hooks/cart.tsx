import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const session = await AsyncStorage.getItem('@GoMarketplace:session');
      if (session) {
        setProducts([...JSON.parse(session)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      if (products.some(item => item.id === product.id)) {
        const newArray = products.filter(item => {
          if (item.id === product.id) item.quantity += 1;
          return products;
        });
        setProducts(newArray);
        await AsyncStorage.setItem(
          '@GoMarketplace:session',
          JSON.stringify(products),
        );
      } else {
        product.quantity = 1;
        setProducts([...products, product]);
        await AsyncStorage.setItem(
          '@GoMarketplace:session',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const increment = useCallback(async id => {
      const newArray = products.filter(item => {
        if (item.id === id) item.quantity += 1;
        return products;
      });
      setProducts(newArray);
      await AsyncStorage.setItem(
        '@GoMarketplace:session',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(async id => {
      const newArray = products.filter(item => {
        if (item.id === id) item.quantity -= 1;
        return products;
      });
      setProducts(newArray);
      await AsyncStorage.setItem(
        '@GoMarketplace:session',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
