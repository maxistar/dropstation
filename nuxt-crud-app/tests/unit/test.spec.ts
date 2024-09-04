import { mount } from '@vue/test-utils';
import CapacitorItem from '@/components/CapacitorItem.vue';

describe('ExampleComponent', () => {
    it('renders correctly', () => {
        const wrapper = mount(CapacitorItem);
        expect(wrapper.element).toMatchSnapshot();
    });
});
