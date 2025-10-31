import { API_BASE_URL } from '../apiConfig';
import { getAuthHeaders } from '../utils/authUtils';
import { handleResponse } from './apiUtils'; // Assumes apiUtils.js exists

/**
 * Creates a new order (checkout). (Requires Auth Token)
 * @param {object} orderData - The checkout request payload.
 */
export const createOrder = async (orderData) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData),
    });
    return handleResponse(response);
};

/**
 * Fetches all orders for a specific user. (Requires Auth Token)
 * @param {number} userId - The ID of the user whose orders to fetch.
 */
export const getOrdersByUserId = async (userId) => {
    // Hits GET /api/orders/user/{userId}
    const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`, {
        method: 'GET',
        headers: getAuthHeaders(), // Requires authentication
    });
    // Returns array of OrderDto on success
    return handleResponse(response);
};

/**
 * Fetches a single order by its ID. (Requires Auth Token)
 * @param {number} orderId - The ID of the order to fetch.
 */
export const getOrderById = async (orderId) => {
    // Hits GET /api/orders/{id}
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: getAuthHeaders(), // Requires authentication
    });
    // Returns single OrderDto on success
    return handleResponse(response);
};


/**
 * Cancels a specific order. (Requires Auth Token)
 * @param {number} orderId - The ID of the order to cancel.
 */
export const cancelOrder = async (orderId) => {
    // Hits POST /api/orders/{id}/cancel
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'POST', // Use POST as defined in your backend controller
        headers: getAuthHeaders(), // Requires authentication
        // No body needed for this request
    });
    // Returns { message: "..." } on success
    return handleResponse(response);
};

// --- NEW ADMIN FUNCTIONS ---

/**
 * Fetches *all* orders (active and inactive). (Admin Only)
 */
export const getAllAdminOrders = async () => {
    const response = await fetch(`${API_BASE_URL}/orders/admin/all`, {
        method: 'GET',
        headers: getAuthHeaders(), // Requires admin auth token
    });
    return handleResponse(response);
};

/**
 * Updates the status of an existing order. (Admin Only)
 * @param {number} orderId - The ID of the item to update.
 * @param {object} statusData - The { status: number } payload.
 */
export const updateOrderStatus = async (orderId, statusData) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(), // Use authenticated headers
        body: JSON.stringify(statusData), // e.g., { "status": 2 }
    });
    // Returns the full updated OrderDto on success
    return handleResponse(response);
};

