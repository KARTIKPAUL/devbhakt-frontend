import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <Link href="/admin/products" className="mb-3 inline-block text-xs font-semibold text-saffron-700 hover:underline">
        ← Back to Products
      </Link>
      <h1 className="section-heading mb-6">Add New Product</h1>
      <div className="max-w-3xl">
        <ProductForm />
      </div>
    </div>
  );
}
