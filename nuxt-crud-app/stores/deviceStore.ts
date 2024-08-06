import { defineStore } from 'pinia';
import {ref} from 'vue';

export const useDeviceStore = defineStore('deviceStore', {
    state: () => ({
        devices: []
    }),
    getters: {
        getDevices:(state) => state.devices,
    },
    actions: {
        async fetchDevices () {
            const data  = await $fetch('/api/devices');
            this.devices = data;
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
