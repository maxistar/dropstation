import { mountSuspended } from '@nuxt/test-utils/runtime'
import { it, expect, describe } from 'vitest'
import PlaceItem from '../../../components/PlaceItem.vue'

describe('PlaceItem', () => {
  it('can mount the component', async () => {
    const component = await mountSuspended(PlaceItem, {
      props: { device: { id: 1, index: 2, name: 'Office' } },
    })
    expect(component.html()).toContain('#2 Office')
  })

  it('match snapshot', async () => {
    const component = await mountSuspended(PlaceItem, {
      props: { device: { id: 1, index: 2, name: 'Office' } },
    })
    expect(component.html()).toMatchSnapshot()
  })
})
