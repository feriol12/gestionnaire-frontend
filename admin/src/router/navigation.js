// FE-01 — Entrées de navigation de l'Admin (sidebar, tiroir mobile, barre basse).
import { demoNotificationsCount } from '@admin/mocks/dashboard.js'

export const navSections = [
  {
    id: 'supervision',
    title: 'Supervision système',
    items: [
      { to: { name: 'dashboard' }, label: "Vue d'ensemble", icon: 'dashboard' },
      { to: { name: 'users' }, label: 'Utilisateurs', icon: 'users' },
      { to: { name: 'audit' }, label: "Journal d'audit", icon: 'audit' },
      {
        to: { name: 'notifications' },
        label: 'Notifications',
        icon: 'notifications',
        badge: demoNotificationsCount,
        badgeLabel: `${demoNotificationsCount} notifications fictives`,
      },
      { to: { name: 'security' }, label: 'Paramètres et sécurité', icon: 'security' },
    ],
  },
  {
    id: 'reference',
    title: 'Référence UI',
    items: [
      { to: { name: 'states' }, label: 'États simulés', icon: 'states' },
      { to: { name: 'components' }, label: 'Composants', icon: 'components' },
    ],
  },
]

export const mobileNavItems = [
  { to: { name: 'dashboard' }, label: 'Tableau', icon: 'dashboard' },
  { to: { name: 'users' }, label: 'Utilisateurs', icon: 'users' },
  { to: { name: 'audit' }, label: 'Audit', icon: 'audit' },
  { to: { name: 'security' }, label: 'Sécurité', icon: 'security' },
]
