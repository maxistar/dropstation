import { mountSuspended } from "@nuxt/test-utils/runtime";
import { it, expect, describe } from 'vitest';
import { CapacitorItem } from "../../../components/CapacitorItem.vue";

describe('smoke test', () => {
    it('can mount component', async () => {
        const component = await mountSuspended(CapacitorItem, { props: { id: "123"}})
        expect(component.html()).toContain('')
    })
})
