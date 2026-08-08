export function formatPrice(amount) {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function effectivePrice(product) {
  if (!product) return 0;
  if (product.discountPrice && product.discountPrice < product.price) {
    return product.discountPrice;
  }
  return product.price;
}

export function discountPercent(product) {
  if (!product?.discountPrice || product.discountPrice >= product.price) return 0;
  return Math.round(((product.price - product.discountPrice) / product.price) * 100);
}

export function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
