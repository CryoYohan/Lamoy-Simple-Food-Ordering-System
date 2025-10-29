/**
 * Handles the response from a fetch API call.
 * Parses JSON on success, throws an error with backend message on failure.
 * @param {Response} response - The Response object from fetch.
 * @returns {Promise<object>} - The parsed JSON data on success.
 * @throws {Error} - An error with the message from the backend on failure.
 */
export const handleResponse = async (response) => {
    if (response.ok) {
        // Handle successful responses (including 204 No Content)
        if (response.status === 204) {
            return {}; // Return empty object for No Content
        }
        const text = await response.text(); // Read body as text first
        try {
            return text ? JSON.parse(text) : {}; // Parse JSON if text exists
        } catch (e) {
            console.error("Failed to parse JSON response:", text);
            throw new Error("Received invalid data format from server.");
        }
    } else {
        // Handle error responses
        let errorMessage = `HTTP error! Status: ${response.status}`;
        try {
            // Try to parse the error response body as JSON
            const errorData = await response.json();
            // Use the specific 'error' message from our middleware if available
            errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
            // If the error body isn't JSON, try reading as text
            try {
                const errorText = await response.text();
                if (errorText) {
                    errorMessage = errorText; // Use plain text error if available
                }
            } catch (textError) {
                // Ignore errors reading the error body
            }
        }
        throw new Error(errorMessage);
    }
};
