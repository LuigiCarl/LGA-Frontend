import { Link } from 'react-router';
import { useEmoji } from '../context/EmojiContext';

export function ProfileButton() {
  const { emoji } = useEmoji();

  return (
    <Link
      to="/dashboard/profile"
      className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center hover:shadow-lg hover:shadow-[#6366F1]/30 transition-all"
      aria-label="View profile"
    >
      <span className="text-base">{emoji}</span>
    </Link>
  );
}
