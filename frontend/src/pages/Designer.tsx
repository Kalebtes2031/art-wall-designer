// pages/Designer.tsx
import { useState, useEffect } from "react";
import ProductSidebar from "../components/ProductSidebar";
import type { Product, Size } from "../types/Product";
import WallUploader from "../components/WallUploader";
import CanvasArea from "../components/CanvasArea";
import CartFooter from "../components/CartFooter";
import { useCart } from "../context/CartContext";
import SizeModal from "../components/SizeModal";

export default function Designer() {
  const [wallUrl, setWallUrl] = useState("/wall.jpg");
  const [placed, setPlaced] = useState<
    {
      id: string;
      src: string;
      x: number;
      y: number;
      width: number;
      height: number;
      productId: string;
      sizeIndex: number;
    }[]
  >([]);

  // currently selected product + size
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentSizeIndex, setCurrentSizeIndex] = useState<number>(0);
  const [uploadWall, setUploadWall] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(
    null
  );
  const [showSizeModal, setShowSizeModal] = useState(false);

  const selectedArtwork = placed.find((p) => p.id === selectedArtworkId);
  // canvas dimensions
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const updateDims = () =>
      setDimensions({
        width: window.innerWidth - 360,
        height: window.innerHeight - 40,
      });
    updateDims();
    window.addEventListener("resize", updateDims);
    return () => window.removeEventListener("resize", updateDims);
  }, []);

  // cart context
  const { cart, addToCart, refreshCart, decrementCartItem } = useCart();

  // derive placed items from cart
useEffect(() => {
  if (!cart) return;
  const CM_TO_PX = dimensions.width / 500;

  setPlaced(prev => {
    const existing = new Set(prev.map(p => p.id));
    const additions: typeof placed = [];

    cart.items.forEach(({ product, quantity, sizeIndex }) => {
      const size = product.sizes[sizeIndex];
      const pxW = size.widthCm * CM_TO_PX,
            pxH = size.heightCm * CM_TO_PX;

      for (let i = 0; i < quantity; i++) {
        const id = `${product._id}-${sizeIndex}-${i}`;
        if (!existing.has(id)) {
          additions.push({
            id, src: product.imageUrl,
            x: dimensions.width/2 - pxW/2,
            y: dimensions.height/2 - pxH/2,
            width: pxW, height: pxH,
            productId: product._id,
            sizeIndex,
          });
        }
      }
    });

    const merged = [...prev, ...additions];
    localStorage.setItem("placedPositions", JSON.stringify(merged));
    return merged;
  });
}, [cart, dimensions]);

const handleMove = (id: string, x: number, y: number) => {
  setPlaced(prev => {
    const updated = prev.map(p => (p.id === id ? { ...p, x, y } : p));
    localStorage.setItem("placedPositions", JSON.stringify(updated));
    return updated;
  });
};

useEffect(() => {
  const saved = localStorage.getItem("placedPositions");
  if (saved) {
    try {
      setPlaced(JSON.parse(saved));
    } catch {}
  }
}, []); // empty deps: run once


  // when sidebar selects a product+size
  const handleSidebarSelect = (p: Product, s: Size, idx: number) => {
    setCurrentProduct(p);
    setCurrentSizeIndex(idx);
  };

  // add one to cart
  const handleAddToWall = async () => {
    console.log("🔔 handleAddToWall fired, currentProduct:", currentProduct, "sizeIndex:", currentSizeIndex);
  if (!currentProduct) return;
    try {
      await addToCart(currentProduct._id, 1, currentSizeIndex);
      await refreshCart();
      // rebuildPlacedFromCart(cart) called in useEffect watching cart, so no need here
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  // delete from placed
  const handleDelete = async (placedId: string) => {
    if (!cart) return;

    const parts = placedId.split("-");
    const productId = parts[0];
    const sizeIndex = Number(parts[1]);

    try {
      await decrementCartItem(productId, sizeIndex);
      await refreshCart();
      setPlaced((prev) => prev.filter((p) => p.id !== placedId));
    } catch (err) {
      console.error("Error removing item from cart:", err);
    }
  };

  const CM_TO_PX = dimensions.width / 500;

  return (
    <>
      <div className="flex w-full h-[660px] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {/* Sidebar */}
        <div className="w-[360px] bg-red-500 shadow-xl rounded-r-2xl p-2 flex flex-col space-y-2 z-10">
          <div
            onClick={() => setUploadWall((prev) => !prev)} // toggle on click
            className="flex justify-center items-center border-b rounded-lg p-2 bg-gradient-to-r from-blue-200 to-gray-500 scrollbar-thin"
          >
            <h2
              style={{
                cursor: "pointer",
                color: uploadWall ? "blue" : "black",
              }}
            >
              Upload Wall {uploadWall ? "▲" : "▼"}
            </h2>
          </div>
          {uploadWall && <WallUploader onUpload={setWallUrl} />}
          <div className="flex-1 overflow-y-auto flex flex-col py-6  bg-gradient-to-r from-blue-200 to-gray-500 rounded-lg">
            <div className="flex items-center justify-between mb-3 px-3">
              <h2 className="text-lg font-semibold text-gray-700">
                Art Collection
              </h2>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {cart?.items.reduce((s, i) => s + i.quantity, 0) || 0} placed
              </span>
            </div>
            <ProductSidebar
              selectedProduct={currentProduct}
              selectedSizeIndex={
                selectedArtwork ? selectedArtwork.sizeIndex : currentSizeIndex
              }
              onSelect={handleSidebarSelect}
              editingProductId={
                editingId
                  ? placed.find((p) => p.id === editingId)?.productId
                  : undefined
              }
              editingSizeIndex={
                editingId
                  ? placed.find((p) => p.id === editingId)?.sizeIndex
                  : undefined
              }
              onEditSize={(productId, newSizeIndex) => {
                setPlaced((prev) =>
                  prev.map((p) =>
                    p.id === editingId
                      ? {
                          ...p,
                          width:
                            currentProduct!.sizes[newSizeIndex].widthCm * 5,
                          height:
                            currentProduct!.sizes[newSizeIndex].heightCm * 5,
                          sizeIndex: newSizeIndex,
                        }
                      : p
                  )
                );
              }}
              showSizeOptions={!!selectedArtwork}
            />
            {showSizeModal && currentProduct && (
              <SizeModal
                product={currentProduct}
                selectedIndex={currentSizeIndex}
                editingProductId={
                  placed.find((p) => p.id === editingId)?.productId
                }
                editingSizeIndex={
                  placed.find((p) => p.id === editingId)?.sizeIndex
                }
                onClose={() => {
                  setShowSizeModal(false);
                  setEditingId(null); // optional: clear selected
                }}
                onEditSize={(productId, newSizeIndex) => {
                  // lookup the chosen size
                  const newSize = currentProduct.sizes[newSizeIndex];
                  // compute in px using the same CM_TO_PX
                  const newPxW = newSize.widthCm * CM_TO_PX;
                  const newPxH = newSize.heightCm * CM_TO_PX;

                  setPlaced((prev) =>
                    prev.map((p) =>
                      p.id === editingId
                        ? {
                            ...p,
                            width: newPxW,
                            height: newPxH,
                            sizeIndex: newSizeIndex,
                          }
                        : p
                    )
                  );
                }}
              />
            )}
          </div>
          <button
            onClick={handleAddToWall}
            disabled={!currentProduct}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add to Wall
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-red-700">
          <CanvasArea
          onMove={handleMove}
            wallUrl={wallUrl}
            artworks={placed}
            width={dimensions.width}
            height={dimensions.height}
            onEditSize={(id) => {
              const selected = placed.find((p) => p.id === id);
              if (!selected) return;

              setEditingId(id);
              setCurrentProduct(
                cart?.items.find(
                  (item) => item.product._id === selected.productId
                )?.product || null
              );
              setCurrentSizeIndex(selected.sizeIndex);
              setShowSizeModal(true);
            }}
            onDelete={handleDelete} // <-- add this line
            onSelectArtwork={(id) => {
              if (!id) {
                // clicking empty wall → deselect + close
                setSelectedArtworkId(null);
                return;
              }
              // exactly the same logic as onEditSize!
              const sel = placed.find((p) => p.id === id);
              if (!sel) return;
              setSelectedArtworkId(id);
              setEditingId(id);
              setCurrentProduct(
                cart?.items.find((i) => i.product._id === sel.productId)
                  ?.product || null
              );
              setCurrentSizeIndex(sel.sizeIndex);
              setShowSizeModal(true);
            }}
          />
        </div>
      </div>

      <CartFooter />
    </>
  );
}
