import { defineStore } from 'pinia';
import {ref} from 'vue';

export const useDeviceStore = defineStore('deviceStore', {
    state: () => ({
        devices: [],
        capacitors: [],
        places: [],
        points: [],
    }),
    getters: {
        getDevices:(state) => state.devices,
        getCapacitors:(state) => state.capacitors,
        getPlaces:(state) => state.places,
        getPoints:(state) => state.points,
    },
    actions: {
        async fetchDevices () {
            const data  = await $fetch('/api/devices');
            this.devices = data;
            return data;
        },

        async fetchCapacitors () {
            const data  = await $fetch('/api/capacitors');
            this.capacitors = data;
            return data;
        },

        async fetchPlaces () {
            const data  = await $fetch('/api/places');
            this.places = data;
            return data;
        },

        async fetchPoints () {
            const data  = await $fetch('/api/points');
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
