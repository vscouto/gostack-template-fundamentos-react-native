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
      const productsJson = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (productsJson) {
        setProducts(JSON.parse(productsJson));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const newProducs = products;
      const foundProduct = newProducs.find(
        (product: Product) => product.id === id,
      );

      if (foundProduct) {
        const indexOf = products.indexOf(foundProduct);
        foundProduct.quantity += 1;
        newProducs.splice(indexOf, 1, foundProduct);
        setProducts([...newProducs]);
      }

      AsyncStorage.removeItem('@GoBarber:user');
      AsyncStorage.setItem('@GoBarber:user', JSON.stringify(products));
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const newProduct = {
        id: product.id,
        title: product.title,
        image_url: product.image_url,
        price: product.price,
        quantity: 1,
      };
      const foundProduct = products.find(
        (prod: Product) => prod.id === product.id,
      );
      if (foundProduct) {
        increment(product.id);
        return;
      }

      setProducts([...products, newProduct]);
      AsyncStorage.removeItem('@GoBarber:user');
      AsyncStorage.setItem('@GoBarber:user', JSON.stringify(products));
    },
    [products, increment],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const newProducs = products;
      const foundProduct = newProducs.find(
        (product: Product) => product.id === id,
      );

      if (foundProduct) {
        const indexOf = products.indexOf(foundProduct);
        foundProduct.quantity -= 1;
        /* if (foundProduct.quantity <= 0) {
          newProducs.splice(indexOf, 1);
        } else {
          newProducs.splice(indexOf, 1, foundProduct);
        } */
        if (foundProduct.quantity <= 0) {
          foundProduct.quantity = 0;
        }
        newProducs.splice(indexOf, 1, foundProduct);
        setProducts([...newProducs]);
      }

      AsyncStorage.removeItem('@GoBarber:user');
      AsyncStorage.setItem('@GoBarber:user', JSON.stringify(products));
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
