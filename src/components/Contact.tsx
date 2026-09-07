import { useState } from 'react'
import { motion } from 'framer-motion'

const situations = [
  { value: 'existing', label: "J'ai déjà un site" },
  { value: 'idea', label: "J'ai une idée / des besoins" },
  { value: 'unknown', label: 'Je ne sais pas ce que je veux' },
]

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    situation: 'idea',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section id="contact" className="relative py-32 px-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-3xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="section-label mb-4">Commencer</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mt-4 mb-4">
            Recevez votre maquette
            <br />
            <span className="glow-text">gratuitement.</span>
          </h2>
          <p className="text-white/40 text-lg max-w-lg mx-auto">
            Décrivez votre projet en 2 minutes. Sirius vous envoie une première maquette sous 48h — sans engagement.
          </p>
        </motion.div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-12 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 mx-auto mb-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl"
            >
              ✦
            </motion.div>
            <h3 className="text-2xl font-semibold mb-3">Demande envoyée !</h3>
            <p className="text-white/40">
              Sirius analyse votre projet et revient vers vous sous 48h avec votre maquette gratuite.
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="glass rounded-3xl p-8 md:p-10 space-y-6"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/50 mb-2">Nom *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  placeholder="vous@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/50 mb-2">Entreprise / Activité</label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                placeholder="Nom de votre activité"
              />
            </div>

            <div>
              <label className="block text-sm text-white/50 mb-3">Votre situation</label>
              <div className="grid sm:grid-cols-3 gap-3">
                {situations.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setForm({ ...form, situation: s.value })}
                    className={`p-3 rounded-xl text-sm text-left transition-all duration-300 ${
                      form.situation === s.value
                        ? 'bg-indigo-500/20 border border-indigo-500/40 text-white'
                        : 'bg-white/[0.03] border border-white/5 text-white/40 hover:border-white/10'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/50 mb-2">Décrivez votre projet</label>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none"
                placeholder="Parlez-nous de votre idée, vos besoins, ou laissez-nous imaginer pour vous..."
              />
            </div>

            <button type="submit" className="btn-primary w-full text-lg py-4">
              ✦ Demander ma maquette gratuite
            </button>

            <p className="text-center text-xs text-white/25">
              Gratuit · Sans engagement · Réponse sous 48h
            </p>
          </motion.form>
        )}
      </div>
    </section>
  )
}
