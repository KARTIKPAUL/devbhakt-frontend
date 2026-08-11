"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { PRODUCT_TYPES, getProductTypeConfig, DEFAULT_PRODUCT_TYPE } from "@/lib/productTaxonomy";

const emptyForm = {
  name: "",
  description: "",
  productType: DEFAULT_PRODUCT_TYPE,
  category: getProductTypeConfig(DEFAULT_PRODUCT_TYPE).categories[0],
  collectionName: "",
  price: "",
  discountPrice: "",
  sizes: [],
  stock: "",
  sku: "",
  supplierSource: "",
  isFeatured: false,
  material: "",
  origin: "",
  isCertified: false,
  certificateImage: "",
  attributes: [], // [{ label, value }]
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
          productType: initialProduct.productType || DEFAULT_PRODUCT_TYPE,
          category: initialProduct.category || "",
          collectionName: initialProduct.collectionName || "",
          price: initialProduct.price ?? "",
          discountPrice: initialProduct.discountPrice ?? "",
          sizes: initialProduct.sizes || [],
          stock: initialProduct.stock ?? "",
          sku: initialProduct.sku || "",
          supplierSource: initialProduct.supplierSource || "",
          isFeatured: !!initialProduct.isFeatured,
          material: initialProduct.material || "",
          origin: initialProduct.origin || "",
          isCertified: !!initialProduct.isCertified,
          certificateImage: initialProduct.certificateImage || "",
          attributes: initialProduct.attributes || [],
        }
      : emptyForm
  );

  const typeConfig = useMemo(() => getProductTypeConfig(form.productType), [form.productType]);

  // Custom (free-typed) variant/spec inputs
  const [customVariant, setCustomVariant] = useState("");
  const [newSpecLabel, setNewSpecLabel] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  // Existing (already-uploaded) images — only relevant in edit mode
  const [existingImages, setExistingImages] = useState(initialProduct?.images || []);
  // New files picked for upload
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  const [saving, setSaving] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);
  const [error, setError] = useState(null);

  // Switching product type resets category to the new type's first option
  // and clears variants, since "S/M/L" makes no sense for a murti and
  // "5 Mukhi" makes no sense for a t-shirt.
  const handleProductTypeChange = (value) => {
    const nextConfig = getProductTypeConfig(value);
    setForm((f) => ({
      ...f,
      productType: value,
      category: nextConfig.categories[0] || "",
      sizes: [],
    }));
  };

  const toggleVariant = (variant) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(variant) ? f.sizes.filter((s) => s !== variant) : [...f.sizes, variant],
    }));
  };

  const addCustomVariant = () => {
    const v = customVariant.trim();
    if (!v) return;
    if (!form.sizes.includes(v)) {
      setForm((f) => ({ ...f, sizes: [...f.sizes, v] }));
    }
    setCustomVariant("");
  };

  const removeVariant = (variant) => {
    setForm((f) => ({ ...f, sizes: f.sizes.filter((s) => s !== variant) }));
  };

  const addAttribute = (label = newSpecLabel, value = newSpecValue) => {
    const l = label.trim();
    const v = value.trim();
    if (!l || !v) return;
    setForm((f) => ({ ...f, attributes: [...f.attributes, { label: l, value: v }] }));
    setNewSpecLabel("");
    setNewSpecValue("");
  };

  const removeAttribute = (idx) => {
    setForm((f) => ({ ...f, attributes: f.attributes.filter((_, i) => i !== idx) }));
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
    fd.append("productType", form.productType);
    fd.append("category", form.category);
    fd.append("collectionName", form.collectionName);
    fd.append("price", form.price);
    if (form.discountPrice !== "") fd.append("discountPrice", form.discountPrice);
    form.sizes.forEach((s) => fd.append("sizes", s));
    fd.append("stock", form.stock || 0);
    if (form.sku) fd.append("sku", form.sku);
    if (form.supplierSource) fd.append("supplierSource", form.supplierSource);
    fd.append("isFeatured", form.isFeatured);
    if (form.material) fd.append("material", form.material);
    if (form.origin) fd.append("origin", form.origin);
    fd.append("isCertified", form.isCertified);
    if (form.certificateImage) fd.append("certificateImage", form.certificateImage);
    fd.append("attributes", JSON.stringify(form.attributes));
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

          <div>
            <label className="label-field">Product Type *</label>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleProductTypeChange(t.value)}
                  className={`flex items-center gap-1.5 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition ${
                    form.productType === t.value
                      ? "border-saffron-600 bg-saffron-600 text-white"
                      : "border-dharma-black/15 text-dharma-black hover:border-saffron-600"
                  }`}
                >
                  <span>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
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
                {typeConfig.categories.map((c) => (
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

      {/* Variants (sizes / heights / mukhi depending on product type) */}
      <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 font-serif text-lg font-bold text-dharma-black">
          {typeConfig.variantLabel} Options
        </h2>

        {typeConfig.variantOptions.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {typeConfig.variantOptions.map((variant) => (
              <button
                key={variant}
                type="button"
                onClick={() => toggleVariant(variant)}
                className={`h-11 min-w-[48px] rounded-lg border-2 px-3 text-sm font-semibold transition ${
                  form.sizes.includes(variant)
                    ? "border-saffron-600 bg-saffron-600 text-white"
                    : "border-dharma-black/15 text-dharma-black hover:border-saffron-600"
                }`}
              >
                {variant}
              </button>
            ))}
          </div>
        )}

        {/* Custom variant not in the quick-pick list (e.g. a one-off height) */}
        <div className="flex gap-2">
          <input
            className="input-field"
            value={customVariant}
            onChange={(e) => setCustomVariant(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomVariant();
              }
            }}
            placeholder={`Add a custom ${typeConfig.variantLabel.toLowerCase()} (e.g. "15 inch")`}
          />
          <button type="button" onClick={addCustomVariant} className="btn-secondary shrink-0 px-4">
            Add
          </button>
        </div>

        {/* Any selected variants not in the preset list (custom-added, or from an edited product) */}
        {form.sizes.filter((s) => !typeConfig.variantOptions.includes(s)).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {form.sizes
              .filter((s) => !typeConfig.variantOptions.includes(s))
              .map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1.5 rounded-lg border-2 border-saffron-600 bg-saffron-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  {s}
                  <button type="button" onClick={() => removeVariant(s)} className="text-white/80 hover:text-white">
                    ✕
                  </button>
                </span>
              ))}
          </div>
        )}

        <p className="mt-2 text-xs text-dharma-black/40">
          Leave empty if this product isn&apos;t sold in different {typeConfig.variantLabel.toLowerCase()}s.
        </p>
      </div>

      {/* Material, origin & authenticity — most useful for murti/rudraksha */}
      <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 font-serif text-lg font-bold text-dharma-black">Material & Authenticity</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label-field">Material</label>
            <input
              className="input-field"
              value={form.material}
              onChange={(e) => setForm({ ...form, material: e.target.value })}
              placeholder="e.g. Brass, Marble, Panchdhatu, Cotton"
            />
          </div>
          <div>
            <label className="label-field">Origin</label>
            <input
              className="input-field"
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
              placeholder="e.g. Nepal, Rajasthan, Java Indonesia"
            />
          </div>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-dharma-black/70">
          <input
            type="checkbox"
            className="h-4 w-4 accent-saffron-600"
            checked={form.isCertified}
            onChange={(e) => setForm({ ...form, isCertified: e.target.checked })}
          />
          This product is lab-certified / verified authentic
        </label>
        {form.isCertified && (
          <div className="mt-3">
            <label className="label-field">Certificate Image URL</label>
            <input
              className="input-field"
              value={form.certificateImage}
              onChange={(e) => setForm({ ...form, certificateImage: e.target.value })}
              placeholder="Link to the certificate/authenticity proof image"
            />
          </div>
        )}
      </div>

      {/* Specifications — free-form key/value attributes, e.g. Language, Author, Weight */}
      <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-1 font-serif text-lg font-bold text-dharma-black">Specifications</h2>
        <p className="mb-4 text-xs text-dharma-black/40">
          Add any extra details worth showing customers — weight, dimensions, language, author, etc.
        </p>

        {typeConfig.attributeSuggestions.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {typeConfig.attributeSuggestions
              .filter((s) => !form.attributes.some((a) => a.label === s))
              .map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setNewSpecLabel(s)}
                  className="chip"
                >
                  + {s}
                </button>
              ))}
          </div>
        )}

        {form.attributes.length > 0 && (
          <div className="mb-4 space-y-2">
            {form.attributes.map((attr, idx) => (
              <div key={`${attr.label}-${idx}`} className="flex items-center gap-2 rounded-lg bg-dharma-sand/60 px-3 py-2">
                <span className="min-w-[100px] text-xs font-bold uppercase tracking-wide text-dharma-black/60">
                  {attr.label}
                </span>
                <span className="flex-1 text-sm text-dharma-black">{attr.value}</span>
                <button
                  type="button"
                  onClick={() => removeAttribute(idx)}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="input-field"
            value={newSpecLabel}
            onChange={(e) => setNewSpecLabel(e.target.value)}
            placeholder="Label (e.g. Weight)"
          />
          <input
            className="input-field"
            value={newSpecValue}
            onChange={(e) => setNewSpecValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAttribute();
              }
            }}
            placeholder="Value (e.g. 450 g)"
          />
          <button type="button" onClick={() => addAttribute()} className="btn-secondary shrink-0 px-4">
            Add
          </button>
        </div>
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
