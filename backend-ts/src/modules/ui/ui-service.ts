import type { DatabaseContext } from "../../db/index.js";
import { createUiRepositories } from "./ui-repositories.js";
import type {
  CreateUiCapacitorInput,
  CreateUiDeviceInput,
  CreateUiPlantInput,
  CreateUiPlaceInput,
  CreateUiPointInput,
  DashboardPlantRecord,
  DashboardPlantView,
  DashboardTankRecord,
  DashboardTankView,
  UiCapacitorRecord,
  UiCapacitorView,
  UiDeviceRecord,
  UiPlantRecord,
  UiPlantView,
  UiPointRecord,
  UiPlaceRecord,
  UiPlaceView,
  UiPointView,
  UiDeviceView,
  UpdateUiCapacitorInput,
  UpdateUiDeviceInput,
  UpdateUiPlantInput,
  UpdateUiPlaceInput,
  UpdateUiPointInput,
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

  public async getPoint(id: number): Promise<UiPointView> {
    const point = await this.repositories.findPointById(id);

    if (!point) {
      throw new Error("Point not found");
    }

    return this.toPointView(point);
  }

  public async listCapacitors(): Promise<UiCapacitorView[]> {
    const capacitors = await this.repositories.listCapacitors();
    return capacitors.map((capacitor) => this.toCapacitorView(capacitor));
  }

  public async getCapacitor(id: number): Promise<UiCapacitorView> {
    const capacitor = await this.repositories.findCapacitorById(id);

    if (!capacitor) {
      throw new Error("Capacitor not found");
    }

    return this.toCapacitorView(capacitor);
  }

  public async listPlaces(): Promise<UiPlaceView[]> {
    const places = await this.repositories.listPlaces();
    return places.map((place) => this.toPlaceView(place));
  }

  public async getPlace(id: number): Promise<UiPlaceView> {
    const place = await this.repositories.findPlaceById(id);

    if (!place) {
      throw new Error("Place not found");
    }

    return this.toPlaceView(place);
  }

  public async listPlants(): Promise<UiPlantView[]> {
    const plants = await this.repositories.listPlants();
    return plants.map((plant) => this.toPlantView(plant));
  }

  public async getPlant(id: number): Promise<UiPlantView> {
    const plant = await this.repositories.findPlantById(id);

    if (!plant) {
      throw new Error("Plant not found");
    }

    return this.toPlantView(plant);
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

  public async createCapacitor(input: CreateUiCapacitorInput): Promise<UiCapacitorView> {
    const createdId = await this.database.withTransaction(async (connection) => {
      return this.repositories.createCapacitor(connection, input);
    });

    return this.getCapacitor(createdId);
  }

  public async updateCapacitor(input: UpdateUiCapacitorInput): Promise<UiCapacitorView> {
    const existing = await this.repositories.findCapacitorById(input.id);

    if (!existing) {
      throw new Error("Capacitor not found");
    }

    await this.database.withTransaction(async (connection) => {
      await this.repositories.updateCapacitor(connection, input);
    });

    return this.getCapacitor(input.id);
  }

  public async deleteCapacitor(id: number): Promise<void> {
    const deleted = await this.database.withTransaction(async (connection) => {
      return this.repositories.deleteCapacitor(connection, id);
    });

    if (!deleted) {
      throw new Error("Capacitor not found");
    }
  }

  public async createPoint(input: CreateUiPointInput): Promise<UiPointView> {
    const createdId = await this.database.withTransaction(async (connection) => {
      return this.repositories.createPoint(connection, input);
    });

    return this.getPoint(createdId);
  }

  public async updatePoint(input: UpdateUiPointInput): Promise<UiPointView> {
    const existing = await this.repositories.findPointById(input.id);

    if (!existing) {
      throw new Error("Point not found");
    }

    await this.database.withTransaction(async (connection) => {
      await this.repositories.updatePoint(connection, input);
    });

    return this.getPoint(input.id);
  }

  public async deletePoint(id: number): Promise<void> {
    const deleted = await this.database.withTransaction(async (connection) => {
      return this.repositories.deletePoint(connection, id);
    });

    if (!deleted) {
      throw new Error("Point not found");
    }
  }

  public async createPlace(input: CreateUiPlaceInput): Promise<UiPlaceView> {
    const createdId = await this.database.withTransaction(async (connection) => {
      return this.repositories.createPlace(connection, input);
    });

    return this.getPlace(createdId);
  }

  public async updatePlace(input: UpdateUiPlaceInput): Promise<UiPlaceView> {
    const existing = await this.repositories.findPlaceById(input.id);

    if (!existing) {
      throw new Error("Place not found");
    }

    await this.database.withTransaction(async (connection) => {
      await this.repositories.updatePlace(connection, input);
    });

    return this.getPlace(input.id);
  }

  public async deletePlace(id: number): Promise<void> {
    const deleted = await this.database.withTransaction(async (connection) => {
      return this.repositories.deletePlace(connection, id);
    });

    if (!deleted) {
      throw new Error("Place not found");
    }
  }

  public async createPlant(input: CreateUiPlantInput): Promise<UiPlantView> {
    const createdId = await this.database.withTransaction(async (connection) => {
      return this.repositories.createPlant(connection, input);
    });

    return this.getPlant(createdId);
  }

  public async updatePlant(input: UpdateUiPlantInput): Promise<UiPlantView> {
    const existing = await this.repositories.findPlantById(input.id);

    if (!existing) {
      throw new Error("Plant not found");
    }

    await this.database.withTransaction(async (connection) => {
      await this.repositories.updatePlant(connection, input);
    });

    return this.getPlant(input.id);
  }

  public async deletePlant(id: number): Promise<void> {
    const deleted = await this.database.withTransaction(async (connection) => {
      return this.repositories.deletePlant(connection, id);
    });

    if (!deleted) {
      throw new Error("Plant not found");
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
      placeId: device.placeId,
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

  private toCapacitorView(capacitor: UiCapacitorRecord): UiCapacitorView {
    return {
      id: capacitor.id,
      userId: capacitor.userId,
      capacity: capacitor.capacity,
      value: capacitor.value,
    };
  }

  private toPlaceView(place: UiPlaceRecord): UiPlaceView {
    return {
      id: place.id,
      userId: place.userId,
      index: place.index,
      name: place.name.trim() || `Place ${place.id}`,
    };
  }

  private toPlantView(plant: UiPlantRecord): UiPlantView {
    return {
      id: plant.id,
      userId: plant.userId,
      name: plant.name.trim() || `Plant ${plant.id}`,
      species: plant.species?.trim() || "",
      location: plant.location?.trim() || "",
      targetHumidityMin: plant.targetHumidityMin,
      targetHumidityMax: plant.targetHumidityMax,
      targetWateringDurationSec: plant.targetWateringDurationSec,
      active: plant.active,
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
