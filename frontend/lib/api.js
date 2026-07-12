/**
 * TransitOps API Client
 * Centralized API service for communicating with the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Get auth token from localStorage
 */
function getAuthToken() {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('access_token');
    }
    return null;
}

/**
 * Set auth token in localStorage
 */
export function setAuthToken(token) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', token);
    }
}

/**
 * Remove auth token from localStorage
 */
export function removeAuthToken() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
    }
}

/**
 * Make an API request
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
        removeAuthToken();
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

// ============================================================================
// AUTH API
// ============================================================================

export const authApi = {
    async login(email, password) {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (response.access_token) {
            setAuthToken(response.access_token);
        }
        return response;
    },

    async register(userData) {
        return apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    async getCurrentUser() {
        return apiRequest('/auth/me');
    },

    async refreshToken() {
        return apiRequest('/auth/refresh', { method: 'POST' });
    },

    logout() {
        removeAuthToken();
    },
};

// ============================================================================
// VEHICLES API
// ============================================================================

export const vehiclesApi = {
    async getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.status) query.append('status', params.status);
        if (params.vehicle_type) query.append('vehicle_type', params.vehicle_type);
        if (params.search) query.append('search', params.search);
        if (params.skip) query.append('skip', params.skip);
        if (params.limit) query.append('limit', params.limit);

        const queryString = query.toString();
        return apiRequest(`/vehicles${queryString ? `?${queryString}` : ''}`);
    },

    async getById(id) {
        return apiRequest(`/vehicles/${id}`);
    },

    async create(data) {
        return apiRequest('/vehicles', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async update(id, data) {
        return apiRequest(`/vehicles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async delete(id) {
        return apiRequest(`/vehicles/${id}`, { method: 'DELETE' });
    },

    async getOptions() {
        return apiRequest('/vehicles/options');
    },
};

// ============================================================================
// DRIVERS API
// ============================================================================

export const driversApi = {
    async getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.duty_status) query.append('duty_status', params.duty_status);
        if (params.search) query.append('search', params.search);
        if (params.skip) query.append('skip', params.skip);
        if (params.limit) query.append('limit', params.limit);

        const queryString = query.toString();
        return apiRequest(`/drivers${queryString ? `?${queryString}` : ''}`);
    },

    async getById(id) {
        return apiRequest(`/drivers/${id}`);
    },

    async create(data) {
        return apiRequest('/drivers', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async update(id, data) {
        return apiRequest(`/drivers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async delete(id) {
        return apiRequest(`/drivers/${id}`, { method: 'DELETE' });
    },

    async getOptions() {
        return apiRequest('/drivers/options');
    },

    async suspend(id) {
        return apiRequest(`/drivers/${id}/suspend`, { method: 'POST' });
    },

    async activate(id) {
        return apiRequest(`/drivers/${id}/activate`, { method: 'POST' });
    },
};

// ============================================================================
// TRIPS API
// ============================================================================

export const tripsApi = {
    async getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.status) query.append('status', params.status);
        if (params.vehicle_id) query.append('vehicle_id', params.vehicle_id);
        if (params.driver_id) query.append('driver_id', params.driver_id);
        if (params.skip) query.append('skip', params.skip);
        if (params.limit) query.append('limit', params.limit);

        const queryString = query.toString();
        return apiRequest(`/trips${queryString ? `?${queryString}` : ''}`);
    },

    async getById(id) {
        return apiRequest(`/trips/${id}`);
    },

    async create(data) {
        return apiRequest('/trips', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async update(id, data) {
        return apiRequest(`/trips/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async delete(id) {
        return apiRequest(`/trips/${id}`, { method: 'DELETE' });
    },

    async start(id) {
        return apiRequest(`/trips/${id}/start`, { method: 'POST' });
    },

    async complete(id, endOdometer) {
        return apiRequest(`/trips/${id}/complete?end_odometer_km=${endOdometer}`, {
            method: 'POST',
        });
    },

    async cancel(id) {
        return apiRequest(`/trips/${id}/cancel`, { method: 'POST' });
    },
};

// ============================================================================
// MAINTENANCE API
// ============================================================================

export const maintenanceApi = {
    async getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.status) query.append('status', params.status);
        if (params.vehicle_id) query.append('vehicle_id', params.vehicle_id);
        if (params.service_type) query.append('service_type', params.service_type);
        if (params.skip) query.append('skip', params.skip);
        if (params.limit) query.append('limit', params.limit);

        const queryString = query.toString();
        return apiRequest(`/maintenance${queryString ? `?${queryString}` : ''}`);
    },

    async getById(id) {
        return apiRequest(`/maintenance/${id}`);
    },

    async create(data) {
        return apiRequest('/maintenance', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async update(id, data) {
        return apiRequest(`/maintenance/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async delete(id) {
        return apiRequest(`/maintenance/${id}`, { method: 'DELETE' });
    },

    async start(id) {
        return apiRequest(`/maintenance/${id}/start`, { method: 'POST' });
    },

    async complete(id, completionData) {
        return apiRequest(`/maintenance/${id}/complete`, {
            method: 'POST',
            body: JSON.stringify(completionData),
        });
    },

    async cancel(id) {
        return apiRequest(`/maintenance/${id}/cancel`, { method: 'POST' });
    },
};

// ============================================================================
// EXPENSES API
// ============================================================================

export const expensesApi = {
    async getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.expense_type) query.append('expense_type', params.expense_type);
        if (params.vehicle_id) query.append('vehicle_id', params.vehicle_id);
        if (params.trip_id) query.append('trip_id', params.trip_id);
        if (params.skip) query.append('skip', params.skip);
        if (params.limit) query.append('limit', params.limit);

        const queryString = query.toString();
        return apiRequest(`/expenses${queryString ? `?${queryString}` : ''}`);
    },

    async getById(id) {
        return apiRequest(`/expenses/${id}`);
    },

    async create(data) {
        return apiRequest('/expenses', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async update(id, data) {
        return apiRequest(`/expenses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async delete(id) {
        return apiRequest(`/expenses/${id}`, { method: 'DELETE' });
    },

    async getSummaryByType() {
        return apiRequest('/expenses/summary/by-type');
    },
};

// ============================================================================
// FUEL LOGS API
// ============================================================================

export const fuelLogsApi = {
    async getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.vehicle_id) query.append('vehicle_id', params.vehicle_id);
        if (params.skip) query.append('skip', params.skip);
        if (params.limit) query.append('limit', params.limit);

        const queryString = query.toString();
        return apiRequest(`/fuel-logs${queryString ? `?${queryString}` : ''}`);
    },

    async getById(id) {
        return apiRequest(`/fuel-logs/${id}`);
    },

    async create(data) {
        return apiRequest('/fuel-logs', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async update(id, data) {
        return apiRequest(`/fuel-logs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async delete(id) {
        return apiRequest(`/fuel-logs/${id}`, { method: 'DELETE' });
    },

    async getSummaryByVehicle() {
        return apiRequest('/fuel-logs/summary/by-vehicle');
    },
};

// ============================================================================
// ANALYTICS API
// ============================================================================

export const analyticsApi = {
    async getDashboardKPIs() {
        return apiRequest('/analytics/dashboard/kpis');
    },

    async getVehicleCostSummary() {
        return apiRequest('/analytics/vehicles/cost-summary');
    },

    async getDriverPerformance() {
        return apiRequest('/analytics/drivers/performance');
    },

    async getMonthlyFinancials() {
        return apiRequest('/analytics/financial/monthly');
    },

    async getFullSummary() {
        return apiRequest('/analytics/summary');
    },

    async getFleetStats() {
        return apiRequest('/analytics/fleet/stats');
    },
};

// Default export with all APIs
export default {
    auth: authApi,
    vehicles: vehiclesApi,
    drivers: driversApi,
    trips: tripsApi,
    maintenance: maintenanceApi,
    expenses: expensesApi,
    fuelLogs: fuelLogsApi,
    analytics: analyticsApi,
};