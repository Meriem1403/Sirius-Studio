import { motion } from 'framer-motion'

const services = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    title: 'Sites web',
    description: 'Vitrines, e-commerce, landing pages — des sites rapides, beaux et pensés pour convertir.',
    tags: ['Responsive', 'SEO', 'Performance'],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M12 18h.01" />
      </svg>
    ),
    title: 'Applications mobiles',
    description: 'iOS & Android natifs ou cross-platform. Des apps fluides qui engagent vos utilisateurs.',
    tags: ['iOS', 'Android', 'Cross-platform'],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    title: 'Logiciels sur mesure',
    description: 'Outils internes, dashboards, SaaS — des solutions adaptées à vos processus métier.',
    tags: ['API', 'Dashboard', 'Automatisation'],
  },
]

export default function Services() {
  return (
    <section id="services" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
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
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Du site vitrine à l'application complexe, Sirius conçoit des expériences digitales sur mesure.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group glass rounded-2xl p-8 hover:border-indigo-500/20 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 mb-6 group-hover:shadow-lg group-hover:shadow-indigo-500/10 transition-shadow">
                  {service.icon}
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
          ))}
        </div>
      </div>
    </section>
  )
}
