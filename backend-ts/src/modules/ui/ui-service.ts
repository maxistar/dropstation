import type { DatabaseContext } from "../../db/index.js";
import { createUiRepositories } from "./ui-repositories.js";
import type {
  CreateUiDeviceInput,
  UiDeviceRecord,
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
}

function buildDeviceName(device: UiDeviceRecord): string {
  const trimmedNotes = device.notes?.trim();
  if (trimmedNotes) {
    return trimmedNotes;
  }

  return `Device ${device.id}`;
}
