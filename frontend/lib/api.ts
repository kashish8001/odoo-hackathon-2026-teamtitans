/**
 * Mock FleetFlow API Client
 * Operates on localStorage to allow a fully functional frontend without a running backend.
 */

// Helper to check if window is defined (browser environment)
const isBrowser = typeof window !== "undefined";

// Helper to get items from localStorage
function getLocalStorageItem(key: string, defaultValue: string): string {
  if (isBrowser) {
    const item = localStorage.getItem(key);
    if (item !== null) return item;
    localStorage.setItem(key, defaultValue);
    return defaultValue;
  }
  return defaultValue;
}

// Initialize mock vehicles database
const defaultVehicles = [
  {
    id: 1,
    license_plate: "MH-12-AB-1234",
    make: "TATA",
    model: "407",
    year: 2021,
    vehicle_type: "truck",
    fuel_type: "diesel",
    max_load_capacity_kg: 5000,
    current_odometer_km: 79000,
    status: "idle"
  },
  {
    id: 2,
    license_plate: "GJ-01-CD-5678",
    make: "Ashok Leyland",
    model: "Prima",
    year: 2019,
    vehicle_type: "truck",
    fuel_type: "diesel",
    max_load_capacity_kg: 20000,
    current_odometer_km: 142000,
    status: "on_trip"
  },
  {
    id: 3,
    license_plate: "DL-03-EF-9012",
    make: "Mahindra",
    model: "Blazo",
    year: 2022,
    vehicle_type: "truck",
    fuel_type: "diesel",
    max_load_capacity_kg: 10000,
    current_odometer_km: 34000,
    status: "on_trip"
  },
  {
    id: 4,
    license_plate: "KA-05-GH-3456",
    make: "BharatBenz",
    model: "1617R",
    year: 2018,
    vehicle_type: "truck",
    fuel_type: "diesel",
    max_load_capacity_kg: 5000,
    current_odometer_km: 210000,
    status: "maintenance"
  },
  {
    id: 5,
    license_plate: "RJ-09-KL-2345",
    make: "Eicher",
    model: "Pro 2049",
    year: 2020,
    vehicle_type: "truck",
    fuel_type: "cng",
    max_load_capacity_kg: 20000,
    current_odometer_km: 98000,
    status: "idle"
  },
  {
    id: 6,
    license_plate: "TN-07-MN-6789",
    make: "Volvo",
    model: "FM",
    year: 2023,
    vehicle_type: "truck",
    fuel_type: "diesel",
    max_load_capacity_kg: 10000,
    current_odometer_km: 12000,
    status: "on_trip"
  }
];

// Initialize mock trips database
const mockTrips = [
  { id: 1, origin_address: "Mumbai", destination_address: "Pune", driver_name: "Alex Morgan", distance_km: 148 },
  { id: 2, origin_address: "Ahmedabad", destination_address: "Surat", driver_name: "Priya Nair", distance_km: 263 },
  { id: 3, origin_address: "Delhi", destination_address: "Jaipur", driver_name: "Ravi Mehta", distance_km: 272 },
  { id: 4, origin_address: "Bangalore", destination_address: "Chennai", driver_name: "John Doe", distance_km: 345 }
];

// Initialize mock expenses database
const defaultExpenses = [
  {
    id: 1,
    trip_id: 1,
    driver_name: "Alex Morgan",
    distance_km: 148,
    expense_type: "fuel",
    amount: 3200,
    description: "Refueled at highway petrol pump",
    expense_date: "2026-07-10"
  },
  {
    id: 2,
    trip_id: 2,
    driver_name: "Priya Nair",
    distance_km: 263,
    expense_type: "toll",
    amount: 450,
    description: "National Highway toll plaza",
    expense_date: "2026-07-11"
  },
  {
    id: 3,
    trip_id: 3,
    driver_name: "Ravi Mehta",
    distance_km: 272,
    expense_type: "other",
    amount: 1200,
    description: "Parking and loading helper charges",
    expense_date: "2026-07-11"
  }
];

function getMockVehicles(): any[] {
  const dataStr = getLocalStorageItem("mock_vehicles", JSON.stringify(defaultVehicles));
  try {
    return JSON.parse(dataStr);
  } catch (e) {
    return defaultVehicles;
  }
}

function saveMockVehicles(vehicles: any[]) {
  if (isBrowser) {
    localStorage.setItem("mock_vehicles", JSON.stringify(vehicles));
  }
}

function getMockExpenses(): any[] {
  const dataStr = getLocalStorageItem("mock_expenses", JSON.stringify(defaultExpenses));
  try {
    return JSON.parse(dataStr);
  } catch (e) {
    return defaultExpenses;
  }
}

function saveMockExpenses(expenses: any[]) {
  if (isBrowser) {
    localStorage.setItem("mock_expenses", JSON.stringify(expenses));
  }
}

// Token helper functions
export function setAuthToken(token: string) {
  if (isBrowser) {
    localStorage.setItem("access_token", token);
  }
}

export function removeAuthToken() {
  if (isBrowser) {
    localStorage.removeItem("access_token");
  }
}

// ============================================================================
// AUTH API
// ============================================================================
export const authApi = {
  async login(email: string, password?: string) {
    setAuthToken("mock-jwt-token-12345");
    return { access_token: "mock-jwt-token-12345" };
  },

  async register(userData: any) {
    return { success: true, user: userData };
  },

  async getCurrentUser() {
    return {
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@teamtitans.com",
      role: "admin"
    };
  },

  async refreshToken() {
    return { access_token: "mock-jwt-token-12345-refreshed" };
  },

  logout() {
    removeAuthToken();
  }
};

// ============================================================================
// VEHICLES API
// ============================================================================
export const vehiclesApi = {
  async getAll(params: any = {}) {
    let list = getMockVehicles();

    if (params.status) {
      list = list.filter(v => v.status === params.status);
    }
    if (params.vehicle_type) {
      list = list.filter(v => v.vehicle_type === params.vehicle_type);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(v => 
        (v.license_plate && v.license_plate.toLowerCase().includes(q)) ||
        (v.make && v.make.toLowerCase().includes(q)) ||
        (v.model && v.model.toLowerCase().includes(q))
      );
    }

    return list;
  },

  async getById(id: any) {
    const list = getMockVehicles();
    const vehicle = list.find(v => v.id === Number(id));
    if (!vehicle) throw new Error("Vehicle not found");
    return vehicle;
  },

  async create(data: any) {
    const list = getMockVehicles();
    const newId = list.length > 0 ? Math.max(...list.map(v => v.id)) + 1 : 1;
    const newVehicle = {
      id: newId,
      license_plate: data.license_plate,
      make: data.make || "Unknown",
      model: data.model || "Unknown",
      year: data.year || new Date().getFullYear(),
      vehicle_type: data.vehicle_type || "truck",
      fuel_type: data.fuel_type || "diesel",
      max_load_capacity_kg: data.max_load_capacity_kg || null,
      current_odometer_km: data.current_odometer_km || 0,
      status: "idle" // default status for new vehicles
    };
    list.push(newVehicle);
    saveMockVehicles(list);
    return newVehicle;
  },

  async update(id: any, data: any) {
    const list = getMockVehicles();
    const index = list.findIndex(v => v.id === Number(id));
    if (index === -1) throw new Error("Vehicle not found");
    
    list[index] = {
      ...list[index],
      license_plate: data.license_plate ?? list[index].license_plate,
      make: data.make ?? list[index].make,
      model: data.model ?? list[index].model,
      year: data.year ?? list[index].year,
      vehicle_type: data.vehicle_type ?? list[index].vehicle_type,
      fuel_type: data.fuel_type ?? list[index].fuel_type,
      max_load_capacity_kg: data.max_load_capacity_kg ?? list[index].max_load_capacity_kg,
      current_odometer_km: data.current_odometer_km ?? list[index].current_odometer_km,
      status: data.status ?? list[index].status
    };
    saveMockVehicles(list);
    return list[index];
  },

  async delete(id: any) {
    let list = getMockVehicles();
    list = list.filter(v => v.id !== Number(id));
    saveMockVehicles(list);
    return { success: true };
  },

  async getOptions() {
    const list = getMockVehicles();
    return list.map(v => ({
      id: v.id,
      license_plate: v.license_plate,
      label: `${v.license_plate} - ${v.make} ${v.model}`
    }));
  }
};

// ============================================================================
// TRIPS API
// ============================================================================
export const tripsApi = {
  async getAll(params: any = {}) {
    return mockTrips;
  }
};

// ============================================================================
// EXPENSES API
// ============================================================================
export const expensesApi = {
  async getAll() {
    return getMockExpenses();
  },

  async create(data: any) {
    const list = getMockExpenses();
    const newId = list.length > 0 ? Math.max(...list.map(e => e.id)) + 1 : 1;

    // Find driver and distance from mock trips
    let driver_name = "System User";
    let distance_km = 0;
    if (data.trip_id) {
      const trip = mockTrips.find(t => t.id === Number(data.trip_id));
      if (trip) {
        driver_name = trip.driver_name;
        distance_km = trip.distance_km;
      }
    }

    const newExpense = {
      id: newId,
      trip_id: data.trip_id ? Number(data.trip_id) : null,
      vehicle_id: Number(data.vehicle_id),
      expense_type: data.expense_type,
      amount: data.amount,
      description: data.description || "",
      expense_date: data.expense_date,
      driver_name,
      distance_km
    };

    list.push(newExpense);
    saveMockExpenses(list);
    return newExpense;
  }
};

// ============================================================================
// ANALYTICS API
// ============================================================================
export const analyticsApi = {
  async getDashboardKPIs() {
    const list = getMockVehicles();
    return {
      total_vehicles: list.length,
      active_vehicles: list.filter(v => v.status === "on_trip" || v.status === "idle").length,
      maintenance_vehicles: list.filter(v => v.status === "maintenance").length
    };
  },

  async getFleetStats() {
    const list = getMockVehicles();
    const total = list.length;
    const in_shop = list.filter(v => v.status === "maintenance").length;
    const on_trip = list.filter(v => v.status === "on_trip").length;
    const idle = list.filter(v => v.status === "idle").length;
    
    return {
      vehicles: {
        total,
        by_status: {
          in_shop,
          on_trip,
          idle
        }
      },
      trips: {
        by_status: {
          scheduled: Math.max(0, total - in_shop)
        }
      }
    };
  }
};

export default {
  auth: authApi,
  vehicles: vehiclesApi,
  trips: tripsApi,
  expenses: expensesApi,
  analytics: analyticsApi
};
