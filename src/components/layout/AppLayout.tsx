import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const AppLayout = () => {
  return (
    <div className="flex justify-center min-h-screen bg-bg-primary">
      <div className="w-full max-w-[393px] min-h-screen bg-bg-primary relative">
        <main className="pb-14">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
};

export default AppLayout;
