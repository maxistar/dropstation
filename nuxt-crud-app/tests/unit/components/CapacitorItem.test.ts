import { mountSuspended } from '@nuxt/test-utils/runtime'
import { it, expect, describe } from 'vitest'
import CapacitorItem from '../../../components/CapacitorItem.vue'

describe('AppNumber', () => {
    it('can mount the component', async () => {  
        const component = await mountSuspended(CapacitorItem,  {props: {device: {id: 1, capacity: 4000, value: 3500}}})
        expect(component.html()).toContain('Capacity: 4000');
    })

    it('match snapshot', async () => {
        const component = await mountSuspended(CapacitorItem,  {props: {device: {id: 1, capacity: 4000, value: 3500}}})
        expect(component.html()).toMatchSnapshot();
    })
})
