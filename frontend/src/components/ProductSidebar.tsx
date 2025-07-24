// frontend/src/components/ProductSidebar.tsx
import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../utils/api";
import type { Product, Size } from "../types/Product";

export interface ProductSidebarProps {
  selectedProduct: Product | null;
  selectedSizeIndex: number;
  onSelect: (product: Product, size: Size, sizeIndex: number) => void;
  showSizeOptions: boolean;
  onAddToWall: () => void;
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
    <div className="flex flex-col h-full p-4">
      {/* Search + controls */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Search artworks…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          className="w-full p-2 border rounded"
        />

        <div className="flex space-x-2">
          <button
            onClick={() => setOpenPanel(openPanel === "sort" ? null : "sort")}
            className="flex-1 p-2 bg-white border rounded flex justify-between"
          >
            Sort By{" "}
            <span className="ml-1">{openPanel === "sort" ? "▲" : "▼"}</span>
          </button>
          <button
            onClick={() =>
              setOpenPanel(openPanel === "filter" ? null : "filter")
            }
            className="flex-1 p-2 bg-white border rounded flex justify-between"
          >
            Filters{" "}
            <span className="ml-1">{openPanel === "filter" ? "▲" : "▼"}</span>
          </button>
        </div>

        {/* Sort panel */}
        {openPanel === "sort" && (
          <div className="bg-white border rounded p-3 space-y-2">
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
                  className={`p-2 rounded cursor-pointer ${
                    sortBy === key
                      ? "bg-blue-100 font-semibold"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters panel */}
        {openPanel === "filter" && (
          <div className="bg-white border rounded p-3 space-y-2">
            {(["size", "orientation", "price", "artist"] as const).map(
              (cat) => (
                <div key={cat}>
                  <div
                    onClick={() =>
                      setFilterCategory(filterCategory === cat ? null : cat)
                    }
                    className="flex justify-between items-center p-2 rounded hover:bg-gray-100 cursor-pointer"
                  >
                    <span className="capitalize">{cat}</span>
                    <span>{filterCategory === cat ? "–" : "+"}</span>
                  </div>

                  {filterCategory === cat && (
                    <div className="pl-4 mt-2 space-y-2">
                      {cat === "size" &&
                        allSizes.map((sz) => (
                          <div
                            key={sz}
                            onClick={() => {
                              setSizeFilter(sz);
                              setPage(1);
                            }}
                            className={`p-1 rounded cursor-pointer ${
                              sizeFilter === sz
                                ? "bg-blue-100 font-semibold"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            {sz} cm
                          </div>
                        ))}

                      {/* … */}
                      {cat === "orientation" &&
                        (["portrait", "landscape"] as const).map((o) => (
                          <div
                            key={o}
                            onClick={() => {
                              setOrientation(o); // now o: "portrait" | "landscape"
                              setPage(1);
                            }}
                            className={`p-1 rounded cursor-pointer ${
                              orientation === o
                                ? "bg-blue-100 font-semibold"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            {o}
                          </div>
                        ))}
                      {/* … */}

                      {cat === "price" && (
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            placeholder="Min $"
                            value={priceMin}
                            onChange={(e) => {
                              setPriceMin(e.target.value);
                              setPage(1);
                            }}
                            className="w-1/2 p-1 border rounded"
                          />
                          <input
                            type="number"
                            placeholder="Max $"
                            value={priceMax}
                            onChange={(e) => {
                              setPriceMax(e.target.value);
                              setPage(1);
                            }}
                            className="w-1/2 p-1 border rounded"
                          />
                        </div>
                      )}

                      {cat === "artist" &&
                        allArtists.map((a) => (
                          <div
                            key={a}
                            onClick={() => {
                              setArtist(a);
                              setPage(1);
                            }}
                            className={`p-1 rounded cursor-pointer ${
                              artist === a
                                ? "bg-blue-100 font-semibold"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            {a}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )
            )}

            <button
              onClick={() => {
                setSizeFilter("");
                setOrientation("");
                setPriceMin("");
                setPriceMax("");
                setArtist("");
                setPage(1);
              }}
              className="mt-2 text-sm text-red-600 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-auto mt-4">
        {loading && <p className="text-center">Loading…</p>}

        <div className="grid grid-cols-2 gap-3">
          {products.map((p) => {
            const isSelected = selectedProduct?._id === p._id;
            return (
              <div
                key={p._id}
                onClick={() => onSelect(p, p.sizes[0], 0)}
                className={`relative group flex flex-col cursor-pointer border rounded p-1 transition-shadow ${
                  isSelected
                    ? "border-blue-500 shadow-lg ring-2 ring-blue-200"
                    : "border-gray-200 hover:shadow-md"
                }`}
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={p.transparentUrl || p.imageUrl}
                    alt={p.title}
                    className="object-contain w-full h-full p-2"
                  />
                </div>
                <div className="mt-2 text-sm font-medium text-gray-800 truncate">
                  {p.title}
                </div>
                <div className="mt-1 text-sm font-semibold text-gray-600">
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
                        className={`px-2 py-1 text-xs rounded border ${
                          selectedSizeIndex === idx
                            ? "bg-blue-100 font-semibold border-blue-300"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {sz.widthCm}×{sz.heightCm} cm
                      </button>
                    ))}
                  </div>
                )}

                {/* Add to Wall overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(p, p.sizes[0], 0);
                    onAddToWall();
                  }}
                  className="absolute bottom-0 left-0 right-0 h-12 flex items-center justify-center
                             bg-gray-400 bg-opacity-50 text-white font-semibold
                             opacity-0 group-hover:opacity-100 transition-opacity rounded-b"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
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
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="mt-3 flex justify-center items-center space-x-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            {page} / {Math.ceil(total / limit)}
          </span>
          <button
            disabled={page * limit >= total}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
