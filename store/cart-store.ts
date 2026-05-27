import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  slug: string;
  unit: string;
};

type CartItem = Product & {
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  isOpen: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
};

export const useCartStore =
  create<CartStore>()(
    persist(
      (set) => ({
    isOpen: false,
      items: [],
        
    openCart: () =>
    set({
        isOpen: true,
    }),

    closeCart: () =>
    set({
        isOpen: false,
    }),

    increaseQuantity: (id) =>
  set((state) => ({
    items: state.items.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    ),
  })),
    
    decreaseQuantity: (id) =>
  set((state) => ({
    items: state.items
      .map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item
      )
      .filter((item) => item.quantity > 0),
  })),
    
    addToCart: (product) =>
      set((state) => {
        const existingItem =
          state.items.find(
            (item) => item.id === product.id
          );

        if (existingItem) {
            return {
              isOpen: true,
            items: state.items.map((item) =>
              item.id === product.id
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                  }
                : item
            ),
          };
        }

          return {
            isOpen: true,
          items: [
            ...state.items,
            {
              ...product,
              quantity: 1,
            },
          ],
        };
      }),

    removeFromCart: (id) =>
      set((state) => ({
        items: state.items.filter(
          (item) => item.id !== id
        ),
      })),

    clearCart: () =>
      set({
        items: [],
      }),

      }),
      {
        name: 'cart-storage-v2',
      }
    )
  );