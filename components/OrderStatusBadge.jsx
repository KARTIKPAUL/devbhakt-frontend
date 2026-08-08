const STATUS_STYLES = {
  PLACED: "bg-blue-50 text-blue-700",
  CONFIRMED: "bg-saffron-100 text-saffron-700",
  SHIPPED: "bg-purple-50 text-purple-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
  RETURNED: "bg-gray-100 text-gray-700",
};

export default function OrderStatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
        STATUS_STYLES[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
