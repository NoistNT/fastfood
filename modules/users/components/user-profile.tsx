import type { User } from '@/modules/users/types';

interface Props {
  user: User;
}

export default function UserProfile({ user }: Props) {
  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold">{user.name}</h2>
      <p className="text-sm text-gray-600">{user.email}</p>
      <p className="text-xs text-gray-400">
        Joined on {new Date(user.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
