import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import ChatsPage from './pages/ChatsPage';
import CreatePage from './pages/CreatePage';
import ProfilePage from './pages/ProfilePage';
import CharacterDetailPage from './pages/CharacterDetailPage';
import ChatPage from './pages/ChatPage';

const App = () => {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#262727',
            color: '#ffffff',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/chats" element={<ChatsPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/character/:id" element={<CharacterDetailPage />} />
        </Route>
        <Route path="/chat/:id" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
