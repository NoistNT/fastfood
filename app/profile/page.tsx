import { findAllUsers } from '@/modules/users/actions';
import UserProfile from '@/modules/users/components/user-profile';

export default async function ProfilePage() {
  const users = await findAllUsers();

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Profiles</h1>
      <div className="grid gap-4">
        {users.map((user) => (
          <UserProfile
            key={user.id}
            user={user}
          />
        ))}
      </div>
    </main>
  );
}
