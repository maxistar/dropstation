import { defineStore } from 'pinia';
import type { BackendTsDevice, BackendTsPoint } from '~/composables/useBackendTsApi';
import { useBackendTsApi } from '~/composables/useBackendTsApi';

// Define the types for your state
type Device = BackendTsDevice;

interface Capacitor {
    id: number;
    type: string;
    // Add other fields as needed
}

interface Place {
    id: number;
    location: string;
    // Add other fields as needed
}

type Point = BackendTsPoint;

interface DeviceStoreState {
    devices: Device[];
    capacitors: Capacitor[];
    places: Place[];
    points: Point[];
}

export const useDeviceStore = defineStore('deviceStore', {
    state: ():  DeviceStoreState => ({
        devices: [] as Device[],
        capacitors: [] as Capacitor[],
        places: [] as Place[],
        points: [] as Point[],
    }),
    getters: {
        getDevices:(state) => state.devices,
        getCapacitors:(state) => state.capacitors,
        getPlaces:(state) => state.places,
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
            const data  = await $fetch<Capacitor[]>('/api/capacitors');
            this.capacitors = data;
            return data;
        },

        async fetchPlaces () {
            const data  = await $fetch<Place[]>('/api/places');
            this.places = data;
            return data;
        },

        async fetchPoints () {
            const api = useBackendTsApi();
            const data  = await api.listPoints();
            this.points = data;
            return data;
        },
        
        async createDevice (name: string, notes: string, deviceKey: string) {
            const api = useBackendTsApi();
            await api.createDevice({ name, notes, deviceKey });
            await this.fetchDevices();
        },

        async updateDevice (id: number, name: string, notes: string, deviceKey: string) {
            const api = useBackendTsApi();
            await api.updateDevice(id, { name, notes, deviceKey });
            await this.fetchDevices();
        },

        async deleteDevice (id: number) {
            const api = useBackendTsApi();
            await api.deleteDevice(id);
            await this.fetchDevices();
        },
    },
 });
