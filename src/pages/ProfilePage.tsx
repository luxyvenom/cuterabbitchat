import { User, LogOut, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const ProfilePage = () => {
  const { user, isLoading, isAuthenticated, signInWithGoogle, signOut } = useAuth();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch {
      toast.error('로그인에 실패했습니다.');
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('로그아웃 되었습니다.');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-4 gap-4">
        <User size={48} className="text-text-secondary/30" />
        <h2 className="text-lg font-semibold text-text-primary">Profile</h2>
        <p className="text-sm text-text-secondary text-center">
          로그인하면 캐릭터 생성, 채팅 저장 등을 이용할 수 있어요
        </p>
        <button
          onClick={handleLogin}
          className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover rounded-xl text-white font-semibold text-sm transition-colors"
        >
          <LogIn size={16} />
          Google로 로그인
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-4 pt-6 gap-6">
      <div className="flex items-center gap-4">
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt="avatar"
            className="w-14 h-14 rounded-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
            <User size={24} className="text-accent" />
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold text-text-primary">{user?.username}</h2>
          <p className="text-xs text-text-secondary">{user?.email}</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-3 bg-bg-secondary rounded-xl text-red-400 text-sm font-medium hover:bg-bg-tertiary transition-colors"
      >
        <LogOut size={16} />
        로그아웃
      </button>
    </div>
  );
};

export default ProfilePage;
