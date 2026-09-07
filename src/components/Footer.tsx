export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="section-inner">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
            </div>
            <span className="text-sm font-medium">
              Sirius<span className="text-white/30 font-normal"> Studio</span>
            </span>
          </div>

          <p className="text-xs text-white/25 text-center">
            Sites web · Applications mobiles · Logiciels sur mesure
          </p>

          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} Sirius Studio. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
