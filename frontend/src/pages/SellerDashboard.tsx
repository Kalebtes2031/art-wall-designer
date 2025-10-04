// src/pages/SellerDashboard.tsx
import React, { useEffect, useState, useCallback } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import type { Product, Size } from "../types/Product";
import {
  FiEdit,
  FiTrash2,
  FiCheck,
  FiX,
  FiPlus,
  FiDollarSign,
  FiBox,
  FiShoppingBag,
  FiImage,
} from "react-icons/fi";
import { getAssetUrl } from "../utils/getAssetUrl";
import { motion } from "framer-motion";

interface Order {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  items: {
    product: {
      title: string;
      imageUrl?: string;
      transparentUrl?: string;
    };
    quantity: number;
    priceAtOrder: number;
  }[];
}


export default function SellerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<{
    title: string;
    description: string;
    price: string;
    orientation: "portrait" | "landscape";
    sizes: Size[];
  }>({
    title: "",
    description: "",
    price: "",
    orientation: "portrait",
    sizes: [{ widthCm: 0, heightCm: 0 }],
  });
  const [file, setFile] = useState<File | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    price: string;
    orientation: "portrait" | "landscape";
    sizes: Size[];
  } | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
   const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  
      const toggleExpanded = (orderId: string) => {
      setExpandedOrders((prev) => {
        const next = new Set(prev);
        if (next.has(orderId)) {
          next.delete(orderId);
        } else {
          next.add(orderId);
        }
        return next;
      });
    };

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await api.get("/orders");
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  // Fetch seller's products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await api.get("/products/mine");
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Add a blank size row
  const addSizeRow = () =>
    setForm((f) => ({
      ...f,
      sizes: [...f.sizes, { widthCm: 0, heightCm: 0 }],
    }));

  // Remove a size row
  const removeSizeRow = (idx: number) =>
    setForm((f) => ({
      ...f,
      sizes: f.sizes.filter((_, i) => i !== idx),
    }));

  // Update a size value
  const updateSize = (
    idx: number,
    key: "widthCm" | "heightCm",
    value: number
  ) =>
    setForm((f) => {
      const sizes = [...f.sizes];
      sizes[idx] = { ...sizes[idx], [key]: value };
      return { ...f, sizes };
    });

  const submitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    if (form.sizes.some((s) => s.widthCm <= 0 || s.heightCm <= 0)) {
      alert("Please enter valid positive dimensions for all sizes.");
      setCreating(false);
      return;
    }
    if (!form.title || !form.price || !file) {
      alert("Title, price, and image are required.");
      setCreating(false);
      return;
    }
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("price", form.price);
    fd.append("orientation", form.orientation);
    fd.append("sizes", JSON.stringify(form.sizes));
    if (file) fd.append("image", file);

    try {
      const res = await api.post("/products", fd);
      setProducts((prev) => [res.data, ...prev]);
      setForm({
        title: "",
        description: "",
        price: "",
        orientation: "portrait",
        sizes: [{ widthCm: 0, heightCm: 0 }],
      });
      setFile(null);
    } catch (err) {
      console.error("Create product failed:", err);
    } finally {
      setCreating(false);
    }
  };

  // Start editing a product
  const startEditing = (product: Product) => {
    setEditingProductId(product._id);
    setEditForm({
      title: product.title,
      description: product.description || "",
      price: product.price.toString(),
      orientation: product.orientation as "portrait" | "landscape",
      sizes: [...product.sizes],
    });
    setEditFile(null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingProductId(null);
    setEditForm(null);
    setEditFile(null);
  };

  // Submit product edit
  const submitEdit = useCallback(
    async (e: React.FormEvent, productId: string) => {
      e.preventDefault();
      if (!editForm) return;

      const originalProduct = products.find((p) => p._id === productId);
      if (!originalProduct) return;

      setIsSubmitting(true);

      const fd = new FormData();

      // Compare and append only changed fields
      if (editForm.title !== originalProduct.title) {
        fd.append("title", editForm.title);
      }

      if (
        (editForm.description || "") !== (originalProduct.description || "")
      ) {
        fd.append("description", editForm.description || "");
      }

      if (parseFloat(editForm.price) !== originalProduct.price) {
        fd.append("price", editForm.price);
      }

      if (editForm.orientation !== originalProduct.orientation) {
        fd.append("orientation", editForm.orientation);
      }

      // Sizes comparison
      const sizesChanged =
        editForm.sizes.length !== originalProduct.sizes.length ||
        editForm.sizes.some((size, i) => {
          const original = originalProduct.sizes[i];
          return (
            size.widthCm !== original?.widthCm ||
            size.heightCm !== original?.heightCm
          );
        });

      if (sizesChanged) {
        fd.append("sizes", JSON.stringify(editForm.sizes));
      }

      if (editFile) {
        fd.append("image", editFile);
      }

      try {
        const res = await api.patch(`/products/${productId}`, fd,);

        // Replace product with updated version
        setProducts((prev) =>
          prev.map((p) => (p._id === productId ? res.data : p))
        );
        cancelEditing();
      } catch (err) {
        console.error("Edit failed:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [editForm, editFile, products]
  );

  // Delete a product
  const deleteProduct = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await api.delete(`/products/${productId}`);
      setProducts(products.filter((p) => p._id !== productId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen pt-[65px] bg-gradient-to-r from-gray-50 to-gray-100">
    <div className="max-w-7xl mx-auto px-4  sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back,{" "}
          <span className="font-semibold text-[#1c3c74]">{user?.name}</span>.
          Manage your products and track orders.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("products")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "products"
                ? "border-[#1c3c74] text-[#1c3c74]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FiBox className="inline mr-2" />
            My Products
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "orders"
                ? "border-[#1c3c74] text-[#1c3c74]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FiShoppingBag className="inline mr-2" />
            Orders
          </button>
        </nav>
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="space-y-8">
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                My Products ({products.length})
              </h2>
            </div>
            {loadingProducts ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <FiBox className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No products
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new product.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-200 relative"
                  >
                    {/* Edit Mode */}
                    {editingProductId === product._id ? (
                      <form
                        onSubmit={(e) => submitEdit(e, product._id)}
                        className="p-4 space-y-3"
                      >
                        <input
                          type="text"
                          placeholder="Title"
                          value={editForm?.title || ""}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f!,
                              title: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />

                        <textarea
                          placeholder="Description"
                          value={editForm?.description || ""}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f!,
                              description: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          rows={2}
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-700 mb-1">
                              Price ($)
                            </label>
                            <input
                              type="number"
                              placeholder="0.00"
                              value={editForm?.price || ""}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f!,
                                  price: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              required
                              step="0.01"
                              min="0"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-gray-700 mb-1">
                              Orientation
                            </label>
                            <select
                              value={editForm?.orientation || "portrait"}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f!,
                                  orientation: e.target.value as any,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="portrait">Portrait</option>
                              <option value="landscape">Landscape</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-700 mb-1">
                            Sizes (cm)
                          </label>
                          {editForm?.sizes.map((size, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 mb-2"
                            >
                              <input
                                type="number"
                                placeholder="Width"
                                value={size.widthCm}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  setEditForm((f) => {
                                    const sizes = [...f!.sizes];
                                    sizes[idx] = {
                                      ...sizes[idx],
                                      widthCm: value,
                                    };
                                    return { ...f!, sizes };
                                  });
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                                min="1"
                              />
                              <input
                                type="number"
                                placeholder="Height"
                                value={size.heightCm}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  setEditForm((f) => {
                                    const sizes = [...f!.sizes];
                                    sizes[idx] = {
                                      ...sizes[idx],
                                      heightCm: value,
                                    };
                                    return { ...f!, sizes };
                                  });
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                                min="1"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setEditForm((f) => ({
                                    ...f!,
                                    sizes: f!.sizes.filter((_, i) => i !== idx),
                                  }));
                                }}
                                className="text-red-500 text-sm"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              setEditForm((f) => ({
                                ...f!,
                                sizes: [
                                  ...f!.sizes,
                                  { widthCm: 0, heightCm: 0 },
                                ],
                              }))
                            }
                            className="text-sm text-indigo-600 hover:underline"
                          >
                            + Add Size
                          </button>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-700 mb-1">
                            Update Image (optional)
                          </label>
                          <div className="mt-1 flex items-center">
                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <FiImage className="w-6 h-6 text-gray-400 mb-1" />
                                <p className="text-xs text-gray-500">
                                  {editFile ? editFile.name : "Click to upload"}
                                </p>
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) =>
                                  setEditFile(e.target.files?.[0] || null)
                                }
                                accept="image/*"
                              />
                            </label>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-2">
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="px-3 py-1.5 flex items-center text-sm text-gray-700 rounded border border-gray-300 hover:bg-gray-100"
                            disabled={isSubmitting}
                          >
                            <FiX className="mr-1" /> Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-3 py-1.5 flex items-center text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                          >
                            <FiCheck className="mr-1" />
                            {isSubmitting ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </form>
                    ) : (
                      // Product Display Mode
                      <>
                        <div className="group relative">
                          {product.imageUrl ? (
                            <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                              <img
                                src={getAssetUrl(product.imageUrl)}
                                alt={product.title}
                                className="object-cover w-full h-48"
                              />
                            </div>
                          ) : (
                            <div className="bg-gray-200 border-2 border-dashed rounded-t-xl w-full h-48 flex items-center justify-center">
                              <FiImage className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex space-x-1">
                              <button
                                onClick={() => startEditing(product)}
                                className="p-1.5 bg-white rounded-full shadow-md text-indigo-600 hover:bg-indigo-50"
                                title="Edit"
                              >
                                <FiEdit size={16} />
                              </button>
                              <button
                                onClick={() => deleteProduct(product._id)}
                                className="p-1.5 bg-white rounded-full shadow-md text-red-600 hover:bg-red-50"
                                title="Delete"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-900">
                              {product.title}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              ${product.price.toFixed(2)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="mt-3 flex justify-between text-sm text-gray-600">
                            <div className="text-sm text-gray-500">
                              {product.sizes
                                .map((s) => `${s.widthCm}×${s.heightCm}cm`)
                                .join(", ")}
                            </div>
                            <span className="capitalize">
                              {product.orientation}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
          
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 text-gray-600 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Add New Product
              </h2>
            </div>
            <form
              onSubmit={submitProduct}
              className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  placeholder="Product title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              {/* price */}
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Price ($)
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiDollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="price"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              {/* Description */}
              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  placeholder="Product description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* orientation   */}
              <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orientation
            </label>
            <select
              value={form.orientation}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  orientation: e.target.value as "portrait" | "landscape",
                }))
              }
              className="w-full border border-gray-300  shadow-sm text-gray-700 rounded px-3 py-2"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>

              {/* sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sizes (cm)
                </label>
                <div className="space-y-2">
                  {form.sizes.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Width"
                        value={s.widthCm}
                        onChange={(e) =>
                          updateSize(idx, "widthCm", Number(e.target.value))
                        }
                        required
                        min={1}
                        className="w-1/3 border border-gray-300  shadow-sm text-gray-700 rounded px-2 py-1"
                      />
                      <span className="text-gray-600">×</span>
                      <input
                        type="number"
                        placeholder="Height"
                        value={s.heightCm}
                        onChange={(e) =>
                          updateSize(idx, "heightCm", Number(e.target.value))
                        }
                        required
                        min={1}
                        className="w-1/3 border border-gray-300  shadow-sm text-gray-700 rounded px-2 py-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeSizeRow(idx)}
                        className="p-1 text-red-500"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSizeRow}
                    className="inline-flex items-center px-3 py-1 bg-[#1c3c74] text-white rounded"
                  >
                    <FiPlus className="mr-1" /> Add Size
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          required
                          accept="image/*"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                    {file && (
                      <p className="text-sm text-gray-900 truncate">
                        {file.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#001842] via-[#1c3c74] to-[#5E89B3] hover:from-[#5E89B3] hover:via-[#1c3c74] hover:to-[#001842] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                  {creating ? "Creating..." : "Create Product"}
                </button>
              </div>
            </form>
          </section>

          
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
          </div>
          {loadingOrders ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No orders yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Your orders will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Order ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Customer info
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date & Time
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Items
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Total
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((o) => {
        const isExpanded = expandedOrders.has(o._id);
        const visibleItems = isExpanded ? o.items : o.items.slice(0, 2);

        return (
          <motion.tr
            key={o._id}
            className="hover:bg-gray-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                        #{o._id.slice(-6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">{o.user.name}</div>
              <div className="text-xs text-gray-500">{o.user.email}</div>
            </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(o.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
              {visibleItems.map((it, i) => (
                <div key={i} className="flex items-start">
                  <img
                    src={getAssetUrl(
                      it.product.imageUrl ?? it.product.transparentUrl ?? ""
                    )}
                    alt={it.product.title}
                    className="w-10 h-10 object-cover rounded-md bg-gray-100 mb-2 mr-1"
                  />
                  <div>
                    <div>{it.product.title}</div>
                    <div className="text-xs text-gray-500">
                      {it.quantity} × ${it.priceAtOrder.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}

              {o.items.length > 2 && (
                <button
                  onClick={() => toggleExpanded(o._id)}
                  className="text-gray-500 text-xs mt-2 cursor-pointer hover:bg-blue-100 p-1 rounded-full"
                >
                  {isExpanded
                    ? "Show less"
                    : `+${o.items.length - 2} more items`}
                </button>
              )}
            </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${o.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            o.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : o.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                    </motion.tr>
        );
      })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div></div>
  );
}
