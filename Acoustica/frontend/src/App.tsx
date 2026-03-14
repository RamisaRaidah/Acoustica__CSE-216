import { BrowserRouter, Routes, Route } from 'react-router-dom';

import SignIn from '@/pages/auth/Sign_in/sign_in.tsx';
import SignUp from '@/pages/auth/Sign_up/sign_up.tsx';
import SignOut from '@/pages/auth/Sign_out/sign_out.tsx';
import Onboarding from '@/pages/auth/Onboarding/onboarding.tsx';
import MyProfile from '@/pages/profile/private/my_profile.tsx';

import { Dashboard } from '@/pages/user/Dashboard';
// import UploadSong from './pages/music/song/upload_song/upload_song';
// import CreateAlbum from './pages/music/album/create_album/create_album';
// import Playlist from './pages/music/playlist/playlist';
// import CreatePlaylist from './pages/music/playlist/create_playlist/create_playlist';
// import PrivateProfile from './pages/profile/private/my_profile';
// import Artists from './pages/user/artist/artists/artists';

import ProtectedRoute from './components/Routes/ProtectedRoute.tsx';
import PublicOnlyRoute from './components/Routes/PublicOnlyRoute.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route 
          path="/sign-in" 
          element={
            <PublicOnlyRoute>
              <SignIn />
            </PublicOnlyRoute>
          } 
        />
        <Route 
          path="/sign-up" 
          element={
            <PublicOnlyRoute>
              <SignUp/>
            </PublicOnlyRoute>
          } 
        />


        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoute requireOnboarding={false}>
              <Onboarding/>
            </ProtectedRoute>
          } 
        />

        <Route
          path="/sign-out"
          element={
            <ProtectedRoute>
              <SignOut/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-profile"
          element={
            <ProtectedRoute>
              <MyProfile/>
            </ProtectedRoute>
          }
        />

        
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
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>  
    </BrowserRouter>
  );
}

export default App;