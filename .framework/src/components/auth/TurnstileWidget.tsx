// CIL[BEGIN stable_id="~/.framework/src/components/auth/TurnstileWidget.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/auth/TurnstileWidget.tsx"]
// CIL[DOC-MACRO purpose="Optional Cloudflare Turnstile bot-protection widget for auth surfaces"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a Turnstile challenge when VITE_TURNSTILE_SITE_KEY is configured; render nothing and stay inert otherwise"]
// CIL[DOC-CONTEXT module="auth" layer="presentation" related_files=".framework/src/pages/auth/RegisterPage.tsx,.framework/src/pages/auth/LoginPage.tsx,.framework/src/pages/auth/ForgotPasswordPage.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-CONTRACT inputs="onToken: (token|null)=>void" outputs="JSX | null; token via callback" errors="onError/onExpire clear the token" side_effects="loads challenges.cloudflare.com script when rendered"]
// CIL[DOC-MICRO logic_summary="Site key comes from import.meta.env at build time; absent key returns null so packaged installs and local dev keep existing behavior" notable_decisions="One Turnstile site should cover both the prod domain and localhost so the same key works everywhere"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]

import { Turnstile } from '@marsidev/react-turnstile'

const SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) || ''

export const turnstileEnabled = !!SITE_KEY

export function TurnstileWidget({ onToken }: { onToken: (token: string | null) => void }) {
  if (!SITE_KEY) return null
  return (
    <Turnstile
      siteKey={SITE_KEY}
      onSuccess={onToken}
      onExpire={() => onToken(null)}
      onError={() => onToken(null)}
    />
  )
}
// CIL[END stable_id="~/.framework/src/components/auth/TurnstileWidget.tsx:module_header:module_header"]
