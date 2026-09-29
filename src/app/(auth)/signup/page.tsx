import { redirect } from 'next/navigation'

// Registration is disabled — this is a single-tenant app for Biryani Charminar only.
export default function SignupPage() {
  redirect('/login')
}
