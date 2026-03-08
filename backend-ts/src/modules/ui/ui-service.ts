import type { DatabaseContext } from "../../db/index.js";
import { createUiRepositories } from "./ui-repositories.js";
import type {
  CreateUiDeviceInput,
  DashboardPlantRecord,
  DashboardPlantView,
  DashboardTankRecord,
  DashboardTankView,
  UiDeviceRecord,
  UiPointRecord,
  UiPointView,
  UiDeviceView,
  UpdateUiDeviceInput,
} from "./ui-types.js";

export class UiService {
  private readonly repositories;

  public constructor(private readonly database: DatabaseContext) {
    this.repositories = createUiRepositories(database.pool);
  }

  public async listDevices(): Promise<UiDeviceView[]> {
    const devices = await this.repositories.listDevices();
    return devices.map((device) => this.toDeviceView(device));
  }

  public async getDevice(id: number): Promise<UiDeviceView> {
    const device = await this.repositories.findDeviceById(id);

    if (!device) {
      throw new Error("Device not found");
    }

    return this.toDeviceView(device);
  }

  public async listPoints(): Promise<UiPointView[]> {
    const points = await this.repositories.listPoints();
    return points.map((point) => this.toPointView(point));
  }

  public async createDevice(input: CreateUiDeviceInput): Promise<UiDeviceView> {
    const createdId = await this.database.withTransaction(async (connection) => {
      return this.repositories.createDevice(connection, input);
    });

    return this.getDevice(createdId);
  }

  public async updateDevice(input: UpdateUiDeviceInput): Promise<UiDeviceView> {
    const existing = await this.repositories.findDeviceById(input.id);

    if (!existing) {
      throw new Error("Device not found");
    }

    await this.database.withTransaction(async (connection) => {
      await this.repositories.updateDevice(connection, input);
    });

    return this.getDevice(input.id);
  }

  public async deleteDevice(id: number): Promise<void> {
    const deleted = await this.database.withTransaction(async (connection) => {
      return this.repositories.deleteDevice(connection, id);
    });

    if (!deleted) {
      throw new Error("Device not found");
    }
  }

  public async listDashboardPlants(): Promise<DashboardPlantView[]> {
    const plants = await this.repositories.listDashboardPlants();
    return plants.map((plant) => this.toDashboardPlantView(plant));
  }

  public async getDashboardTank(): Promise<DashboardTankView> {
    const tank = await this.repositories.getDashboardTank();
    if (!tank) {
      throw new Error("Dashboard tank not found");
    }

    return this.toDashboardTankView(tank);
  }

  public async waterDashboardPlant(plantId: number, duration: number): Promise<void> {
    const watered = await this.database.withTransaction(async (connection) => {
      return this.repositories.waterPlant(connection, plantId, duration);
    });

    if (!watered) {
      throw new Error("Plant not found");
    }
  }

  private toDeviceView(device: UiDeviceRecord): UiDeviceView {
    return {
      id: device.id,
      name: buildDeviceName(device),
      notes: device.notes ?? "",
      deviceKey: device.deviceKey,
      lastAccess: device.lastAccess,
      battery: device.battery,
      sleepDuration: device.sleepDuration,
      activityNumber: device.activityNumber,
      recentEventTime: device.recentEventTime,
      recentEventId: device.recentEventId,
      checkInterval: device.checkInterval,
    };
  }

  private toPointView(point: UiPointRecord): UiPointView {
    return {
      id: point.id,
      name: buildPointName(point),
      deviceId: point.deviceId,
      plantId: point.plantId,
      capacityId: point.capacityId,
      index: point.index,
      address: point.address,
      status: point.status ?? "",
      humidity: point.humidity,
      lastWatering: point.lastWatering,
      notes: point.notes ?? "",
      wateringType: point.wateringType,
      wateringValue: point.wateringValue,
      wateringHour: point.wateringHour,
    };
  }

  private toDashboardPlantView(plant: DashboardPlantRecord): DashboardPlantView {
    const optimalMin = Math.round(plant.targetHumidityMin ?? 40);
    const optimalMax = Math.round(plant.targetHumidityMax ?? 70);
    const soilHumidity = Math.round(plant.soilHumidity ?? 0);
    const normalizedDuration = Math.max(1, Math.round(plant.wateringDuration ?? 30));
    const fallbackTimestamp = "1970-01-01T00:00:00.000Z";

    return {
      id: plant.id,
      name: plant.name || `Plant ${plant.id}`,
      type: plant.type?.trim() || "Plant",
      location: plant.location?.trim() || "Unknown",
      soilHumidity,
      lastWatered: plant.lastWatered ? toIsoString(plant.lastWatered) : fallbackTimestamp,
      wateringDuration: normalizedDuration,
      status: classifyStatus(soilHumidity, optimalMin, optimalMax),
      image: buildPlantImageUrl(plant.id),
      optimalHumidity: {
        min: optimalMin,
        max: optimalMax,
      },
    };
  }

  private toDashboardTankView(tank: DashboardTankRecord): DashboardTankView {
    const capacity = Math.max(1, Math.round(tank.capacityMl / 1000));
    const currentLevel = Math.max(0, Math.round(tank.currentLevelMl / 1000));
    const ratio = currentLevel / capacity;
    const status: DashboardTankView["status"] = ratio <= 0.25 ? "low" : ratio >= 0.8 ? "full" : "medium";

    return {
      id: tank.id,
      capacity,
      currentLevel,
      lastRefilled: tank.lastRefilledAt ? toIsoString(tank.lastRefilledAt) : "1970-01-01T00:00:00.000Z",
      status,
    };
  }
}

function buildDeviceName(device: UiDeviceRecord): string {
  const trimmedNotes = device.notes?.trim();
  if (trimmedNotes) {
    return trimmedNotes;
  }

  return `Device ${device.id}`;
}

function buildPointName(point: UiPointRecord): string {
  if (point.address?.trim()) {
    return point.address;
  }

  return `Point ${point.deviceId}.${point.index}`;
}

function classifyStatus(
  humidity: number,
  optimalMin: number,
  optimalMax: number,
): DashboardPlantView["status"] {
  if (humidity < optimalMin) {
    return "dry";
  }

  if (humidity > optimalMax) {
    return "wet";
  }

  return "optimal";
}

function buildPlantImageUrl(id: number): string {
  return `https://images.pexels.com/photos/6208086/pexels-photo-6208086.jpeg?auto=compress&cs=tinysrgb&w=400&plant=${id}`;
}

function toIsoString(value: unknown): string {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return "1970-01-01T00:00:00.000Z";
    }
    return value.toISOString();
  }

  if (typeof value !== "string") {
    return "1970-01-01T00:00:00.000Z";
  }

  const normalized = value.includes("T")
    ? value
    : value.replace(" ", "T");
  const withTimezone = /Z$|[+-]\d{2}:\d{2}$/.test(normalized)
    ? normalized
    : `${normalized}Z`;
  const parsed = new Date(withTimezone);
  if (Number.isNaN(parsed.getTime())) {
    return "1970-01-01T00:00:00.000Z";
  }

  return parsed.toISOString();
}
