import { mountSuspended } from '@nuxt/test-utils/runtime'
import { it, expect, describe } from 'vitest'
import PlantItem from '../../components/PlantItem.vue'

describe('PlantItem', () => {
  it('can mount the component', async () => {
    const component = await mountSuspended(PlantItem, {
      props: { device: { id: 1, name: 'Monstera', species: 'Monstera deliciosa' } },
    })
    expect(component.html()).toContain('Monstera')
  })

  it('match snapshot', async () => {
    const component = await mountSuspended(PlantItem, {
      props: { device: { id: 1, name: 'Monstera', species: 'Monstera deliciosa' } },
    })
    expect(component.html()).toMatchSnapshot()
  })
})
