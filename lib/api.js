const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getToken() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("devbhakt_token");
  } catch {
    return null;
  }
}

async function request(path, { method = "GET", body, auth = false, headers = {} } = {}) {
  const finalHeaders = { ...headers };
  let finalBody = body;

  if (body && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  }

  if (auth) {
    const token = getToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: finalBody,
      cache: "no-store",
    });
  } catch (err) {
    const error = new Error(
      "Could not reach the DevBhakt server. Please check your connection and try again."
    );
    error.isNetworkError = true;
    throw error;
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request("/api/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: payload }),
  getProfile: () => request("/api/auth/me", { auth: true }),
  updateProfile: (payload) => request("/api/auth/me", { method: "PUT", body: payload, auth: true }),
  addAddress: (payload) => request("/api/auth/addresses", { method: "POST", body: payload, auth: true }),
  deleteAddress: (addressId) =>
    request(`/api/auth/addresses/${addressId}`, { method: "DELETE", auth: true }),
  forgotPassword: (payload) => request("/api/auth/forgot-password", { method: "POST", body: payload }),
  resetPassword: (token, payload) =>
    request(`/api/auth/reset-password/${token}`, { method: "POST", body: payload }),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ).toString();
    return request(`/api/products${query ? `?${query}` : ""}`);
  },
  getProduct: (idOrSlug) => request(`/api/products/${idOrSlug}`),

  // Orders
  createOrder: (payload) => request("/api/orders", { method: "POST", body: payload, auth: true }),
  getMyOrders: () => request("/api/orders/my", { auth: true }),
  getOrder: (id) => request(`/api/orders/${id}`, { auth: true }),

  // Payment
  createRazorpayOrder: (orderId) =>
    request(`/api/payment/create-order/${orderId}`, { method: "POST", auth: true }),
  verifyPayment: (payload) => request("/api/payment/verify", { method: "POST", body: payload, auth: true }),
};

export { API_URL, getToken };
