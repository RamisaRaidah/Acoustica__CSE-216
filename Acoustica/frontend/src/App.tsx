import { BrowserRouter, Routes, Route, Outlet, useNavigate, Navigate } from 'react-router-dom';

import SignIn from '@/pages/auth/sign_in/Sign_in.tsx';
import SignUp from '@/pages/auth/sign_up/Sign_up.tsx';
import SignOut from '@/pages/auth/sign_out/Sign_out.tsx';
import Onboarding from '@/pages/auth/onboarding/Onboarding.tsx';
import MyProfile from '@/pages/user/profile/private/MyProfile.tsx';
import Plans from '@/pages/subscriptions/plans/Plans';
import PlanDetails from '@/pages/subscriptions/plans/PlanDetails';
import Checkout from '@/pages/subscriptions/checkout/Checkout';
import CheckoutSuccess from '@/pages/subscriptions/checkout/CheckoutSuccess';
import CancelSubscription from '@/pages/subscriptions/cancel/CancelSubscription';
import CancelSuccess from '@/pages/subscriptions/cancel/CancelSuccess';
import SubscriptionDetails from '@/pages/subscriptions/subscriptions-details/SubscriptionDetails';
import FamilyManagement from '@/pages/subscriptions/family/FamilyManagement';


import Dashboard from '@/pages/user/Dashboard';
import Playlists from '@/pages/music/playlist/playlists/Playlists';
import Artists from '@/pages/user/artist/artists/Artists';
import CreateAlbum from '@/pages/music/album/create_album/CreateAlbum';
import UploadSong from '@/pages/music/song/upload_song/UploadSong';
import CreatePlaylist from '@/pages/music/playlist/create_playlist/CreatePlaylist';
// import UploadSong from './pages/music/song/upload_song/upload_song';
// import CreateAlbum from './pages/music/album/create_album/create_album';
// import Playlist from './pages/music/playlist/playlist';
// import CreatePlaylist from './pages/music/playlist/create_playlist/create_playlist';
// import PrivateProfile from './pages/profile/private/my_profile';
// import Artists from './pages/user/artist/artists/artists';

import ProtectedRoute from '@/components/routes/ProtectedRoute';
import PublicOnlyRoute from '@/components/routes/PublicOnlyRoute';
import Sidebar from '@/components/sidebar/Sidebar';
import Topbar from '@/components/topbar/Topbar';
import MusicPlayer from '@/components/music_player/MusicPlayer';
import Scrollbar from '@/components/scrollbar/Scrollbar';
import { useScroll } from '@/contexts/ScrollContext';
import { useAuth } from '@/contexts/AuthContext';

function App() {
  const scrollRef = useScroll();
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>

        <Route path='/' element={<Navigate to={'/dashboard'} replace />} />

        <Route path="/sign-in" element={<PublicOnlyRoute><SignIn /></PublicOnlyRoute>} />
        <Route path="/sign-up" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute requireOnboarding={false}><Onboarding /></ProtectedRoute>} />

        <Route element={
          <ProtectedRoute>
            <div className="app_layout">
              <Sidebar />
              <Topbar />
              <Scrollbar />
              {/* {user?.user_type === "listener" && <MusicPlayer />} */}
              <div id="content" ref={scrollRef} style={{ height: user?.user_type === "listener" ? "77vh" : "89vh" }}>
                <Outlet />
              </div>
            </div>
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/sign-out" element={<SignOut />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/plan-details/:plan_id" element={<PlanDetails />} />
          <Route path="/checkout/:plan_id" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/music/playlists" element={<Playlists />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/music/create-album" element={<CreateAlbum />} />
          <Route path="/music/create-playlist" element={<CreatePlaylist />} />
          <Route path="/music/upload-song" element={<UploadSong />} />
          <Route path="/cancel-subscription" element={<CancelSubscription />} />
          <Route path="/cancel/success" element={<CancelSuccess />} />
          <Route path="/subscription-details" element={<SubscriptionDetails />} />
          <Route path="/myFamily" element={<FamilyManagement />} />
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