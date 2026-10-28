import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE = 'https://studio-sirius.fr'

const PUBLIC_PAGES: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Sirius Studio — Votre maquette gratuite',
    description:
      'Sirius Studio crée des sites web, des applications mobiles et des logiciels sur mesure. Recevez votre première maquette gratuite, sans engagement.',
  },
  '/inscription': {
    title: 'Demander une maquette gratuite — Sirius Studio',
    description:
      'Créez votre compte Sirius Studio et décrivez votre projet pour recevoir une première maquette gratuite.',
  },
  '/demande-maquette': {
    title: 'Demander une maquette gratuite — Sirius Studio',
    description:
      'Décrivez votre projet à Sirius Studio et recevez une première maquette gratuite, sans engagement.',
  },
}

function setMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function isPrivatePath(pathname: string) {
  return (
    pathname.startsWith('/espace-client') ||
    pathname.startsWith('/espace-admin') ||
    pathname.startsWith('/mot-de-passe-oublie') ||
    pathname.startsWith('/auth') ||
    pathname === '/connexion'
  )
}

export default function DocumentMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const page = PUBLIC_PAGES[pathname]
    const privatePage = isPrivatePath(pathname)
    document.title = page?.title ?? 'Sirius Studio'
    if (page) setMeta('description', page.description)
    setMeta('robots', privatePage ? 'noindex, nofollow' : 'index, follow')

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    const path = pathname === '/' ? '/' : pathname
    canonical.setAttribute('href', privatePage ? `${SITE}/` : `${SITE}${path}`)
  }, [pathname])

  return null
}
