import { motion } from 'framer-motion'
import { Code2, Layers, LayoutTemplate } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const services: {
  icon: LucideIcon
  title: string
  description: string
  tags: string[]
}[] = [
  {
    icon: LayoutTemplate,
    title: 'Sites web',
    description: 'Vitrines, e-commerce, landing pages — des sites rapides, beaux et pensés pour convertir.',
    tags: ['Responsive', 'SEO', 'Performance'],
  },
  {
    icon: Layers,
    title: 'Applications mobiles',
    description: 'iOS & Android natifs ou cross-platform. Des apps fluides qui engagent vos utilisateurs.',
    tags: ['iOS', 'Android', 'Cross-platform'],
  },
  {
    icon: Code2,
    title: 'Logiciels sur mesure',
    description: 'Outils internes, dashboards, SaaS — des solutions adaptées à vos processus métier.',
    tags: ['API', 'Dashboard', 'Automatisation'],
  },
]

export default function Services() {
  return (
    <section id="services" className="section-wrap">
      <div className="section-inner">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="section-label mb-4">Expertise</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mt-4 mb-4">
            Ce que nous créons
          </h2>
          <p className="text-white/40 text-lg xl:text-xl max-w-xl xl:max-w-2xl mx-auto">
            Du site vitrine à l'application complexe, Sirius conçoit des expériences digitales sur mesure.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, type: 'spring', stiffness: 260, damping: 22 }}
                className="group glass rounded-2xl p-8 interactive-card relative overflow-hidden hover:border-indigo-500/25"
                whileHover={{ borderColor: 'rgba(99, 102, 241, 0.25)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 mb-6 group-hover:border-indigo-400/35 group-hover:bg-indigo-500/15 transition-colors duration-400">
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-white/40 leading-relaxed mb-6">{service.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full text-xs text-white/40 bg-white/5 border border-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
