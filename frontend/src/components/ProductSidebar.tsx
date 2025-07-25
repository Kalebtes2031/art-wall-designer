// frontend/src/components/ProductSidebar.tsx
import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../utils/api";
import type { Product, Size } from "../types/Product";

export interface ProductSidebarProps {
  selectedProduct: Product | null;
  selectedSizeIndex: number;
  onSelect: (product: Product, size: Size, sizeIndex: number) => void;
  showSizeOptions: boolean;
  onAddToWall: (product: Product, size: Size, sizeIndex: number) => void;
  editingProductId?: string;
  editingSizeIndex?: number;
  onEditSize?: (productId: string, newSizeIndex: number) => void;
}

type SortKey = "new" | "popular" | "bestseller" | "price_asc" | "price_desc";

export default function ProductSidebar({
  selectedProduct,
  selectedSizeIndex,
  onSelect,
  showSizeOptions,
  onAddToWall,
  editingProductId,
  editingSizeIndex,
  onEditSize,
}: ProductSidebarProps) {
  // filter & sort state
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("new");
  const [openPanel, setOpenPanel] = useState<"sort" | "filter" | null>(null);
  const [filterCategory, setFilterCategory] = useState<
    "size" | "orientation" | "price" | "artist" | null
  >(null);
  const [sizeFilter, setSizeFilter] = useState("");
  const [orientation, setOrientation] = useState<"portrait" | "landscape" | "">(
    ""
  );
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [artist, setArtist] = useState("");

  // pagination + results
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(24);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // derive all sizes & artists for filtering UI
  const allSizes = useMemo(() => {
    const setS = new Set<string>();
    products.forEach((p) =>
      p.sizes.forEach((s) => setS.add(`${s.widthCm}x${s.heightCm}`))
    );
    return Array.from(setS);
  }, [products]);

  const allArtists = useMemo(() => {
    const setA = new Set<string>();
    products.forEach((p) => p.seller?.name && setA.add(p.seller.name));
    return Array.from(setA);
  }, [products]);

  const buildQS = () => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (sortBy !== "new") params.set("sortBy", sortBy);
    if (sizeFilter) params.set("size", sizeFilter);
    if (orientation) params.set("orientation", orientation);
    if (priceMin) params.set("minPrice", priceMin);
    if (priceMax) params.set("maxPrice", priceMax);
    if (artist) params.set("artist", artist);
    params.set("page", String(page));
    params.set("limit", String(limit));
    return params.toString();
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{
        products: Product[];
        totalCount: number;
      }>(`/products?${buildQS()}`);
      setProducts(data.products);
      setTotal(data.totalCount);
    } catch {
      // handle error if you like
    } finally {
      setLoading(false);
    }
  }, [
    q,
    sortBy,
    sizeFilter,
    orientation,
    priceMin,
    priceMax,
    artist,
    page,
    limit,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="flex flex-col h-full  shadow-lg rounded-xl overflow-hidden">
      {/* Header with search and controls */}
      <div className="px-4 pb-3 bg-gray-400 ">
        {/* <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search artworks…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
          />
        </div> */}

        <div className="flex space-x-2 mt-3">
          <button
            onClick={() => setOpenPanel(openPanel === "sort" ? null : "sort")}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center transition-all ${
              openPanel === "sort"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white border border-gray-200 hover:border-blue-300 text-gray-700 hover:shadow-sm"
            }`}
          >
            <span>Sort</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`ml-2 h-4 w-4 transition-transform ${
                openPanel === "sort" ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <button
            onClick={() =>
              setOpenPanel(openPanel === "filter" ? null : "filter")
            }
            className={`flex-1 py-2 rounded-lg flex items-center justify-center transition-all ${
              openPanel === "filter"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white border border-gray-200 hover:border-blue-300 text-gray-700 hover:shadow-sm"
            }`}
          >
            <span>Filters</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`ml-2 h-4 w-4 transition-transform ${
                openPanel === "filter" ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </button>
        </div>

        {/* Sort panel */}
        {openPanel === "sort" && (
          <div className="mt-3 bg-white border border-gray-200 rounded-xl shadow-md p-3 space-y-2">
            <h3 className="font-semibold text-gray-700 mb-1">Sort By</h3>
            <div className="space-y-1">
              {(
                [
                  ["new", "New arrivals"],
                  ["popular", "Most popular"],
                  ["bestseller", "All‑time bestsellers"],
                  ["price_asc", "Price: low → high"],
                  ["price_desc", "Price: high → low"],
                ] as [SortKey, string][]
              ).map(([key, label]) => (
                <div
                  key={key}
                  onClick={() => {
                    setSortBy(key);
                    setOpenPanel(null);
                    setPage(1);
                  }}
                  className={`p-2 rounded-lg cursor-pointer flex items-center transition-all ${
                    sortBy === key
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 mr-2 ${
                      sortBy === key ? "text-blue-500" : "opacity-0"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters panel */}
        {openPanel === "filter" && (
          <div className="mt-3 bg-white border border-gray-200 rounded-xl shadow-md p-3 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">Filters</h3>
              <button
                onClick={() => {
                  setSizeFilter("");
                  setOrientation("");
                  setPriceMin("");
                  setPriceMax("");
                  setArtist("");
                  setPage(1);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-4">
              {(["size", "orientation", "price", "artist"] as const).map(
                (cat) => (
                  <div
                    key={cat}
                    className="border-b border-gray-100 pb-3 last:border-0"
                  >
                    <div
                      onClick={() =>
                        setFilterCategory(filterCategory === cat ? null : cat)
                      }
                      className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <span className="font-medium text-gray-700 capitalize">
                        {cat}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          filterCategory === cat ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>

                    {filterCategory === cat && (
                      <div className="pl-1 mt-2 space-y-2">
                        {cat === "size" && (
                          <div className="grid grid-cols-2 gap-2">
                            {allSizes.map((sz) => (
                              <button
                                key={sz}
                                onClick={() => {
                                  setSizeFilter(sz === sizeFilter ? "" : sz);
                                  setPage(1);
                                }}
                                className={`p-2 rounded-lg text-sm transition-all ${
                                  sizeFilter === sz
                                    ? "bg-blue-600 text-white font-medium shadow-sm"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                }`}
                              >
                                {sz} cm
                              </button>
                            ))}
                          </div>
                        )}

                        {cat === "orientation" && (
                          <div className="grid grid-cols-2 gap-2">
                            {(["portrait", "landscape"] as const).map((o) => (
                              <button
                                key={o}
                                onClick={() => {
                                  setOrientation(orientation === o ? "" : o);
                                  setPage(1);
                                }}
                                className={`p-2 rounded-lg text-sm transition-all flex items-center justify-center ${
                                  orientation === o
                                    ? "bg-blue-600 text-white font-medium shadow-sm"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                }`}
                              >
                                {o.charAt(0).toUpperCase() + o.slice(1)}
                              </button>
                            ))}
                          </div>
                        )}

                        {cat === "price" && (
                          <div className="space-y-2">
                            <div className="flex space-x-2">
                              <div className="flex-1">
                                <label className="text-xs text-gray-500 block mb-1">
                                  Min Price
                                </label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    $
                                  </span>
                                  <input
                                    type="number"
                                    placeholder="0"
                                    value={priceMin}
                                    onChange={(e) => {
                                      setPriceMin(e.target.value);
                                      setPage(1);
                                    }}
                                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none"
                                  />
                                </div>
                              </div>
                              <div className="flex-1">
                                <label className="text-xs text-gray-500 block mb-1">
                                  Max Price
                                </label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    $
                                  </span>
                                  <input
                                    type="number"
                                    placeholder="Any"
                                    value={priceMax}
                                    onChange={(e) => {
                                      setPriceMax(e.target.value);
                                      setPage(1);
                                    }}
                                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {cat === "artist" && (
                          <div className="max-h-40 overflow-y-auto pr-1">
                            {allArtists.map((a) => (
                              <button
                                key={a}
                                onClick={() => {
                                  setArtist(artist === a ? "" : a);
                                  setPage(1);
                                }}
                                className={`w-full text-left p-2 rounded-lg text-sm transition-all flex items-center ${
                                  artist === a
                                    ? "bg-blue-100 text-blue-700 font-medium"
                                    : "hover:bg-gray-100 text-gray-700"
                                }`}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className={`h-4 w-4 mr-2 ${
                                    artist === a ? "text-blue-500" : "opacity-0"
                                  }`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                {a}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 pt-2 pr-2 bg-white scrollbar overflow-auto ">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-600">Loading artworks...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-700">
              No artworks found
            </h3>
            <p className="mt-1 text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap">
              {products.map((p) => {
                const isSelected = selectedProduct?._id === p._id;
                const size = p.sizes[0]; // or whichever “default” you want
                const isLandscape = size.widthCm > size.heightCm;
                const isPortrait = size.heightCm > size.widthCm;

                // pick a fixed inner box size
                const innerClasses = isLandscape
                  ? "w-48 h-32" // wide
                  : isPortrait
                  ? "w-32 h-48" // tall
                  : "w-40 h-40"; // square
                return (
                  <div
                    key={p._id}
                    onClick={() => onSelect(p, p.sizes[0], 0)}
                    className={`relative group flex flex-col justify-between  overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md bg-gradient-to-r from-gray-100 to-gray-400 ${
                      isSelected
                        ? "ring-1 ring-blue-500 ring-offse"
                        : "border border-gray-100 "
                    }`}
                  >
                    <div className="flex-1 flex items-center justify-center  p-2">
                      <div
                        className={`flex items-center justify-center  ${innerClasses}`}
                      >
                        <div className="p-2 border-[3px] border-[rgb(107,68,35)] bg-white roundg">

                        <img
                          src={p.transparentUrl || p.imageUrl}
                          alt={p.title}
                          className="object-contain w-full h-full"
                        />
                        </div>
                      </div>
                    </div>
                    <div className="p-2 ">
                      <div className="font-medium text-gray-800 truncate">
                        {p.title}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-blue-600">
                        ${p.price.toFixed(2)}
                      </div>

                      {/* size options */}
                      {showSizeOptions && isSelected && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {p.sizes.map((sz: Size, idx: number) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onEditSize && editingProductId === p._id) {
                                  onEditSize(p._id, idx);
                                } else {
                                  onSelect(p, p.sizes[0], idx);
                                }
                              }}
                              className={`px-2 py-1 text-xs rounded-full transition-all ${
                                selectedSizeIndex === idx
                                  ? "bg-blue-600 text-white font-medium shadow-sm"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {sz.widthCm}×{sz.heightCm} cm
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add to Wall overlay */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(p, p.sizes[0], 0);
                        onAddToWall(p, p.sizes[0], 0);
                      }}
                      className="absolute bottom-0 left-0 right-0 h-14 cursor-pointer flex items-center justify-center
                             bg-gray-600  bg-opacity-50 text-white font-semibold
                             opacity-0 group-hover:opacity-100 transition-opacity rounded-b"
                    >
                      <div className="flex  items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 mb-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <span>Add to Wall</span>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-medium">{(page - 1) * limit + 1}</span> -{" "}
              <span className="font-medium">
                {Math.min(page * limit, total)}
              </span>{" "}
              of <span className="font-medium">{total}</span> artworks
            </div>
            <div className="flex space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className={`px-4 py-2 rounded-lg flex items-center transition-all ${
                  page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-300"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Prev
              </button>
              <button
                disabled={page * limit >= total}
                onClick={() => setPage((p) => p + 1)}
                className={`px-4 py-2 rounded-lg flex items-center transition-all ${
                  page * limit >= total
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-300"
                }`}
              >
                Next
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
