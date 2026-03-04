import Login from '@/components/auth/Login'
import { redirectAuth } from '@/lib/redirectAuth'

const login = async () => {
  await redirectAuth()
  return (
    <div>
      <Login />
    </div>
  )
}

export default login