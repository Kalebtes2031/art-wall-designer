// src/context/PlacedItemsProvider.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import type { Product, Size } from "../types/Product";
import type { CartItem } from "../types/Cart";
import { getAssetUrl } from "../utils/getAssetUrl";
import { debounce } from "../utils/debounce";

export interface PlacedItem {
  id: string;
  itemId: string | null;
  itemIdTemp?: string; 
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  productId: string;
  sizeIndex: number;
  rotation?: number;
  zIndex?: number;

  // relative values for persistent storage
  positionX: number;
  positionY: number;
  scale: number; // use single scale from backend
}

interface PlacedItemsContextValue {
  placed: PlacedItem[];
  addItem: (
    item: Partial<PlacedItem>,
    dimensions: { width: number; height: number },
    backendAdd?: any
  ) => Promise<void>;
  moveItem: (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    canvasWidth: number,
    canvasHeight: number,
    backendUpdate?: any
  ) => void;
  deleteItem: (id: string, backendDelete?: any) => void;
  editItemSize: (
    id: string,
    newSizeIndex: number,
    newSize: Size,
    dimensions: { width: number; height: number },
    backendEditSize?: any
  ) => Promise<void>;
  syncWithCart: (
    cart: { items: CartItem[] } | undefined,
    dimensions: { width: number; height: number }
  ) => void;
  restoreFromLocalStorage: (dimensions: {
    width: number;
    height: number;
  }) => void;
  mergeGuestItems: (
    backendAdd: any,
    dimensions: { width: number; height: number }
  ) => void;
  setProductsRef: (products: Product[]) => void;
  clearPlaced: () => void;
  deleteItemByItemId: (itemId: string, backendDelete?: any) => void;
  deleteItemUniversal : (
  identifier: string,        // can be either local id or backend itemId
  backendDelete?: any
) => void;
}

const PlacedItemsContext = createContext<PlacedItemsContextValue | undefined>(
  undefined
);

export const PlacedItemsProvider = ({ children }: { children: ReactNode }) => {
  const [placed, setPlaced] = useState<PlacedItem[]>([]);
  const latestRef = useRef<PlacedItem[]>([]);
  latestRef.current = placed;

  const productsRef = useRef<Product[]>([]);
  const moveTimers = useRef<Record<string, (...args: any[]) => void>>({});

  const calculateDimensions = (size: Size, wallWidth: number) => {
    const scale = wallWidth / 500;
    return { width: size.widthCm * scale, height: size.heightCm * scale };
  };

  useEffect(() => {
    try {
      localStorage.setItem("placedPositions", JSON.stringify(placed));
    } catch (err) {
      console.error("Failed to save placedPositions:", err);
    }
  }, [placed]);

  const restoreFromLocalStorage = useCallback(
    (dimensions: { width: number; height: number }) => {
      try {
        const saved = localStorage.getItem("placedPositions");
        if (!saved) return;

        const restored: PlacedItem[] = JSON.parse(saved).map(
          (p: PlacedItem) => {
            const product = productsRef.current.find(
              (prod) => prod._id === p.productId
            );
            const size = product?.sizes[p.sizeIndex];
            if (!size) return p;

            const { width, height } = calculateDimensions(
              size,
              dimensions.width
            );
            return {
              ...p,
              x: p.positionX * dimensions.width,
              y: p.positionY * dimensions.height,
              width: width * p.scale,
              height: height * p.scale,
            };
          }
        );

        setPlaced(restored);
      } catch (err) {
        console.error("Failed to restore placedPositions:", err);
      }
    },
    []
  );

const addItem = async (
  item: Partial<PlacedItem>,
  dimensions: { width: number; height: number },
  backendAdd?: any
) => {
  const tempId = `temp-${Date.now()}-${Math.random()}`;
  const pxW = item.width ?? 100;
  const pxH = item.height ?? 100;
  const scale = item.scale ?? 1;

  const newItem: PlacedItem = {
    id: tempId,
    itemId: null,
    itemIdTemp: tempId,
    src: item.src ?? "",
    x: dimensions.width / 2 - pxW / 2,
    y: dimensions.height / 2 - pxH / 2,
    width: pxW,
    height: pxH,
    productId: item.productId!,
    sizeIndex: item.sizeIndex!,
    rotation: 0,
    zIndex: placed.length,
    positionX: (dimensions.width / 2 - pxW / 2) / dimensions.width,
    positionY: (dimensions.height / 2 - pxH / 2) / dimensions.height,
    scale,
  };

  setPlaced((prev) => [...prev, newItem]);

  if (backendAdd) {
    try {
      const placement = {
        positionX: newItem.positionX,
        positionY: newItem.positionY,
        scale: newItem.scale,
        rotation: newItem.rotation,
        zIndex: newItem.zIndex,
      };

      const updatedCart = await backendAdd(
        newItem.productId,
        newItem.sizeIndex,
        placement
      );

      if (updatedCart) {
        const matched = updatedCart.items.find(
          (i: CartItem) => i._id === newItem.itemId || i._id === newItem.itemIdTemp
        );

        if (matched) {
          setPlaced((prev) =>
            prev.map((p) =>
              p.id === tempId
                ? {
                    ...p,
                    id: `${matched._id}-${p.sizeIndex}`,
                    itemId: matched._id,
                    itemIdTemp: undefined,
                  }
                : p
            )
          );
        }
      }
    } catch (err) {
      console.error("Failed to sync addItem:", err);
    }
  }
};

const deleteItem = (id: string, backendDelete?: any) => {
  const item = latestRef.current.find((p) => p.id === id);
  setPlaced((prev) => prev.filter((p) => p.id !== id));

  if (backendDelete && item?.itemId) {
    backendDelete(item.itemId).catch((err: any) =>
      console.error("Failed backend delete:", err)
    );
  }
};

// inside PlacedItemsProvider

const deleteItemUniversal = async (
  identifier: string,       // can be frontend id, backend itemId, or itemIdTemp
  backendDelete?: (id: string) => Promise<any>
) => {
  // Find the target item in placed
  const target = latestRef.current.find(
    (p) => p.id === identifier || p.itemId === identifier || p.itemIdTemp === identifier
  );

  if (!target) return;

  // 1️⃣ Remove from state
  setPlaced((prev) => prev.filter((p) => p.id !== target.id));

  // 2️⃣ Remove from localStorage
  try {
    const saved: PlacedItem[] = JSON.parse(localStorage.getItem("placedPositions") || "[]");
    const updated = saved.filter((p) => p.id !== target.id);
    localStorage.setItem("placedPositions", JSON.stringify(updated));
  } catch (err) {
    console.error("Failed localStorage cleanup:", err);
  }

  // 3️⃣ Remove from backend if logged in
  if (backendDelete && target.itemId) {
    try {
      await backendDelete(target.itemId);
    } catch (err) {
      console.error("Backend delete failed:", err);
    }
  }
};






const editItemSize = async (
  id: string,
  newSizeIndex: number,
  newSize: Size,
  dimensions: { width: number; height: number },
  backendEditSize?: any
) => {
  const item = latestRef.current.find((p) => p.id === id);
  if (!item) return;

  const { width, height } = calculateDimensions(newSize, dimensions.width);
  const scale = width / dimensions.width;

  setPlaced((prev) =>
    prev.map((p) =>
      p.id === id
        ? {
            ...p,
            sizeIndex: newSizeIndex,
            width,
            height,
            scale,
          }
        : p
    )
  );

  if (backendEditSize && item.itemId) {
    try {
      await backendEditSize(item.itemId, newSizeIndex);
    } catch (err) {
      console.error("Failed backend edit size:", err);
    }
  }
};

const mergeGuestItems = useCallback(
  (backendAdd: any, dimensions: { width: number; height: number }) => {
    const guestItems = latestRef.current.filter((p) => !p.itemId && p.itemIdTemp);
    if (!guestItems.length) return;

    guestItems.forEach(async (guest) => {
      try {
        const placement = {
          positionX: guest.positionX,
          positionY: guest.positionY,
          scale: guest.scale,
          rotation: guest.rotation ?? 0,
          zIndex: guest.zIndex ?? 0,
        };

        const updatedCart = await backendAdd(
          guest.productId,
          guest.sizeIndex,
          placement
        );
        if (!updatedCart) return;

        const matched = updatedCart.items.find(
          (i: CartItem) => i._id === guest.itemId || i._id === guest.itemIdTemp
        );

        if (matched) {
          setPlaced((prev) =>
            prev.map((p) =>
              p.id === guest.itemIdTemp
                ? {
                    ...p,
                    id: `${matched._id}-${p.sizeIndex}`,
                    itemId: matched._id,
                    itemIdTemp: undefined,
                  }
                : p
            )
          );
        }
      } catch (err) {
        console.error("Failed merge guest item:", guest, err);
      }
    });
  },
  []
);


  const moveItem = useCallback(
    (
      id: string,
      x: number,
      y: number,
      width: number,
      height: number,
      canvasWidth: number,
      canvasHeight: number,
      backendUpdate?: any
    ) => {
      setPlaced((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;

          const updated = {
            ...p,
            x,
            y,
            width,
            height,
          };

          if (p.itemId && backendUpdate) {
            if (!moveTimers.current[id]) {
              moveTimers.current[id] = debounce(async () => {
                try {
                  const centerX = (x + width / 2) / canvasWidth;
                  const centerY = (y + width / 2) / canvasHeight;

                  await backendUpdate(p.itemId!, {
                    positionX: centerX,
                    positionY: centerY,
                    scale: width / (p.width / p.scale), // keep using p.scale if you have it
                    rotation: p.rotation,
                    zIndex: p.zIndex,
                  });
                } catch (err) {
                  console.error("Failed backend move update:", err);
                }
              }, 300);
            }
            moveTimers.current[id]!();
          }

          return updated;
        })
      );
    },
    []
  );  

  const syncWithCart = useCallback(
    (
      cart: { items: CartItem[] } | undefined,
      dimensions: { width: number; height: number }
    ) => {
      if (!cart) return;

      const restored = cart.items.map((item) => {
        const size = item.product.sizes[item.sizeIndex];
        const { width: baseWidth, height: baseHeight } = calculateDimensions(
          size,
          dimensions.width
        );
        const scale = item.scale ?? 1;

        const posX = item.positionX ?? 0.5;
        const posY = item.positionY ?? 0.5;

        const w = baseWidth * scale;
        const h = baseHeight * scale;

        const x = posX * dimensions.width - w / 2;
        const y = posY * dimensions.height - h / 2;

        return {
          id: `${item._id}-${item.sizeIndex}`,
          itemId: item._id,
          src: getAssetUrl(item.product.imageUrl),
          x,
          y,
          width: w,
          height: h,
          productId: item.product._id,
          sizeIndex: item.sizeIndex,
          rotation: item.rotation ?? 0,
          zIndex: item.zIndex ?? 0,
          positionX: posX,
          positionY: posY,
          scale,
        };
      });

      setPlaced(restored);
    },
    []
  );


  const setProductsRef = (products: Product[]) => {
    productsRef.current = products;
  };
  const clearPlaced = () => {
    setPlaced([]);
    localStorage.removeItem("placedPositions"); // optional, also clear saved positions
  };

  const deleteItemByItemId = (itemId: string, backendDelete?: any) => {
  setPlaced(prev => prev.filter(p => p.itemId !== itemId));
  if (backendDelete) backendDelete(itemId);
};

  return (
    <PlacedItemsContext.Provider
      value={{
        placed,
        addItem,
        moveItem,
        deleteItem,
        editItemSize,
        syncWithCart,
        mergeGuestItems,
        setProductsRef,
        restoreFromLocalStorage,
        clearPlaced,
        deleteItemByItemId,
        deleteItemUniversal,
      }}
    >
      {children}
    </PlacedItemsContext.Provider>
  );
};

export const usePlacedItems = () => {
  const ctx = useContext(PlacedItemsContext);
  if (!ctx)
    throw new Error("usePlacedItems must be used within PlacedItemsProvider");
  return ctx;
};
