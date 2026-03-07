import router from '/src/utils/routers.js';
import { initScrollbar } from '/src/components/scrollbar/scrollbar.js';
import { renderUnauthorized } from '/src/pages/user/unauthorized/unauthorized.js';
import { renderSignIn } from '/src/pages/auth/Sign_in/sign_in.js';
import { renderSignUp } from '/src/pages/auth/Sign_up/sign_up.js';
import { renderSignOut } from '/src/pages/auth/Sign_out/sign_out.js';
import { renderDashboard } from '/src/pages/user/dashboard.js';
import { renderUploadSong } from '/src/pages/music/song/upload_song/upload_song.js';
import { renderCreateAlbum } from '/src/pages/music/album/create_album/create_album.js';
import { renderPlaylist } from './pages/music/playlist/playlist.js';
import { renderCreatePlaylist } from '/src/pages/music/playlist/create_playlist/create_playlist.js';
import { renderPrivateProfile } from '/src/pages/profile/private/my_profile.js';
import { renderOnboarding } from '/src/pages/auth/Onboarding/onboarding.js';
import { renderArtists } from '/src/pages/user/artist/artists/artists.js';

//-----------------------------------User---------------------------------------------------//
router.register('/unauthorized', renderUnauthorized);
router.register('/dashboard', renderDashboard,  {   protected: true, 
                                                    allowedRoles: ['listener', 'artist', 'admin'], 
                                                    requiresOnboarding: true 
                                                });
router.register('/artists', renderArtists, { protected: true, 
                                                    allowedRoles: ['listener'],
                                                    requiresOnboarding: true 
                                                  });

//---------------------------------Music-----------------------------------------//
router.register('/music/song/upload-song', renderUploadSong, { protected: true, 
                                                                allowedRoles: ['artist'],
                                                                requiresOnboarding: true
                                                              });
router.register('/music/album/create-album', renderCreateAlbum, { protected: true, 
                                                                  allowedRoles: ['artist'],
                                                                  requiresOnboarding: true });
router.register('/music/playlists', renderPlaylist, { protected: true, 
                                                      allowedRoles: ['listener'],
                                                      requiresOnboarding: true 
                                                    });  
router.register('/music/playlist/create-playlist', renderCreatePlaylist, { protected: true, 
                                                                            allowedRoles: ['listener'],
                                                                            requiresOnboarding: true 
                                                                          });


//-------------------------- Auth ---------------------------------------------------------------//
router.register('/sign-in', renderSignIn, { publicOnly: true});
router.register('/sign-up', renderSignUp, { publicOnly: true});
router.register('/sign-out', renderSignOut,{ protected: true, allowedRoles: ['listener', 'artist', 'admin'] });
router.register('/onboarding',renderOnboarding,{protected:true,
                                                allowedRoles: ['listener', 'artist', 'admin'],
                                                requiresOnboarding: false
                                              });

//---------------------------- Profiles -------------------------------------------------------------//
router.register('/myProfile',renderPrivateProfile,{protected:true, requiresOnboarding: true});

document.addEventListener('click', (e) => {
  if (e.target.matches('[data-link]')) {
    e.preventDefault();
    router.navigate(e.target.getAttribute('href'));
  }
});

document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  initScrollbar();
;});

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