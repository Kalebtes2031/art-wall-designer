// pages/Designer.tsx
import { useState, useEffect } from "react";
import ProductSidebar from "../components/ProductSidebar";
import type { Product, Size } from "../types/Product";
import WallUploader from "../components/WallUploader";
import CanvasArea from "../components/CanvasArea";
import CartFooter from "../components/CartFooter";
import { useCart } from "../context/CartContext";
import SizeModal from "../components/SizeModal";
import type { Cart } from "../types/Cart";

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
  const [wallUrl, setWallUrl] = useState("/wall.jpg");
  const [placed, setPlaced] = useState<PlacedItem[]>(() => {
    const saved = localStorage.getItem("placedPositions");
    return saved ? JSON.parse(saved) : [];
  });

  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentSizeIndex, setCurrentSizeIndex] = useState<number>(0);
  const [uploadWall, setUploadWall] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const { cart, addToCart, removeFromCart, changeItemSize } = useCart();

  const selectedArtwork = placed.find((p) => p.id === editingId) || null;

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth - 420,
    height: window.innerHeight - 40,
  });
  useEffect(() => {
    const updateDims = () =>
      setDimensions({
        width: window.innerWidth - 420,
        height: window.innerHeight - 40,
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

  const handleMove = (id: string, x: number, y: number) => {
    setPlaced((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, x, y } : p));
      localStorage.setItem("placedPositions", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSidebarSelect = (p: Product, s: Size, idx: number) => {
    setCurrentProduct(p);
    setCurrentSizeIndex(idx);
  };

  // Add a new artwork both locally and in cart
  const handleAddToWall = async () => {
    if (!currentProduct) {
      console.log("❌ No product selected.");
      return;
    }

    console.log("🟡 Adding to cart...");
    const updatedCart = await addToCart(currentProduct._id, currentSizeIndex);

    if (!updatedCart) {
      console.error("❌ Failed to add to cart.");
      return;
    }

    console.log("✅ Cart updated");

    const matchedCartItem = updatedCart.items.find(
      (item) =>
        item.product._id === currentProduct._id &&
        item.sizeIndex === currentSizeIndex
    );

    if (!matchedCartItem) {
      console.error("❌ New cart item not found");
      return;
    }

    console.log("🟢 Found cart item:", matchedCartItem);

    const itemId = matchedCartItem._id;

    const CM_TO_PX = dimensions.width / 500;
    const size = currentProduct.sizes[currentSizeIndex];
    const pxW = size.widthCm * CM_TO_PX;
    const pxH = size.heightCm * CM_TO_PX;
    const newId = `${currentProduct._id}-${currentSizeIndex}-${Date.now()}`;

    const newItem: PlacedItem = {
      id: newId,
      itemId,
      src: currentProduct.imageUrl,
      x: dimensions.width / 2 - pxW / 2,
      y: dimensions.height / 2 - pxH / 2,
      width: pxW,
      height: pxH,
      productId: currentProduct._id,
      sizeIndex: currentSizeIndex,
    };

    console.log("🧱 New placed item:", newItem);

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
    // 1) remove locally
    setPlaced((prev) => {
      const updated = prev.filter((p) => p.id !== canvasId);
      localStorage.setItem("placedPositions", JSON.stringify(updated));
      return updated;
    });
    // 2) remove from cart
    await removeFromCart(toDelete.itemId);
  };

  return (
    <>
      <div className="flex w-full h-[600px] bg-white overflow-hidden">
        {/* Sidebar */}
        <div className="w-[420px] shadow-xl rounded-r-2xl px-2 flex flex-col space-y-2 z-10">
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
          <div className="flex-1 overflow-y-auto flex flex-col py-6 bg-gradient-to-r from-blue-200 to-gray-500 rounded-lg">
            <div className="flex items-center justify-between mb-3 px-3">
              <h2 className="text-lg font-semibold text-gray-700">
                Art Collection
              </h2>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {cart?.items.length || 0} placed
              </span>
            </div>
            <ProductSidebar
              selectedProduct={currentProduct}
              selectedSizeIndex={selectedArtwork?.sizeIndex ?? currentSizeIndex}
              onSelect={handleSidebarSelect}
              showSizeOptions={!!selectedArtwork}
              onAddToWall={handleAddToWall}
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
        <div className="flex-1 bg-red-700">
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
              setCurrentProduct(
                // fetch product details via cart or last selection
                cart?.items.find((i) => i._id === sel.itemId)?.product || null
              );
              setCurrentSizeIndex(sel.sizeIndex);
              setShowSizeModal(true);
            }}
            onDeselectAll={() => {
              setShowSizeModal(false)
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
            const sel = placed.find((p) => p.id === editingId);
            if (!sel) return;
            // backend update
            await changeItemSize(sel.itemId, newSizeIndex);
            // local canvas update
            const updatedPlaced = placed.map((p) =>
              p.id === editingId
                ? {
                    ...p,
                    sizeIndex: newSizeIndex,
                    width:
                      currentProduct.sizes[newSizeIndex].widthCm *
                      (dimensions.width / 500),
                    height:
                      currentProduct.sizes[newSizeIndex].heightCm *
                      (dimensions.width / 500),
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
    </>
  );
}
