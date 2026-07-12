/**
 * Mock TransitOps API Client
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
    return {
      vehicle_types: ["truck", "van", "trailer", "tanker", "pickup", "bus", "other"],
      fuel_types: ["diesel", "petrol", "cng", "electric", "hybrid"]
    };
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
          scheduled: Math.max(0, total - in_shop) // realistic mock
        }
      }
    };
  }
};

export default {
  auth: authApi,
  vehicles: vehiclesApi,
  analytics: analyticsApi
};
