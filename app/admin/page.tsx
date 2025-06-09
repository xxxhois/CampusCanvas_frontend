import { withAuth } from '@/components/client/auth/with-auth'

function ProtectedPage() {
  return <div>这是受保护的页面,管理员页面</div>
}

export default withAuth(ProtectedPage);
//export default ProtectedPage