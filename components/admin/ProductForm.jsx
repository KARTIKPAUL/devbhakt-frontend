"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

const CATEGORY_OPTIONS = ["T-Shirt", "Hoodie", "Tote Bag"];
const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL"];

const emptyForm = {
  name: "",
  description: "",
  category: "T-Shirt",
  collectionName: "",
  price: "",
  discountPrice: "",
  sizes: [],
  stock: "",
  sku: "",
  supplierSource: "",
  isFeatured: false,
};

export default function ProductForm({ initialProduct, onSuccess }) {
  const isEdit = !!initialProduct;
  const router = useRouter();
  const { showToast } = useToast();

  const [form, setForm] = useState(
    initialProduct
      ? {
          name: initialProduct.name || "",
          description: initialProduct.description || "",
          category: initialProduct.category || "T-Shirt",
          collectionName: initialProduct.collectionName || "",
          price: initialProduct.price ?? "",
          discountPrice: initialProduct.discountPrice ?? "",
          sizes: initialProduct.sizes || [],
          stock: initialProduct.stock ?? "",
          sku: initialProduct.sku || "",
          supplierSource: initialProduct.supplierSource || "",
          isFeatured: !!initialProduct.isFeatured,
        }
      : emptyForm
  );

  // Existing (already-uploaded) images — only relevant in edit mode
  const [existingImages, setExistingImages] = useState(initialProduct?.images || []);
  // New files picked for upload
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  const [saving, setSaving] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);
  const [error, setError] = useState(null);

  const toggleSize = (size) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setNewFiles((prev) => [...prev, ...files].slice(0, 6));
    setNewPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))].slice(0, 6));
  };

  const removeNewFile = (idx) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // Immediately calls the API to remove an already-uploaded image (edit mode only)
  const removeExistingImage = async (imgUrl) => {
    if (!isEdit) return;
    if (existingImages.length <= 1) {
      showToast("A product needs at least one image", "error");
      return;
    }
    setRemovingImage(true);
    try {
      const nextImages = existingImages.filter((img) => img !== imgUrl);
      const fd = new FormData();
      fd.append("images", JSON.stringify(nextImages));
      const data = await api.updateProduct(initialProduct._id, fd);
      setExistingImages(data.product.images);
      showToast("Image removed");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setRemovingImage(false);
    }
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    fd.append("category", form.category);
    fd.append("collectionName", form.collectionName);
    fd.append("price", form.price);
    if (form.discountPrice !== "") fd.append("discountPrice", form.discountPrice);
    form.sizes.forEach((s) => fd.append("sizes", s));
    fd.append("stock", form.stock || 0);
    if (form.sku) fd.append("sku", form.sku);
    if (form.supplierSource) fd.append("supplierSource", form.supplierSource);
    fd.append("isFeatured", form.isFeatured);
    newFiles.forEach((file) => fd.append("images", file));
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isEdit && newFiles.length === 0) {
      setError("Please upload at least one product image");
      return;
    }

    setSaving(true);
    try {
      const fd = buildFormData();
      if (isEdit) {
        const data = await api.updateProduct(initialProduct._id, fd);
        showToast("Product updated successfully");
        onSuccess?.(data.product);
      } else {
        const data = await api.createProduct(fd);
        showToast("Product created successfully");
        onSuccess?.(data.product);
        router.push("/admin/products");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}

      {/* Basic info */}
      <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 font-serif text-lg font-bold text-dharma-black">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label className="label-field">Product Name *</label>
            <input
              required
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Mahadev Trishul Oversized Tee"
            />
          </div>
          <div>
            <label className="label-field">Description *</label>
            <textarea
              required
              rows={4}
              className="input-field"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Fabric, fit, print details, care instructions..."
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">Category *</label>
              <select
                required
                className="input-field"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">Collection Name</label>
              <input
                className="input-field"
                value={form.collectionName}
                onChange={(e) => setForm({ ...form, collectionName: e.target.value })}
                placeholder="e.g. Mahadev Collection"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & stock */}
      <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 font-serif text-lg font-bold text-dharma-black">Pricing & Stock</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label-field">Price (₹) *</label>
            <input
              required
              type="number"
              min="0"
              className="input-field"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Discount Price (₹)</label>
            <input
              type="number"
              min="0"
              className="input-field"
              value={form.discountPrice}
              onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="label-field">Stock Quantity *</label>
            <input
              required
              type="number"
              min="0"
              className="input-field"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">SKU</label>
            <input
              className="input-field"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="Optional"
            />
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 font-serif text-lg font-bold text-dharma-black">Available Sizes</h2>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`h-11 min-w-[48px] rounded-lg border-2 px-3 text-sm font-semibold transition ${
                form.sizes.includes(size)
                  ? "border-saffron-600 bg-saffron-600 text-white"
                  : "border-dharma-black/15 text-dharma-black hover:border-saffron-600"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-dharma-black/40">Leave empty if the product is one-size / not size-based.</p>
      </div>

      {/* Images */}
      <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 font-serif text-lg font-bold text-dharma-black">Product Images</h2>

        {isEdit && existingImages.length > 0 && (
          <div className="mb-4">
            <p className="label-field">Current Images</p>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((img) => (
                <div key={img} className="group relative h-24 w-24 overflow-hidden rounded-lg border border-dharma-black/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="Product" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    disabled={removingImage}
                    onClick={() => removeExistingImage(img)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100 disabled:opacity-50"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="label-field">{isEdit ? "Add More Images" : "Upload Images *"}</p>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-dharma-black/20 p-6 text-center transition hover:border-saffron-600">
          <span className="text-2xl">📷</span>
          <span className="text-sm font-semibold text-dharma-black">Click to upload (up to 6 images)</span>
          <span className="text-xs text-dharma-black/40">PNG, JPG up to 5MB each</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
        </label>

        {newPreviews.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {newPreviews.map((src, idx) => (
              <div key={src} className="group relative h-24 w-24 overflow-hidden rounded-lg border border-saffron-600/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`New upload ${idx + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewFile(idx)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extra */}
      <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 font-serif text-lg font-bold text-dharma-black">Additional Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="label-field">Supplier Source (internal note, not shown to customers)</label>
            <input
              className="input-field"
              value={form.supplierSource}
              onChange={(e) => setForm({ ...form, supplierSource: e.target.value })}
              placeholder="Optional — internal ops note"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-dharma-black/70">
            <input
              type="checkbox"
              className="h-4 w-4 accent-saffron-600"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            />
            Feature this product on the homepage
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
        </button>
        <button type="button" onClick={() => router.push("/admin/products")} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
