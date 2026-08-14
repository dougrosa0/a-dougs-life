const fs = require('fs');
const path = require('path');
const { layout } = require('./layout');

const THUMB_DIR = path.join(__dirname, '..', 'public', 'photos', 'thumb');

// Photos too wide to survive a square crop. Their thumbnail is cut 2:1 instead
// and the tile spans two columns. The family line-up is nearly as wide as its
// own frame, so a square would always lose whoever stands on the ends.
const WIDE = new Set(['photo-19.jpg']);

// Display order. Reorder these lines to reorder the grid; the note after each
// filename is just so you do not have to open the file to know which is which.
// Anything in the photos directory but missing from this list is appended at
// the end, so re-running scripts/optimize-photos.js can never blank the page.
const ORDER = [
  // The three that open the page.
  'photo-19.jpg', // family on the beach
  'photo-02.jpg', // couple dancing in the valley
  'photo-03.jpg', // summit selfie

  // Colorado, oldest first.
  'photo-01.jpg', // dog in the wildflowers below Crested Butte
  'photo-04.jpg', // skin track up the snowfield
  'photo-05.jpg', // skis laid out behind the truck
  'photo-06.jpg', // sunset, the ring
  'photo-07.jpg', // alpine lake reflection

  // San Diego, oldest first.
  'photo-15.jpg', // OK sign in the water off the palms
  'photo-17.jpg', // scooter with the board rack
  'photo-10.jpg', // wetsuit, out past the break
  'photo-14.jpg', // carrying the board down to the beach
  'photo-16.jpg', // paraglider over the cliffs
  'photo-11.jpg', // rollerblading up the coast highway

  // Everything else, oldest first.
  'photo-08.jpg', // two dogs in the back seat
  'photo-20.jpg', // paddling with the dog swimming alongside
  'photo-12.jpg', // tandem skydive
  'photo-13.jpg', // the raft in the whitewater
  'photo-18.jpg', // kayak bow at sunset
  'photo-09.jpg', // the soccer team and the trophy
];

// Read once at boot, the way the rest of the site treats its content as fixed.
// Adding a photo means re-running the script and deploying, so there is nothing
// to gain from hitting the disk on every request.
const AVAILABLE = new Set(
  fs.readdirSync(THUMB_DIR).filter((name) => name.endsWith('.jpg'))
);

const PHOTOS = [
  ...ORDER.filter((name) => AVAILABLE.has(name)),
  ...[...AVAILABLE].filter((name) => !ORDER.includes(name)).sort(),
];

function lifePage() {
  const tiles = PHOTOS.map((name) => {
    const wide = WIDE.has(name);
    return `
      <li${wide ? ' class="wide"' : ''}>
        <a href="/photos/full/${name}">
          <img src="/photos/thumb/${name}" alt="" width="${wide ? 1200 : 600}" height="600" loading="lazy">
        </a>
      </li>`;
  }).join('');

  const body = `
    <h2>My Life: a 14,000 ft view</h2>
    <ul class="photo-grid">${tiles}
    </ul>
  `;

  return layout({ title: 'My Life', body });
}

module.exports = { lifePage };
