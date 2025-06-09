import Profile from '@/components/client/profile';
export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <Profile userId={userId} />;
}