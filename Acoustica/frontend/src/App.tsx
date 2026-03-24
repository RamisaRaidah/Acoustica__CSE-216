import { MusicProvider } from '@/contexts/MusicContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useParams } from 'react-router-dom';
import { useScroll } from '@/contexts/ScrollContext';
import { useAuth } from '@/contexts/AuthContext';

import ProtectedRoute from '@/components/routes/ProtectedRoute';
import PublicOnlyRoute from '@/components/routes/PublicOnlyRoute';
import Sidebar from '@/components/sidebar/Sidebar';
import Topbar from '@/components/topbar/Topbar';
import MusicPlayer from '@/components/music_player/MusicPlayer';
import Scrollbar from '@/components/scrollbar/Scrollbar';

import SignIn from '@/pages/auth/sign_in/Sign_in.tsx';
import SignUp from '@/pages/auth/sign_up/Sign_up.tsx';
import SignOut from '@/pages/auth/sign_out/Sign_out.tsx';
import Onboarding from '@/pages/auth/onboarding/Onboarding.tsx';
import UpdateAccount from './pages/auth/update_account/UpdateAccount';
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
import PlaylistProfile from '@/pages/music/playlist/playlist_profile/PlaylistProfile';
import EditPlaylist from '@/pages/music/playlist/edit_playlist/EditPlaylist';
import AlbumProfile from '@/pages/music/album/album_profile/AlbumProfile';
import EditAlbum from '@/pages/music/album/edit_album/EditAlbum';
import EditSong from '@/pages/music/song/edit_song/EditSong';
import SongProfile from '@/pages/music/song/song_profile/SongProfile';
import Explore from '@/pages/music/explore/Explore';
import { GenreProfile, MoodProfile, LanguageProfile, InstrumentProfile } from '@/pages/music/explore/explore_profiles/ExploreProfiles';
import Library from '@/pages/music/library/Library';
import ArtistProfile from './pages/user/profile/public/ArtistProfile';

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
            <NotificationProvider>
              <MusicProvider>
                <div className="app_layout">
                  <Sidebar />
                  <Topbar />
                  <Scrollbar />
                  {user?.user_type === "listener" && <MusicPlayer />}
                  <div id="content" ref={scrollRef} style={{ height: user?.user_type === "listener" ? "77vh" : "89vh" }}>
                    <Outlet />
                  </div>
                </div>
              </MusicProvider>
            </NotificationProvider>
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/sign-out" element={<SignOut />} />
          <Route path="/update-Account" element={<UpdateAccount/>}/>
          <Route path="/plans" element={<Plans />} />
          <Route path="/plan-details/:plan_id" element={<PlanDetails />} />
          <Route path="/checkout/:plan_id" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/music/playlists" element={<Playlists />} />
          <Route path="/music/playlists/:playlist_id" element={<PlaylistProfile />} />
          <Route path="/music/playlists/:playlist_id/edit" element={<EditPlaylist />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/music/create-album" element={<CreateAlbum />} />
          <Route path="/music/albums/:album_id" element={<AlbumProfile />} />
          <Route path="/music/albums/:album_id/edit" element={<EditAlbum />} />
          <Route path="/music/create-playlist" element={<CreatePlaylist />} />
          <Route path="/music/upload-song" element={<UploadSong />} />
          <Route path="/music/songs/:song_id" element={<SongProfile />} />
          <Route path="/music/songs/:song_id/edit" element={<EditSong />} />
          <Route path="/cancel-subscription" element={<CancelSubscription />} />
          <Route path="/cancel/success" element={<CancelSuccess />} />
          <Route path="/subscription-details" element={<SubscriptionDetails />} />
          <Route path="/myFamily" element={<FamilyManagement />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/explore/genres/:genre_name" element={<GenreProfile />} />
          <Route path="/explore/moods/:mood_name" element={<MoodProfile />} />
          <Route path="/explore/languages/:language_name" element={<LanguageProfile />} />
          <Route path="/explore/instruments/:instrument_name" element={<InstrumentProfile />} />
          <Route path="/music/library" element={<Library />} />
          <Route path="/artists/:artist_id" element={<ArtistProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;