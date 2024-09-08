import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { it, expect, describe } from 'vitest'
import CapacitorItem from '../../components/CapacitorItem.vue'

describe('AppNumber', () => {
    it('can mount the component', async () => {  
        const component = await mountSuspended(CapacitorItem,  {props: {device: {id:'1'}}})
        expect(component.html()).toContain('v-btn');
    })
})
