import router from '/src/utils/routers.js';
import { getLastListening } from '/src/services/user.js';
import MusicPlayer from '/src/components/music_player/music_player.js';
import { renderUnauthorized } from '/src/pages/user/unauthorized/unauthorized.js';
import { renderSignIn } from '/src/pages/auth/Sign_in/sign_in.js';
import { renderSignUp } from '/src/pages/auth/Sign_up/sign_up.js';
import { renderSignOut } from '/src/pages/auth/Sign_out/sign_out.js';
import { renderDashboard } from '/src/pages/user/dashboard.js';
import { renderUploadSong } from '/src/pages/music/song/upload_song/upload_song.js';
import { renderCreateAlbum } from '/src/pages/music/album/create_album/create_album.js';
import { renderCreatePlaylist } from '/src/pages/music/playlist/create_playlist/create_playlist.js';
import { renderPrivateProfile } from '/src/pages/profile/private/my_profile.js';


//-----------------------------------User---------------------------------------------------//
router.register('/unauthorized', renderUnauthorized);
router.register('/dashboard', renderDashboard,  {   protected: true, 
                                                    allowedRoles: ['listener', 'artist', 'admin'], 
                                                    requiresOnboarding: true 
                                                });

//---------------------------------Music-----------------------------------------//
router.register('/music/upload-song', renderUploadSong, { protected: true, 
                                                          allowedRoles: ['artist'],
                                                          requiresOnboarding: true
                                                        });
router.register('/music/create-album', renderCreateAlbum, { protected: true, 
                                                            allowedRoles: ['artist'],
                                                            requiresOnboarding: true });
router.register('/music/create-playlist', renderCreatePlaylist, { protected: true, 
                                                                  allowedRoles: ['listener'],
                                                                requiresOnboarding: true });


//--------------------------Auth Routes---------------------------------------------------------------//
router.register('/sign-in', renderSignIn, { publicOnly: true});
router.register('/sign-up', renderSignUp, { publicOnly: true});
router.register('/sign-out', renderSignOut,{ protected: true, allowedRoles: ['listener', 'artist', 'admin'] });

//----------------------------Profiles-------------------------------------------------------------//
router.register('/myProfile',renderPrivateProfile,{protected:true, requiresOnboarding: true});

document.addEventListener('click', (e) => {
  if (e.target.matches('[data-link]')) {
    e.preventDefault();
    router.navigate(e.target.getAttribute('href'));
  }
});

document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
});

function loadTheme() {
  const theme = localStorage.getItem('theme');
  if (theme === 'light') {
    document.body.classList.remove('dark');
  }
  else {
    document.body.classList.add('dark');
  }
}

router.init();

const currentPath = window.location.pathname;
if (currentPath === '/' || currentPath === '') {
    router.navigate('/dashboard');
}

const lastListening = await getLastListening();
MusicPlayer.savePlayerState({
  songId: lastListening['song_id'], 
  albumId: lastListening['album_id'],
  title: lastListening['title'],
  artist: lastListening['artist'],
  progress: lastListening['progress'], 
  isPlaying: false
});