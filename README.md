# Pain Heals

Official site for 33murderme / Pain Heals. Static HTML, CSS, and JavaScript. No build step.

## Run it locally

From this folder:

```bash
python -m http.server 8000
```

Open [http://127.0.0.1:8000/](http://127.0.0.1:8000/).

## Pages

| Page | File |
| --- | --- |
| Home | `index.html` |
| Albums | `albums.html`, `album-pain-heals.html`, `album-pain-heals-part-i.html`, `album-pain-heals-part-ii.html` |
| Before Pain Heals [vault] | `singles.html` |
| Updates | `releases.html` |
| Photos | `photos.html` |
| Music videos | `music-videos.html` |
| Visualizers | `visualizers.html` |
| Cookbook | `cookbook.html` |
| Merch | `merch.html` |
| Games | `games.html`, `game-trex.html` |
| Book | `book.html` |
| Advertisements | `advertisements.html` |

Audio lives in `assets/music/`. Photos live in `photos/`.

## Adding photos

Put the image in `photos/` and add its filename to `photos/manifest.json`. Hosts that turn directory listing off use that file to build the gallery.

## Notes

- Replies, comments, and the cart are stored in the visitor’s browser (`localStorage`). They are not a shared database.
- The homepage email form posts to a Google Apps Script. The script URL is in `index.html`.
