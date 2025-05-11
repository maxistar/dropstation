import { definePageMeta, useAuth } from "#imports";
import { set } from "nuxt/dist/app/compat/capi";

interface AuthStoreState {
    loggedIn: boolean;
}

export const useAuthStore = defineStore('authStore', {
    state: ():  AuthStoreState => ({
        loggedIn: false,
    }),
    getters: {
        getLoggedIn:(state) => state.loggedIn,
    },
    actions: {
        async login () {        
            // await (await useAuth()).signIn();
            this.loggedIn = true;
            navigateTo('/')
        },

        async logout () {
            // await (await useAuth()).signOut();
            this.loggedIn = false;
            navigateTo('/login')
        },
        setLoggedIn (loggedIn: boolean) {
            this.loggedIn = loggedIn;
        }
    },
 });