from enum import Enum

class VehicleStatus(str, Enum):
    idle = "idle"
    on_trip = "on_trip"
    in_shop = "in_shop"
    retired = "retired"

class VehicleType(str, Enum):
    truck = "truck"
    trailer = "trailer"
    van = "van"
    mini = "mini"
    tanker = "tanker"
    refrigerated = "refrigerated"
    flatbed = "flatbed"
    other = "other"

class FuelType(str, Enum):
    diesel = "diesel"
    petrol = "petrol"
    cng = "cng"
    electric = "electric"
    hybrid = "hybrid"

class TripStatus(str, Enum):
    scheduled = "scheduled"
    in_transit = "in_transit"
    delivered = "delivered"
    cancelled = "cancelled"

class MaintenanceStatus(str, Enum):
    new = "new"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"

class ServiceType(str, Enum):
    oil_change = "oil_change"
    tire_replacement = "tire_replacement"
    engine_repair = "engine_repair"
    brake_service = "brake_service"
    general_inspection = "general_inspection"
    electrical = "electrical"
    body_work = "body_work"
    other = "other"

class ExpenseType(str, Enum):
    fuel = "fuel"
    toll = "toll"
    parking = "parking"
    maintenance = "maintenance"
    fine = "fine"
    loading_unloading = "loading_unloading"
    misc = "misc"

class DutyStatus(str, Enum):
    on_duty = "on_duty"
    off_duty = "off_duty"
    on_break = "on_break"
    suspended = "suspended"

class ComplaintType(str, Enum):
    late_delivery = "late_delivery"
    reckless_driving = "reckless_driving"
    cargo_damage = "cargo_damage"
    misconduct = "misconduct"
    vehicle_misuse = "vehicle_misuse"
    other = "other"

class SeverityLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class ComplaintStatus(str, Enum):
    open = "open"
    investigating = "investigating"
    resolved = "resolved"
    dismissed = "dismissed"

class DocumentType(str, Enum):
    insurance = "insurance"
    registration = "registration"
    fitness_certificate = "fitness_certificate"
    permit = "permit"
    pollution_certificate = "pollution_certificate"
