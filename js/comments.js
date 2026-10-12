// comments.js — anonymous comment system
// Storage: localStorage (demo). Swap STORAGE_BACKEND to 'firebase' or
// 'supabase' when you're ready for real persistence.
//
// HOW TO UPGRADE TO FIREBASE (free tier):
//   1. Create a Firebase project at console.firebase.google.com
//   2. Enable Realtime Database (start in test mode)
//   3. Add your firebaseConfig below
//   4. Set STORAGE_BACKEND = 'firebase'
//
// HOW TO UPGRADE TO SUPABASE (free tier):
//   1. Create project at supabase.com
//   2. Create a 'comments' table: id, release_id, text, image_url, timestamp
//   3. Enable Row Level Security (anon can insert + select)
//   4. Add your Supabase URL + anon key below
//   5. Set STORAGE_BACKEND = 'supabase'

const STORAGE_BACKEND = 'local'; // 'local' | 'firebase' | 'supabase'

// ─── Firebase config (fill in when ready) ───────────────────────
// const firebaseConfig = {
//   apiKey: "...",
//   authDomain: "...",
//   databaseURL: "...",
//   projectId: "...",
// };

// ─── Supabase config (fill in when ready) ───────────────────────
// const SUPABASE_URL  = 'https://xxx.supabase.co';
// const SUPABASE_ANON = 'your-anon-key';

// ─── Helpers ────────────────────────────────────────────────────
function getReleaseId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || 'default';
}

function storageKey(id) { return `33mm_comments_${id}`; }

function safeImageSrc(src) {
  if (typeof src !== 'string') return '';
  if (!/^data:image\/(?:png|jpe?g|gif|webp);base64,/i.test(src)) return '';
  if (/["'<>]/.test(src)) return '';
  return src;
}

function loadComments(releaseId) {
  if (STORAGE_BACKEND === 'local') {
    try { return JSON.parse(localStorage.getItem(storageKey(releaseId)) || '[]'); }
    catch { return []; }
  }
  return []; // Firebase/Supabase paths return via async calls
}

function saveComment(releaseId, comment) {
  if (STORAGE_BACKEND === 'local') {
    const all = loadComments(releaseId);
    all.push(comment);
    localStorage.setItem(storageKey(releaseId), JSON.stringify(all));
    renderComments(releaseId);
  }
}

// ─── Render ─────────────────────────────────────────────────────
function renderComments(releaseId, filter = '') {
  const list = document.getElementById('commentList');
  const countEl = document.getElementById('commentCount');
  if (!list) return;

  const comments = loadComments(releaseId);
  const filtered = filter
    ? comments.filter(c => c.text.toLowerCase().includes(filter.toLowerCase()))
    : comments;

  if (countEl) countEl.textContent = `${comments.length} ${comments.length === 1 ? 'reply' : 'replies'}`;

  if (filtered.length === 0) {
    list.innerHTML = '<div class="comment-empty">No replies yet. Be the first.</div>';
    return;
  }

  list.innerHTML = filtered.map((c, i) => `
    <div class="comment-post" id="post-${c.id}">
      <div class="comment-post-header">
        <span class="comment-anon">Anonymous</span>
        <span class="comment-date">${formatDate(c.timestamp)}</span>
        <span class="comment-id">No.${c.id}</span>
        <button class="comment-quote" data-id="${c.id}" title="Quote this post">[Reply]</button>
      </div>
      ${safeImageSrc(c.image) ? `<div class="comment-file">
        <img class="comment-img" src="${safeImageSrc(c.image)}" alt="Post image" loading="lazy" />
      </div>` : ''}
      <div class="comment-body">${escapeHtml(c.text).replace(/\n/g, '<br/>')}</div>
    </div>
  `).join('');

  // Wire quote buttons
  list.querySelectorAll('.comment-quote').forEach(btn => {
    btn.addEventListener('click', () => {
      const ta = document.getElementById('postText');
      if (ta) {
        ta.value = `>>No.${btn.dataset.id}\n` + ta.value;
        ta.focus();
        document.getElementById('postForm')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

function formatDate(ts) {
  const d = new Date(ts);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())} `
       + `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ─── Image preview ───────────────────────────────────────────────
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Init ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const releaseId  = getReleaseId();
  const postText   = document.getElementById('postText');
  const postSubmit = document.getElementById('postSubmit');
  const postImage  = document.getElementById('postImage');
  const postPreview = document.getElementById('postImagePreview');
  const postChars  = document.getElementById('postChars');
  const fileLabel  = document.querySelector('.post-file-label');
  const threadSearch = document.getElementById('threadSearch');

  let pendingImageDataURL = null;

  // Initial render
  renderComments(releaseId);

  // Char counter
  postText?.addEventListener('input', () => {
    const len = postText.value.length;
    if (postChars) postChars.textContent = `${len} / 2000`;
  });

  // Image file pick
  postImage?.addEventListener('change', async () => {
    const file = postImage.files[0];
    if (!file) return;
    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB.');
      postImage.value = '';
      return;
    }
    pendingImageDataURL = await fileToDataURL(file);
    if (postPreview) {
      postPreview.innerHTML = `<img src="${pendingImageDataURL}" alt="Preview" style="max-height:120px; border-radius:4px;" />
        <button id="clearImg" style="display:block; margin-top:4px; background:none; border:none; color:#888; cursor:pointer; font-size:12px;">Remove image</button>`;
      postPreview.classList.remove('hidden');
      postPreview.querySelector('#clearImg')?.addEventListener('click', () => {
        pendingImageDataURL = null;
        postPreview.innerHTML = '';
        postPreview.classList.add('hidden');
        postImage.value = '';
      });
    }
  });

  // Submit post
  postSubmit?.addEventListener('click', () => {
    const text = postText?.value.trim();
    if (!text && !pendingImageDataURL) {
      postText?.focus();
      return;
    }

    const comment = {
      id:        generateId(),
      timestamp: Date.now(),
      text:      text || '',
      image:     pendingImageDataURL || null,
    };

    saveComment(releaseId, comment);

    // Reset form
    if (postText)  { postText.value = ''; }
    if (postChars) { postChars.textContent = '0 / 2000'; }
    pendingImageDataURL = null;
    if (postPreview) { postPreview.innerHTML = ''; postPreview.classList.add('hidden'); }
    if (postImage)   { postImage.value = ''; }

    // Scroll to newest comment
    document.getElementById('commentList')?.lastElementChild
      ?.scrollIntoView({ behavior: 'smooth' });
  });

  // Submit on Ctrl/Cmd + Enter
  postText?.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      postSubmit?.click();
    }
  });

  // Search / filter
  threadSearch?.addEventListener('input', () => {
    renderComments(releaseId, threadSearch.value);
  });
});
