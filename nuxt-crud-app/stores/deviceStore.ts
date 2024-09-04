import { defineStore } from 'pinia';

// Define the types for your state
interface Device {
    id: number;
    name: string;
    // Add other fields as needed
}

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

interface Point {
    id: number;
    value: string;
    // Add other fields as needed
}

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
            const data  = await $fetch<Device[]>('/api/devices');
            this.devices = data;
            return data;
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
            const data  = await $fetch<Point[]>('/api/points');
            this.points = data;
            return data;
        },
        
        async createDevice (name: string, notes: string, deviceKey: string) {
            await $fetch('/api/devices/create', {
                method: 'POST',
                body: { name, notes, deviceKey },
            });
            await this.fetchDevices();
        },

        async updateDevice (id: number, name: string, notes: string, deviceKey: string) {
            await $fetch('/api/devices/update', {
                method: 'POST',
                body: { id, name, notes, deviceKey },
            });
            await this.fetchDevices();
        },

        async deleteDevice (id: number) {
            await $fetch(`/api/devices/delete?id=${id}`, {
                method: 'DELETE',
            });
            await this.fetchDevices();
        },
    },
 });
