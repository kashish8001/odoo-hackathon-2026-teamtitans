-- ============================================================
-- FleetFlow: Modular Fleet & Logistics Management System
-- Database Schema (PostgreSQL) — Normalized (3NF), Lean
-- Version: 3.0
-- ============================================================

-- ============================================================
-- ENUM TYPES (13)
-- ============================================================

CREATE TYPE user_role           AS ENUM ('admin', 'manager', 'dispatcher', 'driver', 'viewer');
CREATE TYPE vehicle_status      AS ENUM ('idle', 'on_trip', 'in_shop', 'retired');
CREATE TYPE vehicle_type        AS ENUM ('truck', 'trailer', 'van', 'mini', 'tanker', 'refrigerated', 'flatbed', 'other');
CREATE TYPE fuel_type           AS ENUM ('diesel', 'petrol', 'cng', 'electric', 'hybrid');
CREATE TYPE trip_status         AS ENUM ('scheduled', 'in_transit', 'delivered', 'cancelled');
CREATE TYPE maintenance_status  AS ENUM ('new', 'in_progress', 'completed', 'cancelled');
CREATE TYPE service_type        AS ENUM ('oil_change', 'tire_replacement', 'engine_repair', 'brake_service', 'general_inspection', 'electrical', 'body_work', 'other');
CREATE TYPE expense_type        AS ENUM ('fuel', 'toll', 'parking', 'maintenance', 'fine', 'loading_unloading', 'misc');
CREATE TYPE duty_status         AS ENUM ('on_duty', 'off_duty', 'on_break', 'suspended');
CREATE TYPE complaint_type      AS ENUM ('late_delivery', 'reckless_driving', 'cargo_damage', 'misconduct', 'vehicle_misuse', 'other');
CREATE TYPE severity_level      AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE complaint_status    AS ENUM ('open', 'investigating', 'resolved', 'dismissed');
CREATE TYPE document_type       AS ENUM ('insurance', 'registration', 'fitness_certificate', 'permit', 'pollution_certificate');


-- ============================================================
-- 1. USERS
-- ============================================================

CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    role            user_role       NOT NULL DEFAULT 'viewer',
    first_name      VARCHAR(100)    NOT NULL,
    last_name       VARCHAR(100)    NOT NULL
);

CREATE INDEX idx_users_role ON users(role);


-- ============================================================
-- 2. VEHICLES
-- ============================================================

CREATE TABLE vehicles (
    id                      SERIAL PRIMARY KEY,
    license_plate           VARCHAR(20)     NOT NULL UNIQUE,
    make                    VARCHAR(100)    NOT NULL,
    model                   VARCHAR(100)    NOT NULL,
    year                    SMALLINT        NOT NULL CHECK (year BETWEEN 1900 AND 2100),
    vehicle_type            vehicle_type    NOT NULL,
    fuel_type               fuel_type       NOT NULL DEFAULT 'diesel',
    max_load_capacity_kg    DECIMAL(10,2)   NOT NULL CHECK (max_load_capacity_kg > 0),
    current_odometer_km     DECIMAL(12,2)   NOT NULL DEFAULT 0 CHECK (current_odometer_km >= 0),
    status                  vehicle_status  NOT NULL DEFAULT 'idle'
);

CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_type   ON vehicles(vehicle_type);


-- ============================================================
-- 3. DRIVERS
-- ============================================================
-- Derived stats computed in vw_driver_performance (3NF).

CREATE TABLE drivers (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    license_number      VARCHAR(50)     NOT NULL UNIQUE,
    license_expiry      DATE            NOT NULL,
    safety_score        DECIMAL(5,2)    NOT NULL DEFAULT 100.00 CHECK (safety_score BETWEEN 0 AND 100),
    duty_status         duty_status     NOT NULL DEFAULT 'off_duty'
);

CREATE INDEX idx_drivers_duty           ON drivers(duty_status);
CREATE INDEX idx_drivers_license_expiry ON drivers(license_expiry);


-- ============================================================
-- 4. TRIPS
-- ============================================================

CREATE TABLE trips (
    id                      SERIAL PRIMARY KEY,
    vehicle_id              INTEGER         NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    driver_id               INTEGER         NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
    cargo_weight_kg         DECIMAL(10,2)   NOT NULL CHECK (cargo_weight_kg > 0),
    origin                  VARCHAR(500)    NOT NULL,
    destination             VARCHAR(500)    NOT NULL,
    distance_km             DECIMAL(10,2)   CHECK (distance_km >= 0),
    revenue                 DECIMAL(14,2)   NOT NULL DEFAULT 0 CHECK (revenue >= 0),
    status                  trip_status     NOT NULL DEFAULT 'scheduled',
    scheduled_departure     TIMESTAMPTZ     NOT NULL,
    actual_arrival          TIMESTAMPTZ
);

CREATE INDEX idx_trips_vehicle   ON trips(vehicle_id);
CREATE INDEX idx_trips_driver    ON trips(driver_id);
CREATE INDEX idx_trips_status    ON trips(status);
CREATE INDEX idx_trips_departure ON trips(scheduled_departure);


-- ============================================================
-- 5. MAINTENANCE_LOGS
-- ============================================================

CREATE TABLE maintenance_logs (
    id                  SERIAL PRIMARY KEY,
    vehicle_id          INTEGER             NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    service_type        service_type        NOT NULL,
    description         TEXT                NOT NULL,
    start_date          DATE,
    completion_date     DATE,
    cost                DECIMAL(12,2)       NOT NULL DEFAULT 0 CHECK (cost >= 0),
    status              maintenance_status  NOT NULL DEFAULT 'new',

    CONSTRAINT chk_maintenance_dates CHECK (
        completion_date IS NULL OR start_date IS NULL OR completion_date >= start_date
    )
);

CREATE INDEX idx_maintenance_vehicle ON maintenance_logs(vehicle_id);
CREATE INDEX idx_maintenance_status  ON maintenance_logs(status);


-- ============================================================
-- 6. EXPENSES
-- ============================================================

CREATE TABLE expenses (
    id                  SERIAL PRIMARY KEY,
    trip_id             INTEGER         REFERENCES trips(id) ON DELETE SET NULL,
    vehicle_id          INTEGER         NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    expense_type        expense_type    NOT NULL,
    amount              DECIMAL(12,2)   NOT NULL CHECK (amount > 0),
    description         VARCHAR(500),
    expense_date        DATE            NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX idx_expenses_trip    ON expenses(trip_id);
CREATE INDEX idx_expenses_vehicle ON expenses(vehicle_id);
CREATE INDEX idx_expenses_type    ON expenses(expense_type);


-- ============================================================
-- 7. FUEL_LOGS
-- ============================================================

CREATE TABLE fuel_logs (
    id                  SERIAL PRIMARY KEY,
    vehicle_id          INTEGER         NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id           INTEGER         REFERENCES drivers(id) ON DELETE SET NULL,
    trip_id             INTEGER         REFERENCES trips(id) ON DELETE SET NULL,
    liters              DECIMAL(8,2)    NOT NULL CHECK (liters > 0),
    cost_per_liter      DECIMAL(8,2)    NOT NULL CHECK (cost_per_liter > 0),
    total_cost          DECIMAL(12,2)   NOT NULL GENERATED ALWAYS AS (liters * cost_per_liter) STORED,
    odometer_at_fill    DECIMAL(12,2)   NOT NULL CHECK (odometer_at_fill >= 0),
    fuel_date           DATE            NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX idx_fuel_vehicle ON fuel_logs(vehicle_id);
CREATE INDEX idx_fuel_trip    ON fuel_logs(trip_id);


-- ============================================================
-- 8. DRIVER_COMPLAINTS
-- ============================================================

CREATE TABLE driver_complaints (
    id                  SERIAL PRIMARY KEY,
    driver_id           INTEGER             NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    trip_id             INTEGER             REFERENCES trips(id) ON DELETE SET NULL,
    complaint_type      complaint_type      NOT NULL,
    description         TEXT                NOT NULL,
    severity            severity_level      NOT NULL DEFAULT 'medium',
    status              complaint_status    NOT NULL DEFAULT 'open',
    reported_by         INTEGER             REFERENCES users(id) ON DELETE SET NULL,
    resolved_at         TIMESTAMPTZ
);

CREATE INDEX idx_complaints_driver ON driver_complaints(driver_id);
CREATE INDEX idx_complaints_status ON driver_complaints(status);


-- ============================================================
-- 9. VEHICLE_DOCUMENTS
-- ============================================================

CREATE TABLE vehicle_documents (
    id                  SERIAL PRIMARY KEY,
    vehicle_id          INTEGER         NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    document_type       document_type   NOT NULL,
    document_number     VARCHAR(100)    NOT NULL,
    issue_date          DATE            NOT NULL,
    expiry_date         DATE            NOT NULL,

    CONSTRAINT chk_doc_dates   CHECK (expiry_date >= issue_date),
    CONSTRAINT uq_vehicle_doc  UNIQUE (vehicle_id, document_type, document_number)
);

CREATE INDEX idx_vdocs_vehicle ON vehicle_documents(vehicle_id);
CREATE INDEX idx_vdocs_expiry  ON vehicle_documents(expiry_date);


-- ============================================================
-- TRIGGERS & FUNCTIONS  (5 functions, 5 triggers)
-- ============================================================

-- Prevent cargo overload ----------------------------------

CREATE OR REPLACE FUNCTION fn_check_cargo_capacity()
RETURNS TRIGGER AS $$
DECLARE
    v_capacity DECIMAL(10,2);
BEGIN
    SELECT max_load_capacity_kg INTO v_capacity
    FROM vehicles WHERE id = NEW.vehicle_id;

    IF NEW.cargo_weight_kg > v_capacity THEN
        RAISE EXCEPTION 'Cargo weight (% kg) exceeds vehicle capacity (% kg)',
            NEW.cargo_weight_kg, v_capacity;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_cargo
    BEFORE INSERT OR UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION fn_check_cargo_capacity();


-- Auto-manage vehicle status on maintenance ---------------

CREATE OR REPLACE FUNCTION fn_maintenance_vehicle_status()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status IN ('new', 'in_progress'))
       OR (TG_OP = 'UPDATE' AND NEW.status IN ('new', 'in_progress')
           AND OLD.status NOT IN ('new', 'in_progress'))
    THEN
        UPDATE vehicles SET status = 'in_shop' WHERE id = NEW.vehicle_id;
    END IF;

    IF TG_OP = 'UPDATE'
       AND NEW.status IN ('completed', 'cancelled')
       AND OLD.status IN ('new', 'in_progress')
    THEN
        UPDATE vehicles SET status = 'idle' WHERE id = NEW.vehicle_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_maintenance_status
    AFTER INSERT OR UPDATE ON maintenance_logs
    FOR EACH ROW EXECUTE FUNCTION fn_maintenance_vehicle_status();


-- Auto-sync vehicle & driver status on trip changes -------

CREATE OR REPLACE FUNCTION fn_trip_status_sync()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'in_transit' AND (OLD IS NULL OR OLD.status != 'in_transit') THEN
        UPDATE vehicles SET status = 'on_trip' WHERE id = NEW.vehicle_id;
        UPDATE drivers  SET duty_status = 'on_duty' WHERE id = NEW.driver_id;
    END IF;

    IF NEW.status IN ('delivered', 'cancelled') AND OLD.status = 'in_transit' THEN
        UPDATE vehicles SET status = 'idle' WHERE id = NEW.vehicle_id;
        UPDATE drivers  SET duty_status = 'off_duty' WHERE id = NEW.driver_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_trip_status_sync
    AFTER INSERT OR UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION fn_trip_status_sync();


-- Block trip if driver license expired or suspended -------

CREATE OR REPLACE FUNCTION fn_check_driver_eligibility()
RETURNS TRIGGER AS $$
DECLARE
    v_expiry DATE;
    v_duty   duty_status;
BEGIN
    SELECT license_expiry, duty_status INTO v_expiry, v_duty
    FROM drivers WHERE id = NEW.driver_id;

    IF v_expiry < CURRENT_DATE THEN
        RAISE EXCEPTION 'Driver license expired on %', v_expiry;
    END IF;
    IF v_duty = 'suspended' THEN
        RAISE EXCEPTION 'Driver is currently suspended';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_driver
    BEFORE INSERT OR UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION fn_check_driver_eligibility();


-- Block trip if vehicle not idle --------------------------

CREATE OR REPLACE FUNCTION fn_check_vehicle_idle()
RETURNS TRIGGER AS $$
DECLARE
    v_status vehicle_status;
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.vehicle_id != OLD.vehicle_id) THEN
        SELECT status INTO v_status FROM vehicles WHERE id = NEW.vehicle_id;
        IF v_status != 'idle' THEN
            RAISE EXCEPTION 'Vehicle is "%" — only idle vehicles can be dispatched', v_status;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_vehicle
    BEFORE INSERT OR UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION fn_check_vehicle_idle();


-- Auto-update vehicle odometer from fuel logs -------------

CREATE OR REPLACE FUNCTION fn_sync_odometer()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE vehicles
    SET current_odometer_km = GREATEST(current_odometer_km, NEW.odometer_at_fill)
    WHERE id = NEW.vehicle_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_odometer
    AFTER INSERT ON fuel_logs
    FOR EACH ROW EXECUTE FUNCTION fn_sync_odometer();


-- ============================================================
-- VIEWS  (Dashboard & Analytics)
-- ============================================================

-- Dashboard KPIs ------------------------------------------

CREATE VIEW vw_dashboard_kpis AS
SELECT
    (SELECT COUNT(*) FROM vehicles WHERE status = 'on_trip')
        AS active_fleet,
    (SELECT COUNT(*) FROM vehicles WHERE status = 'in_shop')
        AS maintenance_alerts,
    (SELECT CASE WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND(COUNT(*) FILTER (WHERE status = 'on_trip') * 100.0 / COUNT(*), 1)
            END
     FROM vehicles WHERE status != 'retired')
        AS utilization_rate,
    (SELECT COUNT(*) FROM trips WHERE status = 'scheduled')
        AS pending_cargo;


-- Vehicle cost summary ------------------------------------

CREATE VIEW vw_vehicle_cost_summary AS
SELECT
    v.id                    AS vehicle_id,
    v.license_plate,
    v.make || ' ' || v.model AS vehicle_name,
    COALESCE(f.total_fuel, 0)       AS total_fuel_cost,
    COALESCE(m.total_maint, 0)      AS total_maintenance_cost,
    COALESCE(f.total_fuel, 0)
        + COALESCE(m.total_maint, 0) AS total_cost,
    COALESCE(t.total_revenue, 0)    AS total_revenue,
    COALESCE(t.total_revenue, 0)
        - COALESCE(f.total_fuel, 0)
        - COALESCE(m.total_maint, 0) AS net_profit,
    CASE WHEN COALESCE(f.total_liters, 0) > 0
         THEN ROUND(COALESCE(t.total_distance, 0) / f.total_liters, 2)
         ELSE 0
    END                              AS km_per_liter
FROM vehicles v
LEFT JOIN (
    SELECT vehicle_id, SUM(total_cost) AS total_fuel, SUM(liters) AS total_liters
    FROM fuel_logs GROUP BY vehicle_id
) f ON f.vehicle_id = v.id
LEFT JOIN (
    SELECT vehicle_id, SUM(cost) AS total_maint
    FROM maintenance_logs WHERE status = 'completed'
    GROUP BY vehicle_id
) m ON m.vehicle_id = v.id
LEFT JOIN (
    SELECT vehicle_id, SUM(revenue) AS total_revenue, SUM(distance_km) AS total_distance
    FROM trips WHERE status = 'delivered'
    GROUP BY vehicle_id
) t ON t.vehicle_id = v.id
WHERE v.status != 'retired';


-- Driver performance (all derived stats computed here) ----

CREATE VIEW vw_driver_performance AS
SELECT
    d.id                    AS driver_id,
    u.first_name || ' ' || u.last_name AS driver_name,
    d.license_number,
    d.license_expiry,
    d.license_expiry < CURRENT_DATE     AS license_expired,
    d.safety_score,
    d.duty_status,
    d.duty_status NOT IN ('on_duty', 'suspended') AS is_available,
    COALESCE(t.total, 0)               AS total_trips,
    COALESCE(t.delivered, 0)            AS completed_trips,
    COALESCE(t.cancelled, 0)            AS cancelled_trips,
    CASE WHEN COALESCE(t.total, 0) > 0
         THEN ROUND(t.delivered * 100.0 / t.total, 2)
         ELSE 100 END                   AS completion_rate,
    COALESCE(c.cnt, 0)                  AS total_complaints
FROM drivers d
JOIN users u ON u.id = d.user_id
LEFT JOIN (
    SELECT driver_id,
           COUNT(*)                                       AS total,
           COUNT(*) FILTER (WHERE status = 'delivered')   AS delivered,
           COUNT(*) FILTER (WHERE status = 'cancelled')   AS cancelled
    FROM trips GROUP BY driver_id
) t ON t.driver_id = d.id
LEFT JOIN (
    SELECT driver_id, COUNT(*) AS cnt
    FROM driver_complaints GROUP BY driver_id
) c ON c.driver_id = d.id;


-- Monthly financial summary -------------------------------

CREATE VIEW vw_monthly_financial_summary AS
SELECT
    DATE_TRUNC('month', t.actual_arrival)::DATE AS month,
    SUM(t.revenue)                              AS total_revenue,
    COALESCE(SUM(f.fuel_cost), 0)               AS total_fuel_cost,
    COALESCE(SUM(m.maint_cost), 0)              AS total_maintenance_cost,
    SUM(t.revenue)
        - COALESCE(SUM(f.fuel_cost), 0)
        - COALESCE(SUM(m.maint_cost), 0)         AS net_profit
FROM trips t
LEFT JOIN (
    SELECT trip_id, SUM(total_cost) AS fuel_cost
    FROM fuel_logs WHERE trip_id IS NOT NULL
    GROUP BY trip_id
) f ON f.trip_id = t.id
LEFT JOIN (
    SELECT vehicle_id, DATE_TRUNC('month', completion_date) AS month, SUM(cost) AS maint_cost
    FROM maintenance_logs WHERE status = 'completed'
    GROUP BY vehicle_id, DATE_TRUNC('month', completion_date)
) m ON m.vehicle_id = t.vehicle_id
   AND m.month = DATE_TRUNC('month', t.actual_arrival)
WHERE t.status = 'delivered' AND t.actual_arrival IS NOT NULL
GROUP BY DATE_TRUNC('month', t.actual_arrival)
ORDER BY month DESC;


-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO users (email, password_hash, role, first_name, last_name)
VALUES ('admin@fleetflow.com', '$2b$10$placeholder_hash_replace_me', 'admin', 'System', 'Admin');
