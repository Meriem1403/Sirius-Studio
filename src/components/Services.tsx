import { motion } from 'framer-motion'
import { ArrowRight, Check, Code2, Layers, LayoutTemplate } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Service = {
  id: string
  icon: LucideIcon
  step: string
  title: string
  subtitle: string
  description: string
  deliverables: string[]
  tags: string[]
  color: string
  border: string
  iconClass: string
  accent: string
}

const services: Service[] = [
  {
    id: 'web',
    icon: LayoutTemplate,
    step: '01',
    title: 'Sites web',
    subtitle: 'Vitrine, e-commerce, landing',
    description:
      'Des sites rapides, beaux et pensés pour convertir. De la première maquette au lancement, Sirius structure chaque page autour de vos objectifs.',
    deliverables: ['Sites vitrines', 'E-commerce', 'Landing pages'],
    tags: ['Responsive', 'SEO', 'Performance'],
    color: 'from-indigo-500/15 to-blue-500/5',
    border: 'border-indigo-500/20',
    iconClass: 'text-indigo-300',
    accent: 'bg-indigo-500/40',
  },
  {
    id: 'mobile',
    icon: Layers,
    step: '02',
    title: 'Applications mobiles',
    subtitle: 'iOS, Android, cross-platform',
    description:
      'Des apps fluides qui engagent vos utilisateurs. Native ou cross-platform, Sirius conçoit des parcours clairs et des interfaces soignées.',
    deliverables: ['Apps iOS & Android', 'Cross-platform', 'Prototypes interactifs'],
    tags: ['iOS', 'Android', 'UX mobile'],
    color: 'from-violet-500/15 to-purple-500/5',
    border: 'border-violet-500/20',
    iconClass: 'text-violet-300',
    accent: 'bg-violet-500/40',
  },
  {
    id: 'software',
    icon: Code2,
    step: '03',
    title: 'Logiciels sur mesure',
    subtitle: 'Outils, dashboards, SaaS',
    description:
      'Des solutions adaptées à vos processus métier. Dashboards, outils internes ou produits SaaS : Sirius transforme vos besoins en outils concrets.',
    deliverables: ['Dashboards', 'Outils internes', 'Produits SaaS'],
    tags: ['API', 'Automatisation', 'Scalable'],
    color: 'from-sky-500/15 to-cyan-500/5',
    border: 'border-sky-500/20',
    iconClass: 'text-sky-300',
    accent: 'bg-sky-500/40',
  },
]

export default function Services() {
  return (
    <section id="services" className="section-wrap relative">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 75% 55% at 50% 100%, rgba(139, 92, 246, 0.07) 0%, transparent 65%)',
        }}
      />

      <div className="section-inner relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 lg:mb-14"
        >
          <span className="section-label mb-4">Expertise</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mt-4 mb-4">
            Ce que nous <span className="glow-text">créons</span>
          </h2>
          <p className="text-white/40 text-lg xl:text-xl max-w-xl xl:max-w-2xl mx-auto">
            Du site vitrine à l&apos;application complexe, Sirius conçoit des expériences digitales sur mesure.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
          {services.map((service, i) => {
            const Icon = service.icon

            return (
              <motion.article
                key={service.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`service-card group interactive-card relative overflow-hidden rounded-2xl border ${service.border}`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-60 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative p-6 sm:p-7 lg:p-8 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div
                      className={`w-11 h-11 rounded-xl border ${service.border} bg-white/[0.04] flex items-center justify-center ${service.iconClass}`}
                    >
                      <Icon size={20} strokeWidth={1.75} />
                    </div>
                    <span className="text-[10px] font-medium tracking-[0.2em] text-white/25 uppercase">
                      {service.step}
                    </span>
                  </div>

                  <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-1">{service.subtitle}</p>
                  <h3 className="text-xl font-semibold mb-3 tracking-tight">{service.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed mb-5">{service.description}</p>

                  <ul className="space-y-2 mb-6">
                    {service.deliverables.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-white/50">
                        <Check size={12} className={`shrink-0 ${service.iconClass}`} strokeWidth={2.5} />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="service-visual-frame mb-5 mt-auto">
                    <ServiceVisual service={service} />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full text-[11px] text-white/40 bg-white/[0.04] border border-white/[0.06]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <a
                    href="#contact"
                    className="inline-flex items-center gap-1.5 text-sm text-white/45 hover:text-white/80 transition-colors duration-300 group/link"
                  >
                    En parler
                    <ArrowRight
                      size={14}
                      strokeWidth={2}
                      className="transition-transform duration-300 group-hover/link:translate-x-0.5"
                    />
                  </a>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ServiceVisual({ service }: { service: Service }) {
  if (service.id === 'web') return <WebVisual accent={service.accent} border={service.border} />
  if (service.id === 'mobile') return <MobileVisual accent={service.accent} border={service.border} />
  return <SoftwareVisual accent={service.accent} border={service.border} />
}

function WebVisual({ accent, border }: { accent: string; border: string }) {
  return (
    <div className={`rounded-lg border ${border} bg-[#0a0a12] overflow-hidden`}>
      <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-white/[0.05]">
        <div className="w-1.5 h-1.5 rounded-full bg-red-400/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-green-400/50" />
        <div className="flex-1 mx-1 h-4 rounded bg-white/[0.04]" />
      </div>
      <div className="p-3">
        <div className={`h-2.5 rounded ${accent} w-2/3 mb-2 shimmer`} />
        <div className="h-1.5 rounded bg-white/10 w-full mb-1" />
        <div className="h-1.5 rounded bg-white/10 w-4/5 mb-3" />
        <div className={`h-5 rounded-full ${accent} w-16 border border-white/10`} />
      </div>
    </div>
  )
}

function MobileVisual({ accent, border }: { accent: string; border: string }) {
  return (
    <div className="flex justify-center gap-2 py-1">
      <div className={`w-[42%] rounded-xl border ${border} bg-[#0a0a12] p-2`}>
        <div className={`h-1.5 rounded ${accent} w-1/2 mx-auto mb-2`} />
        <div className={`aspect-[3/4] rounded-lg ${accent} opacity-60 mb-1.5`} />
        <div className="flex justify-center gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-1 w-3 rounded bg-white/10" />
          ))}
        </div>
      </div>
      <div className={`w-[42%] rounded-xl border ${border} bg-[#0a0a12] p-2 opacity-80 scale-95`}>
        <div className="h-1.5 rounded bg-white/10 w-1/2 mx-auto mb-2" />
        <div className="space-y-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-4 rounded ${i === 1 ? `${accent} opacity-70` : 'bg-white/[0.06]'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function SoftwareVisual({ accent, border }: { accent: string; border: string }) {
  return (
    <div className={`rounded-lg border ${border} bg-[#0a0a12] p-3`}>
      <div className="flex gap-2 mb-2">
        <div className={`flex-1 h-8 rounded ${accent} opacity-70`} />
        <div className="flex-1 h-8 rounded bg-white/[0.06]" />
        <div className="flex-1 h-8 rounded bg-white/[0.06]" />
      </div>
      <div className="grid grid-cols-4 gap-1.5 mb-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-6 rounded ${i === 1 ? accent : 'bg-white/[0.06]'} ${i === 1 ? 'opacity-60' : ''}`} />
        ))}
      </div>
      <div className="space-y-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-2 rounded bg-white/[0.08] w-full" style={{ width: `${100 - i * 12}%` }} />
        ))}
      </div>
    </div>
  )
}
