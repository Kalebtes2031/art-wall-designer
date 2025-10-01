//src/pages/Designer.tsx
import { useState, useEffect, useRef } from "react";
import ProductSidebar from "../components/ProductSidebar";
import type { Product, Size } from "../types/Product";
import WallUploader from "../components/WallUploader";
import CanvasArea from "../components/CanvasArea";
import CartFooter from "../components/CartFooter";
import SizeModal from "../components/SizeModal";
import { getAssetUrl } from "../utils/getAssetUrl";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  usePlacedItems,
  PlacedItemsProvider,
} from "../context/PlacedItemsProvider";

export default function DesignerPage() {
  return (
    <PlacedItemsProvider>
      <Designer />
    </PlacedItemsProvider>
  );
}

// --- Internal Designer (wrapped by provider) ---
function Designer() {
  const { token, user } = useAuth();
  const { cart, addToCart, removeFromCart, changeItemSize, updateItemPlacement } = useCart();
  const {
    placed,
    addItem,
    moveItem,
    deleteItem,
    editItemSize,
    syncWithCart,
    mergeGuestItems,
    deleteItemUniversal,
  } = usePlacedItems();

  const [wallUrl, setWallUrl] = useState("/wall2.jpeg");
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentSizeIndex, setCurrentSizeIndex] = useState<number>(0);
  const [uploadWall, setUploadWall] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [mergedGuest, setMergedGuest] = useState(false);

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth - 420,
    height: window.innerHeight - 122,
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  // --- Update dimensions on resize ---
  useEffect(() => {
    const updateDims = () =>
      setDimensions({
        width: window.innerWidth - 420,
        height: window.innerHeight - 122,
      });
    window.addEventListener("resize", updateDims);
    return () => window.removeEventListener("resize", updateDims);
  }, []);

  // --- Sync backend cart when user logs in ---

  const [canvasReady, setCanvasReady] = useState(false);

  // detect canvas render
  useEffect(() => {
    const checkCanvas = () => {
      if (!canvasRef.current) return false;
      return (
        canvasRef.current.clientWidth > 0 && canvasRef.current.clientHeight > 0
      );
    };

    if (checkCanvas()) {
      setCanvasReady(true);
    } else {
      const timer = setInterval(() => {
        if (checkCanvas()) {
          setCanvasReady(true);
          clearInterval(timer);
        }
      }, 50);

      return () => clearInterval(timer);
    }
  }, []);

  useEffect(() => {
    if (!token || !user || mergedGuest || !canvasReady || !cart) return;

    const { clientWidth: width, clientHeight: height } = canvasRef.current!;
    if (width <= 0 || height <= 0) return;

    // sync backend cart to canvas
    syncWithCart(cart, { width, height });

    // merge guest items if any
    mergeGuestItems(addToCart, { width, height });

    setMergedGuest(true);
  }, [
    token,
    user,
    cart,
    mergedGuest,
    syncWithCart,
    mergeGuestItems,
    addToCart,
    canvasReady,
  ]);

  const selectedArtwork = placed.find((p) => p.id === editingId) || null;

  // --- Handle sidebar selection ---
  const handleSidebarSelect = (
    product: Product,
    size: Size,
    sizeIndex: number
  ) => {
    setCurrentProduct(product);
    setCurrentSizeIndex(sizeIndex);
  };

  // --- Add new item to wall ---
  const handleAddToWall = async (
    product: Product,
    size: Size,
    sizeIndex: number
  ) => {
    const newItem = {
      src: getAssetUrl(product.imageUrl),
      productId: product._id,
      sizeIndex,
      width: size.widthCm * (dimensions.width / 500),
      height: size.heightCm * (dimensions.width / 500),
    };
    await addItem(newItem, dimensions, token ? addToCart : undefined);
  };

  // --- Handle size edit ---
  const handleEditSize = async (_prodId: string, newSizeIndex: number) => {
    if (!editingId || !currentProduct) return;

    await editItemSize(
      editingId,
      newSizeIndex,
      currentProduct.sizes[newSizeIndex],
      dimensions,
      token ? changeItemSize : undefined
    );
    setCurrentSizeIndex(newSizeIndex);
  };

  return (
    <div className="h-screen flex flex-col bg-[#D7D7D7] w-full justify-between pt-[65px]">
      <div className="flex flex-1 w-full overflow-hidden">
        {/* Sidebar */}
        <div className="w-[420px] shadow-xl flex flex-col space-y-2 z-10">
          {uploadWall && <WallUploader onUpload={setWallUrl} />}
          <div className="flex-1 overflow-y-auto flex flex-col">
            <ProductSidebar
              selectedProduct={currentProduct}
              selectedSizeIndex={selectedArtwork?.sizeIndex ?? currentSizeIndex}
              onSelect={handleSidebarSelect}
              showSizeOptions={!!selectedArtwork}
              onAddToWall={handleAddToWall}
              onProductsLoaded={setAvailableProducts}
            />
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden" ref={canvasRef}>
          <CanvasArea
            wallUrl={wallUrl}
            artworks={placed}
            width={dimensions.width}
            height={dimensions.height}
            onMove={(id, x, y, w, h) =>
              moveItem(
                id,
                x,
                y,
                w,
                h,
                dimensions.width,
                dimensions.height,
                token ? updateItemPlacement : undefined
              )
            }
             onDelete={async (id) => {
    // id here is always frontend id
    await deleteItemUniversal(id, token ? removeFromCart : undefined);
    setShowSizeModal(false);
    setEditingId(null);
  }}
            onEditSize={(id) => {
              setEditingId(id);
              setShowSizeModal(true);
              const sel = placed.find((p) => p.id === id);
              if (sel) {
                if (token && user) {
                  setCurrentProduct(
                    cart?.items.find((i) => i._id === sel.itemId)?.product ||
                      null
                  );
                } else {
                  setCurrentProduct(
                    availableProducts.find((p) => p._id === sel.productId) ||
                      null
                  );
                }
                setCurrentSizeIndex(sel.sizeIndex);
              }
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
          onEditSize={handleEditSize}
        />
      )}

      <CartFooter />
    </div>
  );
}
