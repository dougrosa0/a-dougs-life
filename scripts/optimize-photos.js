#!/usr/bin/env node
/*
 * Turns a pile of camera originals into the two web sizes /life needs.
 *
 *   node scripts/optimize-photos.js <input dir or file> [more inputs...]
 *
 * Writes src/public/photos/thumb/photo-NN.jpg (square, for the grid) and
 * src/public/photos/full/photo-NN.jpg (long edge capped, for the click target).
 *
 * Originals are never modified. EXIF is dropped, which is the point as much as
 * the file size is: phone photos carry GPS coordinates and publishing those
 * publishes where they were taken. The .rotate() call bakes in the EXIF
 * orientation first so nothing lands sideways once the tag is gone.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const THUMB_PX = 600;
const FULL_PX = 2000;
const QUALITY = 80;
const SOURCE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.heic', '.webp']);

const OUT_ROOT = path.join(__dirname, '..', 'src', 'public', 'photos');
const THUMB_DIR = path.join(OUT_ROOT, 'thumb');
const FULL_DIR = path.join(OUT_ROOT, 'full');

function collectInputs(targets) {
  const files = [];

  for (const target of targets) {
    const stat = fs.statSync(target);

    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(target).sort()) {
        const full = path.join(target, name);
        if (fs.statSync(full).isFile() && SOURCE_EXTENSIONS.has(path.extname(name).toLowerCase())) {
          files.push(full);
        }
      }
    } else if (SOURCE_EXTENSIONS.has(path.extname(target).toLowerCase())) {
      files.push(target);
    }
  }

  return files;
}

async function main() {
  const targets = process.argv.slice(2);

  if (targets.length === 0) {
    console.error('Usage: node scripts/optimize-photos.js <input dir or file> [more inputs...]');
    process.exit(1);
  }

  const sources = collectInputs(targets);

  if (sources.length === 0) {
    console.error('No images found in the given inputs.');
    process.exit(1);
  }

  // Rebuild from scratch so a removed original does not leave an orphan behind.
  fs.rmSync(OUT_ROOT, { recursive: true, force: true });
  fs.mkdirSync(THUMB_DIR, { recursive: true });
  fs.mkdirSync(FULL_DIR, { recursive: true });

  const width = String(sources.length).length;
  let thumbBytes = 0;
  let fullBytes = 0;

  for (const [index, source] of sources.entries()) {
    const name = `photo-${String(index + 1).padStart(width, '0')}.jpg`;

    const thumb = await sharp(source)
      .rotate()
      .resize(THUMB_PX, THUMB_PX, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(path.join(THUMB_DIR, name));

    const full = await sharp(source)
      .rotate()
      .resize(FULL_PX, FULL_PX, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(path.join(FULL_DIR, name));

    thumbBytes += thumb.size;
    fullBytes += full.size;

    const originalKb = Math.round(fs.statSync(source).size / 1024);
    console.log(
      `${name}  <-  ${path.basename(source)}  ` +
        `(${originalKb} KB -> ${Math.round(thumb.size / 1024)} KB thumb, ${Math.round(full.size / 1024)} KB full)`
    );
  }

  const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);
  console.log(`\n${sources.length} photos.`);
  console.log(`Grid page loads ${mb(thumbBytes)} MB of thumbnails; full copies add ${mb(fullBytes)} MB on disk.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
