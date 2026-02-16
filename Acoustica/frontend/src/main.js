import router from './utils/routers.js';
import { renderHome } from './pages/home/home.js';
import { renderAssets } from './pages/assets/assets.js';
import { renderMusic } from './pages/music_player/music_player.js';


router.register('/', renderHome);
router.register('/home', renderHome);
router.register('/assets', renderAssets);
router.register('/music', renderMusic);


document.addEventListener('click', (e) => {
  if (e.target.matches('[data-link]')) {
    e.preventDefault();
    router.navigate(e.target.getAttribute('href'));
  }
});

router.init();