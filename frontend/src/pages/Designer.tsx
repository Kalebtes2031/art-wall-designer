// pages/Designer.tsx
import { useState, useEffect } from "react";
import ProductSidebar from "../components/ProductSidebar";
import type { Product } from "../components/ProductSidebar";
import WallUploader from "../components/WallUploader";
import CanvasArea from "../components/CanvasArea";
import { v4 as uuidv4 } from "uuid";
import { useCartApi } from "../hooks/useCartApi";
import CartFooter from "../components/CartFooter";

export default function Designer() {
  const [wallUrl, setWallUrl] = useState("");
  const [placed, setPlaced] = useState<
    {
      id: string;
      src: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }[]
  >([]);

  const [current, setCurrent] = useState<Product | null>(null);
  const [uploadWall, setUploadWall] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const { addItem } = useCartApi();

  // Get available canvas dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth - 320,
        height: window.innerHeight - 40,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const addArt = async () => {
    if (current) {
      try {
        await addItem(current._id, 1);
      } catch (err) {
        console.error("Failed to add to cart:", err);
      }
      const defaultWidth = 200;
      const defaultHeight = 200;
      setPlaced((prev) => [
        ...prev,
        {
          id: uuidv4(),
          src: current.transparentUrl || current.imageUrl,
          x: dimensions.width / 2 - defaultWidth / 2,
          y: dimensions.height / 2 - defaultHeight / 2,
          width: defaultWidth,
          height: defaultHeight,
        },
      ]);
    }
  };

  return (
    <>
      <div className="flex h-[580px] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-xl rounded-r-2xl px-2 flex flex-col space-y-2 z-10">
          {/* <div className="flex items-center justify-between border-b pb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ArtWall Designer
          </h1>
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
        </div> */}
          <div className="flex justify-center items-center border-b rounded-lg p-2 bg-gradient-to-r from-blue-200 to-gray-500 scrollbar-thin">
            <h2
              onClick={() => setUploadWall((prev) => !prev)} // toggle on click
              style={{
                cursor: "pointer",
                color: uploadWall ? "blue" : "black",
              }} // optional visual cue
            >
              Upload Wall {uploadWall ? "▲" : "▼"} {/* toggle indicator */}
            </h2>
          </div>
          {uploadWall && <WallUploader onUpload={setWallUrl} />}

          <div className="flex-1 overflow-y-auto flex flex-col py-6  bg-gradient-to-r from-blue-200 to-gray-500 rounded-lg">
            <div className="flex items-center justify-between mb-3 px-3">
              <h2 className="text-lg font-semibold text-gray-700">
                Art Collection
              </h2>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {placed.length} placed
              </span>
            </div>
            <ProductSidebar onSelect={setCurrent} />
          </div>

          <button
            onClick={addArt}
            disabled={!current}
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

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 p-4">
          {wallUrl ? (
            <CanvasArea
              wallUrl={wallUrl}
              artworks={placed}
              width={dimensions.width}
              height={dimensions.height}
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center max-w-md">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 mb-2">
                  Upload Your Wall
                </h2>
                <p className="text-gray-500 mb-6">
                  Start by uploading a photo of your wall. Then browse our art
                  collection and drag pieces onto your wall to visualize them.
                </p>
                <div className="animate-bounce inline-block">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <CartFooter />
    </>
  );
}
