// pages/Designer.tsx
import { useState, useEffect } from "react";
import ProductSidebar from "../components/ProductSidebar";
import type { Product, Size } from "../types/Product";
import WallUploader from "../components/WallUploader";
import CanvasArea from "../components/CanvasArea";
import CartFooter from "../components/CartFooter";
import { useCart } from "../context/CartContext";
import SizeModal from "../components/SizeModal";
import { getAssetUrl } from "../utils/getAssetUrl";
import { useAuth } from "../context/AuthContext";

interface PlacedItem {
  id: string; // UI key
  itemId: string; // backend CartItem _id
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  productId: string;
  sizeIndex: number;
}

export default function Designer() {
  const [wallUrl, setWallUrl] = useState("/wall2.jpeg");
  const [placed, setPlaced] = useState<PlacedItem[]>(() => {
    const saved = localStorage.getItem("placedPositions");
    return saved ? JSON.parse(saved) : [];
  });

  const { token, user } = useAuth();
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentSizeIndex, setCurrentSizeIndex] = useState<number>(0);
  const [uploadWall, setUploadWall] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const { cart, addToCart, removeFromCart, changeItemSize } = useCart();
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  const selectedArtwork = placed.find((p) => p.id === editingId) || null;

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth - 420,
    height: window.innerHeight - 122,
  });
  useEffect(() => {
    const updateDims = () =>
      setDimensions({
        width: window.innerWidth - 420,
        height: window.innerHeight - 122,
      });
    window.addEventListener("resize", updateDims);
    return () => window.removeEventListener("resize", updateDims);
  }, []);

  useEffect(() => {
    if (!cart) return;

    setPlaced((prev) => {
      const cartItemIds = cart.items.map((item) => item._id);
      const filtered = prev.filter((p) => cartItemIds.includes(p.itemId));
      if (filtered.length !== prev.length) {
        localStorage.setItem("placedPositions", JSON.stringify(filtered));
      }
      return filtered;
    });
  }, [cart]);

  useEffect(() => {
  if (!token || !user || !placed.length) return;

  const guestItems = placed.filter((p) => !p.itemId);
  if (!guestItems.length) return;

  const mergeGuestItems = async () => {
    const mergedPlaced = [...placed];
    for (const item of guestItems) {
      try {
        const updatedCart = await addToCart(item.productId, item.sizeIndex);
        if (!updatedCart) {
          console.warn("Cart update failed for guest item:", item);
          continue;
        }

        const newCartItem = updatedCart.items.find(
          (i) => i.product._id === item.productId && i.sizeIndex === item.sizeIndex
        );
        if (newCartItem) {
          const idx = mergedPlaced.findIndex((p) => p.id === item.id);
          if (idx !== -1) mergedPlaced[idx].itemId = newCartItem._id;
        }
      } catch (err) {
        console.error("Failed to merge guest item:", item, err);
      }
    }

    setPlaced(mergedPlaced);
    localStorage.setItem("placedPositions", JSON.stringify(mergedPlaced));
  };

  mergeGuestItems();
}, [token, user, placed, addToCart]);


  const handleMove = (id: string, x: number, y: number, width: number, height: number) => {
  setPlaced((prev) => {
    const updated = prev.map((p) => {
      if (p.id !== id) return p;

      // Limit boundaries
      const minX = 0; // left side of the canvas
      const maxX = dimensions.width - width; // right boundary
      const minY = 0; // top boundary
      const maxY = dimensions.height - height; // bottom boundary

      return {
        ...p,
        x: Math.max(minX, Math.min(x, maxX)),
        y: Math.max(minY, Math.min(y, maxY)),
      };
    });

    localStorage.setItem("placedPositions", JSON.stringify(updated));
    return updated;
  });
};


  const handleSidebarSelect = (p: Product, s: Size, idx: number) => {
    setCurrentProduct(p);
    setCurrentSizeIndex(idx);
  };

  // Add a new artwork both locally and in cart
  const handleAddToWall = async (
    product: Product,
    size: Size,
    sizeIndex: number
  ) => {
    console.log("🟡 Adding to wall…", product.title, sizeIndex);

    let matched: any = null;

    // ✅ If logged in → call backend addToCart
    if (token && user) {
      const updatedCart = await addToCart(product._id, sizeIndex);
      if (!updatedCart) {
        console.error("❌ Failed to add to cart.");
        return;
      }

      matched = updatedCart.items.find(
        (i) => i.product._id === product._id && i.sizeIndex === sizeIndex
      );
      if (!matched) {
        console.error("❌ New cart item not found");
        return;
      }
    }

    // ✅ convert cm → px
    const CM_TO_PX = dimensions.width / 500;
    const pxW = size.widthCm * CM_TO_PX;
    const pxH = size.heightCm * CM_TO_PX;
    const newId = `${product._id}-${sizeIndex}-${Date.now()}`;

    const newItem: PlacedItem = {
      id: newId,
      itemId: matched ? matched._id : null, // only backend has itemId
      src: getAssetUrl(product.imageUrl),
      x: dimensions.width / 2 - pxW / 2,
      y: dimensions.height / 2 - pxH / 2,
      width: pxW,
      height: pxH,
      productId: product._id,
      sizeIndex,
    };

    setPlaced((prev) => {
      const updated = [...prev, newItem];
      localStorage.setItem("placedPositions", JSON.stringify(updated));
      console.log("💾 Saved to localStorage:", updated);
      return updated;
    });
  };

  // Delete one artwork by its itemId
  const handleDelete = async (canvasId: string) => {
    const toDelete = placed.find((p) => p.id === canvasId);
    if (!toDelete) return;

    // 1) Always remove locally (guest or logged in)
    setPlaced((prev) => {
      const updated = prev.filter((p) => p.id !== canvasId);
      localStorage.setItem("placedPositions", JSON.stringify(updated));
      return updated;
    });

    // 2) If logged in → also sync with backend cart
    if (token && user && toDelete.itemId) {
      try {
        await removeFromCart(toDelete.itemId);
      } catch (err) {
        console.error("❌ Failed to remove from backend cart:", err);
      }
    }
    setShowSizeModal(false);
              setEditingId(null);
  };

  return (
    <div className=" h-screen flex flex-col bg-[#D7D7D7] w-full  justify-between pt-[65px]">
      <div className="flex flex-1 w-full    overflow-hidden">
        {/* Sidebar */}
        <div className="w-[420px] shadow-xl flex flex-col space-y-2 z-10">
          {/* <div
            onClick={() => setUploadWall((prev) => !prev)}
            className="flex justify-center items-center border-b rounded-lg p-2 cursor-pointer bg-gradient-to-r from-blue-200 to-gray-500 scrollbar-thin"
          >
            <h2
              style={{
                cursor: "pointer",
                color: uploadWall ? "blue" : "black",
              }}
            >
              Upload Wall {uploadWall ? "▲" : "▼"}
            </h2>
          </div> */}
          {uploadWall && <WallUploader onUpload={setWallUrl} />}
          <div className="flex-1 overflow-y-auto flex flex-col ">
            {/* <div className="flex items-center justify-between mb-3 px-3">
              <h2 className="text-lg font-semibold text-gray-700">
                Art Collection
              </h2>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {cart?.items.length || 0} placed
              </span>
            </div> */}
            <ProductSidebar
              selectedProduct={currentProduct}
              selectedSizeIndex={selectedArtwork?.sizeIndex ?? currentSizeIndex}
              onSelect={handleSidebarSelect}
              showSizeOptions={!!selectedArtwork}
              onAddToWall={handleAddToWall}
              onProductsLoaded={(products) => setAvailableProducts(products)}
            />

            {/* <button
              onClick={handleAddToWall}
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg"
            >
              Add to Wall
            </button> */}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden">
          <CanvasArea
            wallUrl={wallUrl}
            artworks={placed}
            width={dimensions.width}
            height={dimensions.height}
            onMove={handleMove}
            onDelete={handleDelete}
            onEditSize={(canvasId) => {
              const sel = placed.find((p) => p.id === canvasId);
              if (!sel) return;
              setEditingId(canvasId);
              if (token && user) {
                // logged in → fetch product from backend cart
                setCurrentProduct(
                  cart?.items.find((i) => i._id === sel.itemId)?.product || null
                );
              } else {
                // guest → lookup product from available products
                setCurrentProduct(
                  availableProducts.find((p) => p._id === sel.productId) || null
                );
              }
              setCurrentSizeIndex(sel.sizeIndex);
              setShowSizeModal(true);
            }}
            onDeselectAll={() => {
              setShowSizeModal(false);
              setEditingId(null);
            }}
          />
        </div>
      </div>

      {showSizeModal && currentProduct && editingId && (
  <SizeModal
    product={currentProduct}
    selectedIndex={currentSizeIndex}
    editingProductId={placed.find((p) => p.id === editingId)?.productId}
    editingSizeIndex={placed.find((p) => p.id === editingId)?.sizeIndex}
    onClose={() => {
      setShowSizeModal(false);
      setEditingId(null);
    }}
    onEditSize={async (_prodId, newSizeIndex) => {
      const idx = Number(newSizeIndex); // <- cast to number
      const sel = placed.find((p) => p.id === editingId);
      if (!sel) return;

      // backend update only if logged in
      if (token && user && sel.itemId) {
        try {
          await changeItemSize(sel.itemId, idx);
        } catch (err) {
          console.error("Failed to update size in backend:", err);
        }
      }

      // local canvas update (guest or logged-in)
      const updatedPlaced = placed.map((p) =>
        p.id === editingId
          ? {
              ...p,
              sizeIndex: idx,
              width: currentProduct.sizes[idx].widthCm * (dimensions.width / 500),
              height: currentProduct.sizes[idx].heightCm * (dimensions.width / 500),
            }
          : p
      );

      setPlaced(updatedPlaced);
      localStorage.setItem("placedPositions", JSON.stringify(updatedPlaced));

      // setShowSizeModal(false);
      // setEditingId(null);
    }}
  />
)}


      <CartFooter />
    </div>
  );
}
