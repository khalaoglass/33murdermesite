/* thread-replies.js — inline anonymous replies under each board thread
   Storage: localStorage, scoped per thread by data-thread-id.
   Identity: persistent anonymous ID (33mm_anon_id) stored in localStorage.
             The author can delete their own comments; others cannot.
   Edge cases handled:
     - XSS: all user text is escaped before rendering
     - Spam: 5-second cooldown between posts per thread
     - Empty submit: blocked (need text or image)
     - Character limit: 2000 chars
     - Image size: max 2MB (base64 in localStorage)
     - localStorage quota: caught gracefully with user alert
     - Duplicate form opens: only one reply form visible at a time
     - Delete: only visible to the original poster (matched by anon ID)
*/

(function () {
  'use strict';

  var COOLDOWN_MS = 5000;
  var MAX_CHARS   = 2000;
  var MAX_IMG_MB  = 2;
  var lastPostTime = {};

  /* ─── Anonymous identity ────────────────────────────────────── */
  function getAnonId() {
    var id = localStorage.getItem('33mm_anon_id');
    if (!id) {
      id = 'anon-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('33mm_anon_id', id);
    }
    return id;
  }
  var ANON_ID = getAnonId();

  /* ─── Helpers ───────────────────────────────────────────────── */
  function esc(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function fmtDate(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + ' '
         + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  function storageKey(threadId) { return '33mm_replies_' + threadId; }

  function safeImageSrc(src) {
    if (typeof src !== 'string') return '';
    if (!/^data:image\/(?:png|jpe?g|gif|webp);base64,/i.test(src)) return '';
    if (/["'<>]/.test(src)) return '';
    return src;
  }

  function loadReplies(threadId) {
    try { return JSON.parse(localStorage.getItem(storageKey(threadId)) || '[]'); }
    catch (e) { return []; }
  }

  function saveReplies(threadId, replies) {
    try {
      localStorage.setItem(storageKey(threadId), JSON.stringify(replies));
    } catch (e) {
      alert('Storage full — replies cannot be saved. Try clearing old data.');
    }
  }

  function fileToDataURL(file, cb) {
    var reader = new FileReader();
    reader.onload = function (e) { cb(e.target.result); };
    reader.onerror = function () { cb(null); };
    reader.readAsDataURL(file);
  }

  /* ─── Render replies list ──────────────────────────────────── */
  function renderReplies(threadId, container) {
    var replies = loadReplies(threadId);
    if (!replies.length) {
      container.innerHTML = '<div class="reply-empty">No replies yet.</div>';
      return;
    }

    container.innerHTML = replies.map(function (r) {
      var isOwner = r.authorId === ANON_ID;
      return '<div class="reply-post" id="rp-' + r.id + '">'
        + '<div class="reply-post-header">'
        +   '<span class="thread-author">Anonymous' + (isOwner ? ' <span class="reply-you">(You)</span>' : '') + '</span>'
        +   '<span class="thread-date">' + fmtDate(r.timestamp) + '</span>'
        +   '<span class="thread-no">No.' + r.id + '</span>'
        +   '<button class="reply-quote-btn" data-id="' + r.id + '" data-thread="' + threadId + '">[Quote]</button>'
        +   (isOwner ? '<button class="reply-delete-btn" data-id="' + r.id + '" data-thread="' + threadId + '">[Delete]</button>' : '')
        + '</div>'
        + (safeImageSrc(r.image) ? '<div class="reply-file"><img class="reply-img" src="' + safeImageSrc(r.image) + '" alt="image" loading="lazy" /></div>' : '')
        + '<div class="reply-body">' + esc(r.text).replace(/\n/g, '<br/>') + '</div>'
        + '</div>';
    }).join('');

    // Wire quote buttons
    container.querySelectorAll('.reply-quote-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var form = document.querySelector('.reply-form-wrap[data-thread="' + btn.dataset.thread + '"]');
        if (!form) return;
        var ta = form.querySelector('.reply-textarea');
        if (ta) {
          ta.value = '>>No.' + btn.dataset.id + '\n' + ta.value;
          ta.focus();
        }
      });
    });

    // Wire delete buttons
    container.querySelectorAll('.reply-delete-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!confirm('Delete this reply?')) return;
        var tid = btn.dataset.thread;
        var rid = btn.dataset.id;
        var replies = loadReplies(tid);
        var filtered = replies.filter(function (r) {
          return !(r.id === rid && r.authorId === ANON_ID);
        });
        saveReplies(tid, filtered);
        renderReplies(tid, container);
        // Update reply count on the thread link
        var threadEl = document.querySelector('[data-thread-id="' + tid + '"]');
        if (threadEl) {
          var link = threadEl.querySelector('.thread-reply-link');
          if (link) {
            var count = filtered.length;
            link.textContent = count > 0
              ? '[' + count + ' ' + (count === 1 ? 'Reply' : 'Replies') + ']'
              : '[Reply]';
          }
        }
      });
    });
  }

  /* ─── Build reply section (form + list) ────────────────────── */
  function buildReplySection(threadEl, threadId) {
    // If already built, just toggle
    var existing = threadEl.querySelector('.reply-section');
    if (existing) {
      existing.classList.toggle('hidden');
      return;
    }

    var section = document.createElement('div');
    section.className = 'reply-section';
    section.innerHTML =
      '<div class="reply-list" data-thread="' + threadId + '"></div>'
      + '<div class="reply-form-wrap" data-thread="' + threadId + '">'
      +   '<div class="reply-form-header">Post a Reply</div>'
      +   '<div class="reply-form-body">'
      +     '<textarea class="reply-textarea" placeholder="Write your reply..." maxlength="' + MAX_CHARS + '"></textarea>'
      +     '<div class="reply-form-actions">'
      +       '<label class="reply-file-label">📎 Attach image'
      +         '<input type="file" class="reply-file-input hidden" accept="image/*" />'
      +       '</label>'
      +       '<span class="reply-chars">0 / ' + MAX_CHARS + '</span>'
      +       '<button class="reply-submit">Post</button>'
      +     '</div>'
      +     '<div class="reply-img-preview hidden"></div>'
      +   '</div>'
      + '</div>';

    threadEl.appendChild(section);

    var listEl   = section.querySelector('.reply-list');
    var textarea = section.querySelector('.reply-textarea');
    var charDisp = section.querySelector('.reply-chars');
    var submitBtn = section.querySelector('.reply-submit');
    var fileInput = section.querySelector('.reply-file-input');
    var preview   = section.querySelector('.reply-img-preview');
    var pendingImg = null;

    renderReplies(threadId, listEl);

    // Char counter
    textarea.addEventListener('input', function () {
      charDisp.textContent = textarea.value.length + ' / ' + MAX_CHARS;
    });

    // Image attach
    fileInput.addEventListener('change', function () {
      var file = fileInput.files[0];
      if (!file) return;
      if (file.size > MAX_IMG_MB * 1024 * 1024) {
        alert('Image must be under ' + MAX_IMG_MB + 'MB.');
        fileInput.value = '';
        return;
      }
      fileToDataURL(file, function (dataURL) {
        if (!dataURL) return;
        pendingImg = dataURL;
        preview.innerHTML = '<img src="' + dataURL + '" alt="Preview" style="max-height:80px;" />'
          + '<button class="reply-clear-img" type="button">✕ Remove</button>';
        preview.classList.remove('hidden');
        preview.querySelector('.reply-clear-img').addEventListener('click', function () {
          pendingImg = null;
          preview.innerHTML = '';
          preview.classList.add('hidden');
          fileInput.value = '';
        });
      });
    });

    // Submit
    submitBtn.addEventListener('click', function () {
      var text = textarea.value.trim();
      if (!text && !pendingImg) {
        textarea.focus();
        return;
      }
      if (text.length > MAX_CHARS) {
        alert('Reply is too long (' + text.length + '/' + MAX_CHARS + ').');
        return;
      }

      // Cooldown check
      var now = Date.now();
      if (lastPostTime[threadId] && now - lastPostTime[threadId] < COOLDOWN_MS) {
        var wait = Math.ceil((COOLDOWN_MS - (now - lastPostTime[threadId])) / 1000);
        alert('Please wait ' + wait + 's before posting again.');
        return;
      }

      var replies = loadReplies(threadId);
      replies.push({
        id: genId(),
        timestamp: now,
        text: text,
        image: pendingImg || null,
        authorId: ANON_ID
      });
      saveReplies(threadId, replies);
      lastPostTime[threadId] = now;

      // Reset form
      textarea.value = '';
      charDisp.textContent = '0 / ' + MAX_CHARS;
      pendingImg = null;
      preview.innerHTML = '';
      preview.classList.add('hidden');
      fileInput.value = '';

      renderReplies(threadId, listEl);

      // Scroll to newest
      var last = listEl.lastElementChild;
      if (last) last.scrollIntoView({ behavior: 'smooth' });
    });

    // Ctrl/Cmd + Enter to submit
    textarea.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        submitBtn.click();
      }
    });
  }

  /* ─── Init: assign IDs & wire [Reply] links ────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var threads = document.querySelectorAll('.board-thread');
    threads.forEach(function (threadEl, i) {
      // Assign thread ID from data attr or generate from index
      var threadId = threadEl.getAttribute('data-thread-id');
      if (!threadId) {
        var noEl = threadEl.querySelector('.thread-no');
        threadId = noEl ? noEl.textContent.replace(/\s/g, '') : 'thread-' + i;
        threadEl.setAttribute('data-thread-id', threadId);
      }

      // Show reply count on the [Reply] link
      var replyLink = threadEl.querySelector('.thread-reply-link');
      if (replyLink) {
        var count = loadReplies(threadId).length;
        if (count > 0) {
          replyLink.textContent = '[' + count + ' ' + (count === 1 ? 'Reply' : 'Replies') + ']';
        }

        replyLink.addEventListener('click', function (e) {
          e.preventDefault();
          buildReplySection(threadEl, threadId);
        });
      }
    });
  });

})();
