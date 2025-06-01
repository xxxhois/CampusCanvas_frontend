import Profile from '@/components/client/profile';

export default async function ProfilePage({
  params,
}: {
  params: { userId: string }
}) {
  const userId = await Promise.resolve(params.userId);
  return <Profile userId={userId} />;
}