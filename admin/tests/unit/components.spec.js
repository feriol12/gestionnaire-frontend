import { describe, expect, it, vi } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import AdminButton from '@admin/components/AdminButton.vue'
import AdminIcon from '@admin/components/AdminIcon.vue'
import AuditActivity from '@admin/components/AuditActivity.vue'
import { auditEvents } from '@admin/mocks/dashboard.js'
import KpiCard from '@admin/components/KpiCard.vue'
import StatePanel from '@admin/components/StatePanel.vue'
import StatusBadge from '@admin/components/StatusBadge.vue'
import TextField from '@admin/components/TextField.vue'
import SelectField from '@admin/components/SelectField.vue'
import CheckboxField from '@admin/components/CheckboxField.vue'

const stubs = { global: { stubs: { RouterLink: RouterLinkStub } } }

describe('AdminButton', () => {
  it('rend un <button type="button"> avec la variante demandée', () => {
    const wrapper = mount(AdminButton, { props: { variant: 'danger' }, slots: { default: 'Suspendre' } })
    const button = wrapper.get('button')
    expect(button.attributes('type')).toBe('button')
    expect(button.classes()).toContain('admin-button--danger')
    expect(button.text()).toBe('Suspendre')
  })

  it('émet click, sauf pendant le chargement où il reste focalisable', async () => {
    const wrapper = mount(AdminButton, { slots: { default: 'Valider' } })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)

    await wrapper.setProps({ loading: true })
    const button = wrapper.get('button')
    expect(button.attributes('disabled')).toBeUndefined()
    expect(button.attributes('aria-disabled')).toBe('true')
    expect(button.attributes('aria-busy')).toBe('true')
    await button.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('désactivé : attribut disabled natif', () => {
    const wrapper = mount(AdminButton, { props: { disabled: true }, slots: { default: 'Désactivé' } })
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })

  it('avec « to », rend un lien de navigation interne', () => {
    const wrapper = mount(AdminButton, { props: { to: { name: 'dashboard' } }, slots: { default: 'Retour' }, ...stubs })
    expect(wrapper.findComponent(RouterLinkStub).props('to')).toEqual({ name: 'dashboard' })
    expect(wrapper.find('button').exists()).toBe(false)
  })
})

describe('StatusBadge', () => {
  it('associe ton et libellé texte, pastille décorative', () => {
    const wrapper = mount(StatusBadge, { props: { tone: 'warning' }, slots: { default: 'À examiner' } })
    expect(wrapper.classes()).toContain('status-badge--warning')
    expect(wrapper.text()).toBe('À examiner')
    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
  })

  it('refuse un ton inconnu (validateur)', () => {
    const validator = StatusBadge.props.tone.validator
    expect(validator('success')).toBe(true)
    expect(validator('rainbow')).toBe(false)
  })
})

describe('KpiCard', () => {
  it('formate la valeur en fr-FR et affiche l’étiquette Démonstration', () => {
    const wrapper = mount(KpiCard, {
      props: { label: 'Total des utilisateurs', value: 142850, trend: { label: '+8,4 %', tone: 'success' } },
    })
    expect(wrapper.get('.kpi-card__value').text().replace(/\s/g, ' ')).toBe('142 850')
    expect(wrapper.text()).toContain('Démonstration')
    expect(wrapper.get('h3').text()).toContain('Total des utilisateurs')
  })
})

describe('KpiCard — icône de tendance', () => {
  it('portée par la donnée (trend.icon), indépendante de l’icône de la carte', () => {
    const withIcon = mount(KpiCard, {
      props: { label: 'Comptes actifs', value: 10, icon: 'active', trend: { label: '+1', tone: 'success', icon: 'trend' } },
    })
    expect(withIcon.find('.kpi-card__trend svg').exists()).toBe(true)
    const withoutIcon = mount(KpiCard, {
      props: { label: 'Total', value: 10, icon: 'users', trend: { label: '+1', tone: 'success' } },
    })
    expect(withoutIcon.find('.kpi-card__trend svg').exists()).toBe(false)
  })
})

describe('AdminIcon', () => {
  it('rend une icône connue, décorative', () => {
    const wrapper = mount(AdminIcon, { props: { name: 'shield' } })
    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
  })

  it('nom inconnu : avertissement en développement et icône de repli', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mount(AdminIcon, { props: { name: 'icone-inexistante' } })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(warn.mock.calls.flat().join(' ')).toMatch(/Invalid prop.*name/s)
  })
})

describe('AuditActivity — zone du tableau', () => {
  const props = { events: auditEvents, caption: 'Activité fictive' }

  it('hors de l’ordre de tabulation quand elle ne défile pas', () => {
    const wrapper = mount(AuditActivity, { props })
    const region = wrapper.get('[role="region"]')
    expect(region.attributes('tabindex')).toBeUndefined()
    expect(region.attributes('data-scrollable')).toBe('false')
  })

  it('focalisable (tabindex=0) quand son contenu dépasse', async () => {
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(900)
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(600)
    const wrapper = mount(AuditActivity, { props })
    await wrapper.vm.$nextTick()
    expect(wrapper.get('[role="region"]').attributes('tabindex')).toBe('0')
  })
})

describe('StatePanel', () => {
  it('rend le titre au niveau demandé et le contenu d’action', () => {
    const wrapper = mount(StatePanel, {
      props: { icon: 'inbox', title: 'Aucun utilisateur trouvé', headingLevel: 2 },
      slots: { default: '<button type="button">Réinitialiser</button>' },
    })
    expect(wrapper.get('h2').text()).toBe('Aucun utilisateur trouvé')
    expect(wrapper.get('button').text()).toBe('Réinitialiser')
  })
})

describe('Champs de formulaire', () => {
  it('TextField : label relié, aide et erreur annoncées', () => {
    const wrapper = mount(TextField, {
      props: { label: 'Recherche', hint: 'Simulée', error: 'Introuvable', modelValue: '' },
    })
    const input = wrapper.get('input')
    const id = input.attributes('id')
    expect(wrapper.get('label').attributes('for')).toBe(id)
    expect(input.attributes('aria-invalid')).toBe('true')
    const described = input.attributes('aria-describedby').split(' ')
    expect(described).toHaveLength(2)
    described.forEach((ref) => expect(wrapper.find(`#${ref}`).exists()).toBe(true))
  })

  it('TextField : v-model local', async () => {
    const wrapper = mount(TextField, {
      props: { label: 'Recherche', modelValue: '', 'onUpdate:modelValue': (v) => wrapper.setProps({ modelValue: v }) },
    })
    await wrapper.get('input').setValue('demo')
    expect(wrapper.props('modelValue')).toBe('demo')
  })

  it('SelectField et CheckboxField : labels reliés', () => {
    const select = mount(SelectField, {
      props: { label: 'Périmètre', options: [{ value: 'a', label: 'A' }], modelValue: 'a' },
    })
    expect(select.get('label').attributes('for')).toBe(select.get('select').attributes('id'))
    const checkbox = mount(CheckboxField, { props: { label: 'Masquer', modelValue: true } })
    expect(checkbox.get('label').attributes('for')).toBe(checkbox.get('input').attributes('id'))
    expect(checkbox.get('input').element.checked).toBe(true)
  })
})
