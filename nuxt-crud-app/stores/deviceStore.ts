import { defineStore } from 'pinia';
import type {
    BackendTsCapacitor,
    BackendTsDevice,
    BackendTsPlace,
    BackendTsPlant,
    BackendTsPoint,
} from '~/composables/useBackendTsApi';
import { useBackendTsApi } from '~/composables/useBackendTsApi';

// Define the types for your state
type Device = BackendTsDevice;

type Capacitor = BackendTsCapacitor;
type Place = BackendTsPlace;
type Plant = BackendTsPlant;

type Point = BackendTsPoint;

interface DeviceStoreState {
    devices: Device[];
    capacitors: Capacitor[];
    places: Place[];
    plants: Plant[];
    points: Point[];
}

export const useDeviceStore = defineStore('deviceStore', {
    state: ():  DeviceStoreState => ({
        devices: [] as Device[],
        capacitors: [] as Capacitor[],
        places: [] as Place[],
        plants: [] as Plant[],
        points: [] as Point[],
    }),
    getters: {
        getDevices:(state) => state.devices,
        getCapacitors:(state) => state.capacitors,
        getPlaces:(state) => state.places,
        getPlants:(state) => state.plants,
        getPoints:(state) => state.points,
    },
    actions: {
        async fetchDevices () {
            const api = useBackendTsApi();
            const data  = await api.listDevices();
            this.devices = data;
            return data;
        },

        async fetchDevice (id: number) {
            const api = useBackendTsApi();
            return api.getDevice(id);
        },

        async fetchCapacitors () {
            const api = useBackendTsApi();
            const data  = await api.listCapacitors();
            this.capacitors = data;
            return data;
        },

        async fetchCapacitor (id: number) {
            const api = useBackendTsApi();
            return api.getCapacitor(id);
        },

        async fetchPlaces () {
            const api = useBackendTsApi();
            const data  = await api.listPlaces();
            this.places = data;
            return data;
        },

        async fetchPlace (id: number) {
            const api = useBackendTsApi();
            return api.getPlace(id);
        },

        async fetchPoints () {
            const api = useBackendTsApi();
            const data  = await api.listPoints();
            this.points = data;
            return data;
        },

        async fetchPlants () {
            const api = useBackendTsApi();
            const data  = await api.listPlants();
            this.plants = data;
            return data;
        },

        async fetchPoint (id: number) {
            const api = useBackendTsApi();
            return api.getPoint(id);
        },

        async fetchPlant (id: number) {
            const api = useBackendTsApi();
            return api.getPlant(id);
        },
        
        async createDevice (input: {
            name?: string;
            notes?: string;
            deviceKey: string;
            sleepDuration: number;
            activityNumber: number;
            checkInterval: number;
        }) {
            const api = useBackendTsApi();
            await api.createDevice(input);
            await this.fetchDevices();
        },

        async updateDevice (id: number, input: {
            name?: string;
            notes?: string;
            deviceKey: string;
            sleepDuration: number;
            activityNumber: number;
            checkInterval: number;
        }) {
            const api = useBackendTsApi();
            await api.updateDevice(id, input);
            await this.fetchDevices();
        },

        async deleteDevice (id: number) {
            const api = useBackendTsApi();
            await api.deleteDevice(id);
            await this.fetchDevices();
        },

        async createCapacitor (capacity: number, value: number, userId?: number) {
            const api = useBackendTsApi();
            await api.createCapacitor({ capacity, value, userId });
            await this.fetchCapacitors();
        },

        async updateCapacitor (id: number, capacity: number, value: number, userId?: number) {
            const api = useBackendTsApi();
            await api.updateCapacitor(id, { capacity, value, userId });
            await this.fetchCapacitors();
        },

        async deleteCapacitor (id: number) {
            const api = useBackendTsApi();
            await api.deleteCapacitor(id);
            await this.fetchCapacitors();
        },

        async createPlace (index: number, name: string, userId?: number) {
            const api = useBackendTsApi();
            await api.createPlace({ index, name, userId });
            await this.fetchPlaces();
        },

        async updatePlace (id: number, index: number, name: string, userId?: number) {
            const api = useBackendTsApi();
            await api.updatePlace(id, { index, name, userId });
            await this.fetchPlaces();
        },

        async deletePlace (id: number) {
            const api = useBackendTsApi();
            await api.deletePlace(id);
            await this.fetchPlaces();
        },

        async createPlant (input: {
            userId?: number;
            name: string;
            species?: string;
            location?: string;
            targetHumidityMin?: number | null;
            targetHumidityMax?: number | null;
            targetWateringDurationSec?: number | null;
            active?: boolean;
        }) {
            const api = useBackendTsApi();
            await api.createPlant(input);
            await this.fetchPlants();
        },

        async updatePlant (id: number, input: {
            userId?: number;
            name: string;
            species?: string;
            location?: string;
            targetHumidityMin?: number | null;
            targetHumidityMax?: number | null;
            targetWateringDurationSec?: number | null;
            active?: boolean;
        }) {
            const api = useBackendTsApi();
            await api.updatePlant(id, input);
            await this.fetchPlants();
        },

        async deletePlant (id: number) {
            const api = useBackendTsApi();
            await api.deletePlant(id);
            await this.fetchPlants();
        },

        async createPoint (input: {
            userId?: number;
            deviceId: number;
            plantId?: number | null;
            capacityId?: number | null;
            index: number;
            address?: string;
            status?: string;
            humidity?: number | null;
            notes?: string;
            wateringType: number;
            wateringValue: number;
            wateringHour: number;
        }) {
            const api = useBackendTsApi();
            await api.createPoint(input);
            await this.fetchPoints();
        },

        async updatePoint (id: number, input: {
            userId?: number;
            deviceId: number;
            plantId?: number | null;
            capacityId?: number | null;
            index: number;
            address?: string;
            status?: string;
            humidity?: number | null;
            notes?: string;
            wateringType: number;
            wateringValue: number;
            wateringHour: number;
        }) {
            const api = useBackendTsApi();
            await api.updatePoint(id, input);
            await this.fetchPoints();
        },

        async deletePoint (id: number) {
            const api = useBackendTsApi();
            await api.deletePoint(id);
            await this.fetchPoints();
        },
    },
 });
