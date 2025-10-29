/**
 * Retrieves the stored authentication token.
 * Adjust 'token' if you use a different key in localStorage.
 */
export const getToken = () => {
    // FIX: Changed 'authToken' to 'token' to match localStorage
    return localStorage.getItem('token');
};

/**
 * Creates the Authorization header object for authenticated requests.
 */
export const getAuthHeaders = () => {
    const token = getToken();
    if (!token) {
        console.warn("Authentication token not found.");
        return { 'Content-Type': 'application/json' };
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

/**
 * Creates the Authorization header object for authenticated form-data requests.
 */
export const getAuthHeadersFormData = () => {
    const token = getToken();
    if (!token) {
        console.warn("Authentication token not found.");
        return {};
    }
    return {
        'Authorization': `Bearer ${token}`,
    };
};

