import { mountSuspended } from '@nuxt/test-utils/runtime'
import { it, expect, describe } from 'vitest'
import PointItem from '../../../components/PointItem.vue'

describe('PointItem', () => {
  it('can mount the component', async () => {
    const component = await mountSuspended(PointItem, {
      props: { device: { id: 1, name: '04ABC20A', deviceId: 7, index: 1 } },
    })
    expect(component.html()).toContain('04ABC20A')
  })

  it('match snapshot', async () => {
    const component = await mountSuspended(PointItem, {
      props: { device: { id: 1, name: '04ABC20A', deviceId: 7, index: 1 } },
    })
    expect(component.html()).toMatchSnapshot()
  })
})
