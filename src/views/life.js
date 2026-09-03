const fs = require('fs');
const path = require('path');
const { layout } = require('./layout');
const { escapeHtml } = require('./escape');

const THUMB_DIR = path.join(__dirname, '..', 'public', 'photos', 'thumb');

// Photos too wide to survive a square crop. Their thumbnail is cut 2:1 instead
// and the tile spans two columns. The family line-up is nearly as wide as its
// own frame, so a square would always lose whoever stands on the ends.
const WIDE = new Set(['photo-19.jpg']);

// Display order, and what each photo shows. Reorder these lines to reorder the
// grid. The description becomes the alt text, so it is read aloud by a screen
// reader and shown if the image never loads: say what is in the frame, not
// what the file is called. Anything in the photos directory but missing from
// this list is appended at the end, so re-running scripts/optimize-photos.js
// can never blank the page.
const ORDER = [
  // The three that open the page.
  { file: 'photo-19.jpg', alt: 'Family lined up on the beach' },
  { file: 'photo-02.jpg', alt: 'A couple dancing in the valley' },
  { file: 'photo-03.jpg', alt: 'Summit selfie' },

  // Colorado, oldest first.
  { file: 'photo-01.jpg', alt: 'A dog in the wildflowers below Crested Butte' },
  { file: 'photo-04.jpg', alt: 'A skin track cut up the snowfield' },
  { file: 'photo-05.jpg', alt: 'Skis laid out behind the truck' },
  { file: 'photo-06.jpg', alt: 'The ring, at sunset' },
  { file: 'photo-07.jpg', alt: 'An alpine lake holding the reflection of the peaks' },

  // San Diego, oldest first.
  { file: 'photo-15.jpg', alt: 'An OK sign thrown from the water, off the palms' },
  { file: 'photo-17.jpg', alt: 'A scooter with a surfboard rack' },
  { file: 'photo-10.jpg', alt: 'In a wetsuit, out past the break' },
  { file: 'photo-14.jpg', alt: 'Carrying a board down to the beach' },
  { file: 'photo-16.jpg', alt: 'A paraglider over the cliffs' },
  { file: 'photo-11.jpg', alt: 'Rollerblading up the coast highway' },

  // Everything else, oldest first.
  { file: 'photo-08.jpg', alt: 'Two dogs in the back seat' },
  { file: 'photo-20.jpg', alt: 'Paddling with a dog swimming alongside' },
  { file: 'photo-12.jpg', alt: 'A tandem skydive' },
  { file: 'photo-13.jpg', alt: 'The raft in the whitewater' },
  { file: 'photo-18.jpg', alt: 'The bow of a kayak at sunset' },
  { file: 'photo-09.jpg', alt: 'The soccer team with the trophy' },
];

// Read once at boot, the way the rest of the site treats its content as fixed.
// Adding a photo means re-running the script and deploying, so there is nothing
// to gain from hitting the disk on every request.
const AVAILABLE = new Set(
  fs.readdirSync(THUMB_DIR).filter((name) => name.endsWith('.jpg'))
);

// Listed photos in their listed order, then anything on disk the list has not
// caught up with. An unlisted photo gets an empty description rather than an
// invented one, which marks it decorative instead of lying about what it shows.
const PHOTOS = [
  ...ORDER.filter((photo) => AVAILABLE.has(photo.file)),
  ...[...AVAILABLE]
    .filter((name) => !ORDER.some((photo) => photo.file === name))
    .sort()
    .map((file) => ({ file, alt: '' })),
];

function lifePage() {
  const tiles = PHOTOS.map(({ file, alt }) => {
    const wide = WIDE.has(file);
    return `
      <li${wide ? ' class="wide"' : ''}>
        <a href="/photos/full/${file}">
          <img src="/photos/thumb/${file}" alt="${escapeHtml(alt)}" width="${wide ? 1200 : 600}" height="600" loading="lazy">
        </a>
      </li>`;
  }).join('');

  const body = `
    <h2>My Life: a 14,000 ft view</h2>
    <ul class="photo-grid">${tiles}
    </ul>
  `;

  return layout({ title: 'My Life', path: '/life', body });
}

module.exports = { lifePage, ORDER, PHOTOS };
