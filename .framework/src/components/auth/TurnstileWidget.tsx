
import { Turnstile } from '@marsidev/react-turnstile'

const SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) || ''

export const turnstileEnabled = !!SITE_KEY

export function TurnstileWidget({ onToken }: { onToken: (token: string | null) => void }) {
  if (!SITE_KEY) return null
  return (
    <div className="flex justify-center">
      <Turnstile
        siteKey={SITE_KEY}
        options={{ theme: 'light' }}
        onSuccess={onToken}
        onExpire={() => onToken(null)}
        onError={() => onToken(null)}
      />
    </div>
  )
}
