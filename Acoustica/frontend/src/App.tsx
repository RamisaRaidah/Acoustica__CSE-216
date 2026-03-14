import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';

import SignIn from '@/pages/auth/Sign_in/sign_in.tsx';
import SignUp from '@/pages/auth/Sign_up/sign_up.tsx';
import SignOut from '@/pages/auth/Sign_out/sign_out.tsx';
import Onboarding from '@/pages/auth/Onboarding/onboarding.tsx';
import MyProfile from '@/pages/profile/private/my_profile.tsx';

import { Dashboard } from '@/pages/user/Dashboard';
import { Playlists } from '@/pages/music/playlist/playlists/Playlists';
import { Artists } from '@/pages/user/artist/artists/Artists';
// import UploadSong from './pages/music/song/upload_song/upload_song';
// import CreateAlbum from './pages/music/album/create_album/create_album';
// import Playlist from './pages/music/playlist/playlist';
// import CreatePlaylist from './pages/music/playlist/create_playlist/create_playlist';
// import PrivateProfile from './pages/profile/private/my_profile';
// import Artists from './pages/user/artist/artists/artists';

import ProtectedRoute from '@/components/Routes/ProtectedRoute.tsx';
import PublicOnlyRoute from '@/components/Routes/PublicOnlyRoute.tsx';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Topbar } from '@/components/topbar/Topbar';
import { MusicPlayer } from '@/components/music_player/MusicPlayer';
import { Scrollbar } from '@/components/scrollbar/Scrollbar';
import { useScroll } from '@/contexts/ScrollContext';

function App() {
  const scrollRef = useScroll();

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/sign-in" element={<PublicOnlyRoute><SignIn /></PublicOnlyRoute>} />
        <Route path="/sign-up" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute requireOnboarding={false}><Onboarding /></ProtectedRoute>} />

        <Route element={
          <ProtectedRoute>
            <div className="app_layout" ref={scrollRef} style={{ overflowY: "auto", height: "100vh" }}>
              <Sidebar />
              <Topbar />
              <Scrollbar />
              <MusicPlayer />
              <Outlet />
            </div>
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/sign-out" element={<SignOut />} />
          <Route path="/music/playlists" element={<Playlists />}></Route>
          <Route path="/artists" element={<Artists />}></Route>
        </Route>

         {/*
        <Route 
          path="/myProfile" 
          element={
            <ProtectedRoute>
              <PrivateProfile />
            </ProtectedRoute>
          } 
        />

        
        <Route 
          path="/music/upload-song" 
          element={
            <ProtectedRoute allowedRoles={['artist']}>
              <UploadSong />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/music/create-album" 
          element={
            <ProtectedRoute allowedRoles={['artist']}>
              <CreateAlbum />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/music/create-playlist" 
          element={
            <ProtectedRoute allowedRoles={['listener']}>
              <CreatePlaylist />
            </ProtectedRoute>
          } 
        />


        
       
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} /> 
        
        
        
        */}
      </Routes>  
    </BrowserRouter>
  );
}

export default App;