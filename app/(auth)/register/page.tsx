import Register from '@/components/auth/Register'
import { redirectAuth } from '@/lib/redirectAuth'

const register = async () => {
  await redirectAuth()
  return (
    <div>
      <Register />
    </div>
  )
}

export default register