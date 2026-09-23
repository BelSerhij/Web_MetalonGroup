import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Product = {
  id: string;
  cartId: string;
  title: string;
  price: number;
  image: string;
  slug: string;
  unit: string;
  quantity: number;
  length: number;
  meters: number;
  area: number;
  total: number;
};

type CartItem = Product;

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
      item.cartId === id
        ? {
            ...item,
            quantity: item.quantity + 1,
            meters: item.meters + item.meters / item.quantity,
            area: item.area + item.area / item.quantity,
            total: item.total + item.total / item.quantity,
          }
        : item
    ),
  })),
    
    decreaseQuantity: (id) =>
  set((state) => ({
    items: state.items
      .map((item) =>
          item.cartId === id
            ? {
              ...item,
              quantity: item.quantity - 1,
              meters: item.meters - item.meters / item.quantity,
              area: item.area - item.area / item.quantity,
              total: item.total - item.total / item.quantity,
            }
          : item
      )
      .filter((item) => item.quantity > 0),
  })),
    
    addToCart: (product) =>
      set((state) => {
        const existingItem =
          state.items.find(
            (item) => item.cartId === product.cartId
          );

        if (existingItem) {
            return {
              isOpen: true,
            items: state.items.map((item) =>
              item.cartId === product.cartId
                ? {
                    ...item,
                    quantity: item.quantity + product.quantity,
                    meters: item.meters + product.meters,
                    area: item.area + product.area,
                    total: item.total + product.total,
                  }
                : item
            ),
          };
        }

          return {
            isOpen: true,
          items: [
            ...state.items,
            product,
          ],
        };
      }),

    removeFromCart: (id) =>
      set((state) => ({
        items: state.items.filter(
          (item) => item.cartId !== id
        ),
      })),

    clearCart: () =>
      set({
        items: [],
      }),

      }),
      {
        // v3 stores ProductVariant IDs. v2 stored Product IDs from catalog quick-add,
        // which cannot be safely used to create an order.
        name: 'cart-storage-v4',
      }
    )
  );
