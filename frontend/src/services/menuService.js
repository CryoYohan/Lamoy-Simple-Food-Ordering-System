import { API_BASE_URL } from '../apiConfig';
import { getAuthHeaders, getAuthHeadersFormData } from '../utils/authUtils'; // Import token helpers

/**
 * Helper function to handle API responses and errors.
 */
const handleResponse = async (response) => {
    if (response.ok) {
        // Handle successful responses (200 OK, 201 Created, 204 No Content)
        if (response.status === 204) {
            return {}; // No content to parse for 204
        }
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    }

    // Handle errors (4xx, 5xx)
    try {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    } catch (jsonError) {
        // If the error response wasn't JSON
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
};

/**
 * Fetches all available menu items. (Public)
 */
export const getAllMenuItems = async () => {
    const response = await fetch(`${API_BASE_URL}/menu`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
};

/**
 * Fetches all menu categories. (Public)
 */
export const getAllCategories = async () => {
    const response = await fetch(`${API_BASE_URL}/menu/categories`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
};

/**
 * Fetches a single menu item by ID. (Assumes protected, adjust if public)
 */
export const getMenuItemById = async (itemId) => {
    const response = await fetch(`${API_BASE_URL}/menu/${itemId}`, {
        method: 'GET',
        headers: getAuthHeaders(), // Use authenticated headers
    });
    return handleResponse(response);
};


/**
 * Creates a new menu item. (Admin Only - Requires Auth Token and FormData)
 * @param {FormData} formData - The menu item data including the image file.
 */
export const createMenuItem = async (formData) => {
    const response = await fetch(`${API_BASE_URL}/menu`, {
        method: 'POST',
        headers: getAuthHeadersFormData(), // Use special headers for FormData
        body: formData, // Send FormData directly
    });
    return handleResponse(response);
};

/**
 * Updates an existing menu item. (Admin Only - Requires Auth Token)
 * @param {number} itemId - The ID of the item to update.
 * @param {object} itemData - The updated item data (MenuItemUpdateDto).
 */
export const updateMenuItem = async (itemId, itemData) => {
    const response = await fetch(`${API_BASE_URL}/menu/${itemId}`, {
        method: 'PUT',
        headers: getAuthHeaders(), // Use authenticated headers
        body: JSON.stringify(itemData),
    });
    // PUT requests often return 204 No Content on success
    return handleResponse(response);
};

/**
 * Deletes a menu item. (Admin Only - Requires Auth Token)
 * @param {number} itemId - The ID of the item to delete.
 */
export const deleteMenuItem = async (itemId) => {
    const response = await fetch(`${API_BASE_URL}/menu/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(), // Use authenticated headers
    });
    // DELETE requests often return 204 No Content on success
    return handleResponse(response);
};
