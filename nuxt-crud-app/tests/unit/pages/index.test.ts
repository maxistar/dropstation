import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import IndexPage from '../../pages/index.vue'
import { afterEach } from 'node:test'
import { createTestingPinia } from '@pinia/testing'

describe('IndexPage', () => {
    afterEach(() => {
        vi.unstubAllGlobals()
    })
    it('renders the home page', () => {

        expect(IndexPage).toBeTruthy()
        const pinia = createTestingPinia({
            createSpy: vi.fn,
          })
        const wrapper = mount(IndexPage)
        expect(wrapper.html()).not.toContain('Login')
        // const wrapper = mount(IndexPage, {
        //     global: {
        //         mocks: {
        //             user: {
        //                 data: {
        //                     first_name: 'John'
        //                 }
        //             },
        //             signOut: vi.fn()
        //         }
        //     }
        // })
        // expect(wrapper.html()).toContain('Home Page')
    })

    it('displays user first name when user is logged in', () => {
        // const wrapper = mount(IndexPage, {
        //     global: {
        //         mocks: {
        //             user: {
        //                 data: {
        //                     first_name: 'John'
        //                 }
        //             },
        //             signOut: vi.fn()
        //         }
        //     }
        // })
        // expect(wrapper.html()).toContain('Hello John')
    })

    it('calls signOut method when Sign Out button is clicked', async () => {
        // const signOutMock = vi.fn()
        // const wrapper = mount(IndexPage, {
        //     global: {
        //         mocks: {
        //             user: {
        //                 data: {
        //                     first_name: 'John'
        //                 }
        //             },
        //             signOut: signOutMock
        //         }
        //     }
        // })
        // await wrapper.find('v-btn').trigger('click')
        // expect(signOutMock).toHaveBeenCalled()
    })
})
