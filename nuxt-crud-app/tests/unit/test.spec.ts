import { mount } from '@vue/test-utils';
import CapacitorItem from '@/components/CapacitorItem.vue';
import { it, expect, describe } from 'vitest'

describe('ExampleComponent', () => {
    it.skip('renders correctly', () => {
        const wrapper = mount(CapacitorItem);
        expect(wrapper.element).toMatchSnapshot();
    });
});
