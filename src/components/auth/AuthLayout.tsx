import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="auth-page min-h-[100svh] pt-24 sm:pt-28 pb-10 sm:pb-14 px-4 sm:px-6">
      <div className="auth-page-inner section-inner">
        <Link to="/" className="auth-back-link inline-flex items-center gap-2 text-sm mb-6 sm:mb-8">
          <ArrowLeft size={16} strokeWidth={2} />
          Retour à l&apos;accueil
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="auth-form-panel auth-form-panel--solo"
        >
          {children}
        </motion.div>
      </div>
    </main>
  )
}
