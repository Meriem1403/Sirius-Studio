import { motion } from 'framer-motion'

const blocks = [
  { delay: 0.3, h: 'h-3', w: 'w-2/3' },
  { delay: 0.5, h: 'h-2', w: 'w-full' },
  { delay: 0.6, h: 'h-2', w: 'w-4/5' },
]

export default function HeroVisual() {
  return (
    <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-none xl:max-w-lg 2xl:max-w-xl mx-auto lg:ml-auto lg:mr-0">
      <div className="absolute -inset-6 rounded-3xl bg-indigo-500/5 blur-2xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="hero-browser relative rounded-2xl overflow-hidden"
      >
        {/* Chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#0a0a12]">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
          </div>
          <div className="flex-1 mx-2 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center px-3">
            <span className="text-[10px] text-indigo-300/50">votre-projet.sirius.preview</span>
          </div>
        </div>

        {/* Mockup body */}
        <div className="p-5 sm:p-6 xl:p-7 2xl:p-8 bg-gradient-to-br from-[#0c0c16] via-[#100e1c] to-indigo-900/50 min-h-[280px] sm:min-h-[320px] xl:min-h-[360px] 2xl:min-h-[400px]">
          {/* Nav skeleton */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="h-2.5 w-16 rounded bg-purple-400/30" />
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-1.5 w-8 rounded bg-white/10" />
              ))}
            </div>
          </motion.div>

          {/* Hero block */}
          <div className="rounded-xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 p-5 mb-4">
            {blocks.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.9 + b.delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={`${b.h} ${b.w} rounded bg-white/10 mb-2 origin-left ${i === 0 ? 'shimmer' : ''}`}
              />
            ))}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="h-8 w-28 rounded-full bg-gradient-to-r from-purple-400/40 to-indigo-500/30 border border-purple-400/20 mt-4"
            />
          </div>

          {/* Cards row */}
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 + i * 0.12, duration: 0.45 }}
                className="h-14 rounded-lg bg-white/[0.03] border border-white/[0.05] p-2"
              >
                <div className="h-1.5 w-2/3 rounded bg-indigo-400/20 mb-1.5" />
                <div className="h-1 w-full rounded bg-white/5" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
