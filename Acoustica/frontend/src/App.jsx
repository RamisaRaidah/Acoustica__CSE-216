import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import SignIn from '/src/pages/auth/Sign_in/sign_in.jsx';
// import SignUp from '/src/pages/auth/Sign_up/sign_up.jsx';
// import SignOut from '/src/pages/auth/Sign_out/sign_out.jsx';
// import Dashboard from '/src/pages/user/dashboard.jsx';
// import UploadSong from '/src/pages/music/song/upload_song/upload_song.jsx';
// import CreateAlbum from '/src/pages/music/album/create_album/create_album.jsx';
// import Playlist from './pages/music/playlist/playlist.jsx';
// import CreatePlaylist from '/src/pages/music/playlist/create_playlist/create_playlist.jsx';
// import PrivateProfile from '/src/pages/profile/private/my_profile.jsx';
// import Onboarding from '/src/pages/auth/Onboarding/onboarding.jsx';
// import Artists from '/src/pages/user/artist/artists/artists.jsx';

import ProtectedRoute from '/src/components/Routes/ProtectedRoute.jsx';
import PublicOnlyRoute from '/src/components/Routes/PublicOnlyRoute.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route 
          path="/sign-in" 
          element={
            <PublicOnlyRoute>
              <SignIn/>
            </PublicOnlyRoute>
          } 
        />
        {/* <Route 
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
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

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


        
       
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} /> 
        
        */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;