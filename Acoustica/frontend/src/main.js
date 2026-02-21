import router from '/src/utils/routers.js';
import { renderSignIn } from '/src/pages/auth/Sign_in/sign_in.js';
import { renderSignUp } from '/src/pages/auth/Sign_up/sign_up.js';
import { renderOnboarding } from '/src/pages/auth/Onboarding/onboarding.js';
import { renderSignOut } from '/src/pages/auth/Sign_out/sign_out.js';
import { renderDashboard } from '/src/pages/user/listener/dashboard/dashboard.js';
import { renderUploadSong } from '/src/pages/music/song/upload_song/upload_song.js';
import { renderCreateAlbum } from '/src/pages/music/song/create_album/create_album.js';



//-----------------------------------User---------------------------------------------------//
router.register('/dashboard', renderDashboard, { protected: true });

//---------------------------------Music-----------------------------------------//
router.register('/music/upload-song', renderUploadSong, { protected: true });
router.register('/music/create-album', renderCreateAlbum, { protected: true });


//--------------------------Auth Routes---------------------------------------------------------------//
router.register('/sign-in', renderSignIn, { publicOnly: true });
router.register('/sign-up', renderSignUp, { publicOnly: true });
//router.register('/onboarding', renderOnboarding, { protected: true });
router.register('/sign-out', renderSignOut,{ protected: true });

document.addEventListener('click', (e) => {
  if (e.target.matches('[data-link]')) {
    e.preventDefault();
    router.navigate(e.target.getAttribute('href'));
  }
});

router.init();
