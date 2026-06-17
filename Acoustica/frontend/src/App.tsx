import { MusicProvider } from '@/contexts/MusicContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useParams } from 'react-router-dom';
import { useScroll } from '@/contexts/ScrollContext';
import { useAuth } from '@/contexts/AuthContext';

import ProtectedRoute from '@/components/routes/ProtectedRoute';
import PublicOnlyRoute from '@/components/routes/PublicOnlyRoute';
import AppLoader from '@/components/app_loader/AppLoader';
import Sidebar from '@/components/sidebar/Sidebar';
import Topbar from '@/components/topbar/Topbar';
import MusicPlayer from '@/components/music_player/MusicPlayer';
import Scrollbar from '@/components/scrollbar/Scrollbar';

import SignIn from '@/pages/auth/sign_in/Sign_in.tsx';
import SignUp from '@/pages/auth/sign_up/Sign_up.tsx';
import SignOut from '@/pages/auth/sign_out/Sign_out.tsx';
import Onboarding from '@/pages/auth/onboarding/Onboarding.tsx';
import UpdateAccount from './pages/user/users/update_account/UpdateAccount';
import MyProfile from '@/pages/user/profile/private/MyProfile.tsx';
import Plans from '@/pages/subscriptions/plans/Plans';
import PlanDetails from '@/pages/subscriptions/plans/PlanDetails';
import Checkout from '@/pages/subscriptions/checkout/Checkout';
import CheckoutSuccess from '@/pages/subscriptions/checkout/CheckoutSuccess';
import CancelSubscription from '@/pages/subscriptions/cancel/CancelSubscription';
import CancelSuccess from '@/pages/subscriptions/cancel/CancelSuccess';
import SubscriptionDetails from '@/pages/subscriptions/subscriptions-details/SubscriptionDetails';
import FamilyManagement from '@/pages/subscriptions/family/FamilyManagement';
import Dashboard from '@/pages/user/dashboard/Dashboard';
import Playlists from '@/pages/music/playlist/playlists/Playlists';
import Artists from '@/pages/user/artist/artists/Artists';
import CreateAlbum from '@/pages/music/album/create_album/CreateAlbum';
import UploadSong from '@/pages/music/song/upload_song/UploadSong';
import CreatePlaylist from '@/pages/music/playlist/create_playlist/CreatePlaylist';
import PlaylistProfile from '@/pages/music/playlist/playlist_profile/PlaylistProfile';
import EditPlaylist from '@/pages/music/playlist/edit_playlist/EditPlaylist';
import AlbumProfile from '@/pages/music/album/album_profile/AlbumProfile';
import EditAlbum from '@/pages/music/album/edit_album/EditAlbum';
import EditSong from '@/pages/music/song/edit_song/EditSong';
import Explore from '@/pages/music/explore/Explore';
import { GenreProfile, MoodProfile, LanguageProfile, InstrumentProfile } from '@/pages/music/explore/explore_profiles/ExploreProfiles';
import Library from '@/pages/music/library/Library';
import ArtistProfile from './pages/user/profile/public/ArtistProfile';
import Discography from '@/pages/user/artist/artist_discography/ArtistDiscography';
import FamilySharedContents from '@/pages/social/family/FamilySharedContents';
import Reports from '@/pages/reports/reports_/Reports';
import ActivityLog from '@/pages/reports/activity-log/ActivityLog';
import AboutUs from '@/pages/about_us/AboutUs';

import DeleteAccount from '@/pages/user/users/delete-account/DeleteAccount';
import ChangePassword from '@/pages/user/users/change-password/ChangePassword';
import ForgotPassword from '@/pages/user/users/forgot-pass/ForgotPassword';
import ResetPassword from '@/pages/user/users/forgot-pass/ResetPassword';

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
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword/></PublicOnlyRoute>}/>
        <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword/></PublicOnlyRoute>}/>

        <Route element={
            <NotificationProvider>
              <MusicProvider>
                <AppLoader>
                  <div className="app_layout">
                    <Sidebar />
                    <Topbar />
                    <Scrollbar />
                    {user?.user_type === "listener" && <MusicPlayer />}
                    <div id="content" ref={scrollRef} style={{ height: user?.user_type === "listener" ? "77vh" : "89vh" }}>
                      <Outlet />
                    </div>
                  </div>
                </AppLoader>
              </MusicProvider>
            </NotificationProvider>
          
        }>
          <Route path="/dashboard" element={<Dashboard />} />
        
            <Route path="/dashboard" element={<ProtectedRoute requireOnboarding={true}><Dashboard /></ProtectedRoute>} />
            <Route path="/my-profile" element={<ProtectedRoute requireOnboarding={true}><MyProfile /></ProtectedRoute>} />
            <Route path="/sign-out" element={<ProtectedRoute requireOnboarding={false}><SignOut /></ProtectedRoute>} />
            <Route path="/update/account" element={<ProtectedRoute requireOnboarding={true}><UpdateAccount /></ProtectedRoute>} />
            
            <Route path="/artists" element={<ProtectedRoute requireOnboarding={true}><Artists /></ProtectedRoute>} />
            <Route path="/artists/:artist_id" element={<ProtectedRoute requireOnboarding={true}><ArtistProfile /></ProtectedRoute>} />
            <Route path="/delete/account" element={<ProtectedRoute requireOnboarding={true}><DeleteAccount /></ProtectedRoute>} />
            <Route path="/change/password" element={<ProtectedRoute requireOnboarding={true}><ChangePassword /></ProtectedRoute>} />
            <Route path="/about-us" element={<ProtectedRoute requireOnboarding={true}><AboutUs /></ProtectedRoute>} />

      
            <Route path="/plans" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["listener"]}><Plans /></ProtectedRoute>} />
            <Route path="/plan-details/:plan_id" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["listener"]}><PlanDetails /></ProtectedRoute>} />
            <Route path="/checkout/:plan_id" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["listener"]}><Checkout /></ProtectedRoute>} />
            <Route path="/checkout/success" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["listener"]}><CheckoutSuccess /></ProtectedRoute>} />
            <Route path="/cancel-subscription" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["listener"]}><CancelSubscription /></ProtectedRoute>} />
            <Route path="/cancel/success" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["listener"]}><CancelSuccess /></ProtectedRoute>} />
            <Route path="/subscription-details" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["listener"]}><SubscriptionDetails /></ProtectedRoute>} />
            <Route path="/my-family" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["listener"]}><FamilyManagement /></ProtectedRoute>} />
            <Route path="/family/:familyId/shared-contents" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["listener"]}><FamilySharedContents /></ProtectedRoute>} />
            
            <Route path="/music/library" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["listener"]}><Library /></ProtectedRoute>} />
            <Route path="/music/playlists" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["listener"]}><Playlists /></ProtectedRoute>} />
            <Route path="/music/playlists/:playlist_id" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["listener"]}><PlaylistProfile /></ProtectedRoute>} />
            <Route path="/music/playlists/:playlist_id/edit" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["listener"]}><EditPlaylist /></ProtectedRoute>} />
            <Route path="/music/create-playlist" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["listener"]}><CreatePlaylist /></ProtectedRoute>} />
            
            <Route path="/explore" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["listener"]}><Explore /></ProtectedRoute>} />
            <Route path="/explore/genres/:genre_name" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["listener"]}><GenreProfile /></ProtectedRoute>} />
            <Route path="/explore/moods/:mood_name" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["listener"]}><MoodProfile /></ProtectedRoute>} />
            <Route path="/explore/languages/:language_name" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["listener"]}><LanguageProfile /></ProtectedRoute>} />
            <Route path="/explore/instruments/:instrument_name" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["listener"]}><InstrumentProfile /></ProtectedRoute>} />
          
            <Route path="/music/create-album" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["artist"]}><CreateAlbum /></ProtectedRoute>} />
            <Route path="/music/albums/:album_id" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["listener", "artist"]}><AlbumProfile /></ProtectedRoute>} />
            <Route path="/music/albums/:album_id/edit" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["artist"]}><EditAlbum /></ProtectedRoute>} />
            <Route path="/music/upload-song" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["artist"]}><UploadSong /></ProtectedRoute>} />
            <Route path="/music/songs/:song_id/edit" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["artist"]}><EditSong /></ProtectedRoute>} />
            <Route path="/discography" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["artist"]}><Discography /></ProtectedRoute>} />

          
            <Route path="/reports" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["admin"]}><Reports /></ProtectedRoute>} />
            <Route path="/activity-log" element={<ProtectedRoute requireOnboarding={true} allowedRoles={["admin"]}><ActivityLog /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;