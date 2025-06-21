import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EditorNavbar from '../components/EditorNavbar.vue'

describe('EditorNavbar', () => {
  const defaultProps = {
    projectName: 'Test Project',
    viewMode: 'all' as const,
    highlightMode: false,
    searchQuery: '',
    filteredCount: 10,
    totalKeys: 15,
    languageCount: 3
  }

  it('renders project name when provided', () => {
    const wrapper = mount(EditorNavbar, {
      props: defaultProps
    })

    expect(wrapper.text()).toContain('Project: Test Project')
  })

  it('does not show project info when no project name provided', () => {
    const wrapper = mount(EditorNavbar, {
      props: {
        ...defaultProps,
        projectName: undefined
      }
    })

    expect(wrapper.text()).not.toContain('Project:')
  })

  it('displays the correct view mode', () => {
    const wrapper = mount(EditorNavbar, {
      props: defaultProps
    })

    const select = wrapper.find('select')
    expect(select.element.value).toBe('all')
  })

  it('displays project stats correctly', () => {
    const wrapper = mount(EditorNavbar, {
      props: defaultProps
    })

    expect(wrapper.text()).toContain('15 keys total')
    expect(wrapper.text()).toContain('3 languages')
  })

  it('shows Add Key button', () => {
    const wrapper = mount(EditorNavbar, {
      props: defaultProps
    })

    const addKeyButton = wrapper.find('[title="Add New Key"]')
    expect(addKeyButton.exists()).toBe(true)
    expect(addKeyButton.text()).toContain('Add Key')
  })

  it('emits addKey event when Add Key button is clicked', async () => {
    const wrapper = mount(EditorNavbar, {
      props: defaultProps
    })

    const addKeyButton = wrapper.find('[title="Add New Key"]')
    await addKeyButton.trigger('click')

    expect(wrapper.emitted('addKey')).toBeTruthy()
    expect(wrapper.emitted('addKey')).toHaveLength(1)
  })

  it('emits toggleDrawer event when drawer button is clicked', async () => {
    const wrapper = mount(EditorNavbar, {
      props: defaultProps
    })

    const drawerButton = wrapper.find('[title="Toggle Sidebar"]')
    await drawerButton.trigger('click')

    expect(wrapper.emitted('toggleDrawer')).toBeTruthy()
    expect(wrapper.emitted('toggleDrawer')).toHaveLength(1)
  })

  it('emits update:viewMode when view mode select changes', async () => {
    const wrapper = mount(EditorNavbar, {
      props: defaultProps
    })

    const select = wrapper.find('select')
    await select.setValue('paging')

    expect(wrapper.emitted('update:viewMode')).toBeTruthy()
    expect(wrapper.emitted('update:viewMode')?.[0]).toEqual(['paging'])
  })

  it('emits update:highlightMode when highlight toggle changes', async () => {
    const wrapper = mount(EditorNavbar, {
      props: defaultProps
    })

    const checkbox = wrapper.find('input[type="checkbox"]')
    await checkbox.setValue(true)

    expect(wrapper.emitted('update:highlightMode')).toBeTruthy()
    expect(wrapper.emitted('update:highlightMode')?.[0]).toEqual([true])
  })

  it('shows search stats when search query is provided', () => {
    const wrapper = mount(EditorNavbar, {
      props: {
        ...defaultProps,
        searchQuery: 'test search'
      }
    })

    expect(wrapper.text()).toContain('Search Active')
    expect(wrapper.text()).toContain('10 / 15 keys')
  })

  it('does not show search stats when no search query', () => {
    const wrapper = mount(EditorNavbar, {
      props: {
        ...defaultProps,
        searchQuery: ''
      }
    })

    expect(wrapper.text()).not.toContain('Search Active')
  })

  it('shows highlight mode checkbox as checked when highlightMode is true', () => {
    const wrapper = mount(EditorNavbar, {
      props: {
        ...defaultProps,
        highlightMode: true
      }
    })

    const checkbox = wrapper.find('input[type="checkbox"]')
    expect((checkbox.element as HTMLInputElement).checked).toBe(true)
  })

  it('shows highlight mode checkbox as unchecked when highlightMode is false', () => {
    const wrapper = mount(EditorNavbar, {
      props: {
        ...defaultProps,
        highlightMode: false
      }
    })

    const checkbox = wrapper.find('input[type="checkbox"]')
    expect((checkbox.element as HTMLInputElement).checked).toBe(false)
  })
})
