"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import ProductForm from "@/components/admin/ProductForm";
import Loader from "@/components/Loader";

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    api
      .getProduct(id)
      .then((data) => active && setProduct(data.product))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <Loader label="Loading product..." />;

  if (error || !product) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-red-700">{error || "Product not found"}</p>
        <Link href="/admin/products" className="btn-primary mt-4 inline-flex">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/products" className="mb-3 inline-block text-xs font-semibold text-saffron-700 hover:underline">
        ← Back to Products
      </Link>
      <h1 className="section-heading mb-6">Edit Product</h1>
      <div className="max-w-3xl">
        <ProductForm initialProduct={product} onSuccess={setProduct} />
      </div>
    </div>
  );
}
