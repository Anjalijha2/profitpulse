/**
 * Standard API Response Format
 * 
 * @param {boolean} success True if the request was successful
 * @param {string} message A human-readable message describing the outcome
 * @param {object|array|null} data Payload data
 * @param {object|array|null} errors List of errors if success=false
 * @param {object} meta Pagination or other meta info
 * @returns {object} The standard response shape
 */
export const apiResponse = (success, message, data = null, errors = null, meta = null) => {
    const response = {
        success,
        message,
    };

    if (data !== null) response.data = data;
    if (errors !== null) response.errors = errors;
    if (meta !== null) response.meta = meta;

    return response;
};
