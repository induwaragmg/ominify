/**
 * Customized Clerk Auth UI Appearance Theme
 * Aligned with the Ominify E-Commerce platform design system (brand blue #2563eb, rounded-2xl cards, Google Sans / Inter typography).
 */
export const ominifyClerkAppearance = {
  elements: {
    rootBox: "w-full flex justify-center font-sans",
    cardBox: "shadow-none w-full flex justify-center font-sans",
    card: "bg-white/90 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.18)] w-full max-w-[420px]",
    headerTitle: "text-xl font-bold text-gray-950 text-center font-sans tracking-tight",
    headerSubtitle: "text-xs text-gray-500 text-center mt-1 font-sans leading-relaxed",
    socialButtonsBlockButton:
      "rounded-xl border border-gray-200 bg-white hover:bg-gray-50/80 text-xs font-semibold text-gray-700 h-11 transition-all shadow-2xs hover:shadow-xs font-sans",
    socialButtonsBlockButtonText: "font-semibold text-xs text-gray-700 font-sans",
    dividerLine: "bg-gray-200/70",
    dividerText: "text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-transparent px-2.5 font-sans",
    formFieldLabel: "text-xs font-semibold text-gray-700 mb-1 font-sans",
    formFieldInput:
      "rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-2.5 text-sm text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none font-sans",
    formButtonPrimary:
      "rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm h-11 transition-all shadow-sm hover:shadow-md active:scale-[0.99] font-sans",
    footerActionText: "text-xs text-gray-500 font-sans",
    footerActionLink: "text-xs font-semibold text-blue-600 hover:text-blue-700 font-sans transition-colors",
    identityPreviewText: "text-xs font-semibold text-gray-800 font-sans",
    identityPreviewEditButton: "text-xs text-blue-600 font-medium hover:underline font-sans",
    formResendCodeLink: "text-xs font-semibold text-blue-600 hover:underline font-sans",
    otpCodeFieldInput:
      "rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-sans",
    logoImage: "h-8 w-auto mx-auto",
  },
  variables: {
    colorPrimary: "#2563eb",
    colorText: "#0f172a",
    colorTextSecondary: "#64748b",
    colorBackground: "#ffffff",
    colorInputBackground: "#f8fafc",
    colorInputText: "#0f172a",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
};
