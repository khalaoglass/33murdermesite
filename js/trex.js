/* trex.js — endless runner for the games board */

(function () {
  'use strict';

  var canvas = document.getElementById('trexCanvas');
  var scoreEl = document.getElementById('trexScore');
  var bestEl = document.getElementById('trexBest');
  if (!canvas || !scoreEl || !bestEl) return;

  var ctx = canvas.getContext('2d');
  var W = canvas.width;
  var H = canvas.height;
  var GROUND = 188;
  var BEST_KEY = 'painheals-trex-best';
  var STAND_H = 52;

  var state = 'ready';
  var speed = 6;
  var score = 0;
  var best = 0;
  var spawnIn = 0;
  var groundOff = 0;
  var tick = 0;
  var obstacles = [];
  var dino = { x: 48, y: null, vy: 0, duck: false, wantDuck: false };

  try {
    best = parseInt(localStorage.getItem(BEST_KEY), 10) || 0;
  } catch (e) {
    best = 0;
  }

  function pad(n) {
    var s = String(Math.floor(n));
    while (s.length < 5) s = '0' + s;
    return s;
  }

  function paintHud() {
    scoreEl.textContent = pad(score);
    bestEl.textContent = pad(best);
  }

  function onGround() {
    return dino.y == null;
  }

  function dinoTop() {
    if (!onGround()) return dino.y;
    return GROUND - (dino.duck ? 28 : STAND_H);
  }

  function dinoBox() {
    var top = dinoTop();
    if (dino.duck && onGround()) return { x: dino.x, y: top + 4, w: 66, h: 20 };
    return { x: dino.x + 12, y: top + 2, w: 30, h: STAND_H - 8 };
  }

  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function resetRun() {
    speed = 6;
    score = 0;
    spawnIn = 480;
    groundOff = 0;
    obstacles = [];
    dino.y = null;
    dino.vy = 0;
    dino.duck = false;
    state = 'run';
    paintHud();
  }

  function jump() {
    if (state !== 'run') {
      resetRun();
      return;
    }
    if (!onGround() || dino.duck) return;
    dino.y = GROUND - STAND_H;
    dino.vy = -11.6;
  }

  function spawn() {
    if (score > 160 && Math.random() < 0.34) {
      var low = Math.random() < 0.6;
      obstacles.push({
        kind: 'ptero',
        x: W + 8,
        w: 46,
        h: 16,
        y: low ? GROUND - 58 : GROUND - 112
      });
      return;
    }
    var h = Math.random() < 0.45 ? 58 : 40;
    var w = Math.random() < 0.35 ? 32 : 16;
    obstacles.push({
      kind: 'cactus',
      x: W + 8,
      w: w,
      h: h,
      y: GROUND - h
    });
  }

  function die() {
    state = 'dead';
    dino.wantDuck = false;
    dino.duck = false;
    if (score > best) {
      best = score;
      try { localStorage.setItem(BEST_KEY, String(Math.floor(best))); } catch (e) {}
    }
    paintHud();
  }

  function update(step) {
    if (state !== 'run') return;
    tick += step;
    speed = Math.min(13, 6 + score / 420);
    var dist = speed * step;
    score += dist * 0.08;
    groundOff = (groundOff + dist) % 20;
    spawnIn -= dist;
    if (spawnIn <= 0) {
      spawn();
      spawnIn = 400 + Math.random() * 280 - Math.min(130, score / 7);
    }

    if (!onGround()) {
      dino.duck = false;
      dino.vy += 0.58 * step;
      dino.y += dino.vy * step;
      if (dino.y >= GROUND - STAND_H) {
        dino.y = null;
        dino.vy = 0;
      }
    }
    if (onGround()) dino.duck = dino.wantDuck;

    var box = dinoBox();
    for (var i = obstacles.length - 1; i >= 0; i--) {
      var ob = obstacles[i];
      ob.x -= dist;
      var obBox = { x: ob.x + 6, y: ob.y + 2, w: Math.max(8, ob.w - 10), h: ob.h - 4 };
      if (overlaps(box, obBox)) die();
      if (ob.x + ob.w < -30) obstacles.splice(i, 1);
    }
    paintHud();
  }

  function drawGround() {
    ctx.strokeStyle = '#800000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND + 1);
    ctx.lineTo(W, GROUND + 1);
    ctx.stroke();
    ctx.fillStyle = '#c4b8a4';
    for (var x = -groundOff; x < W; x += 20) ctx.fillRect(x, GROUND + 6, 8, 2);
  }

  function drawDino() {
    var top = dinoTop();
    ctx.fillStyle = '#800000';
    if (dino.duck && onGround()) {
      ctx.fillRect(dino.x, top + 8, 56, 16);
      ctx.fillRect(dino.x + 44, top, 22, 14);
      ctx.fillStyle = '#fff';
      ctx.fillRect(dino.x + 58, top + 3, 4, 4);
      return;
    }
    ctx.fillRect(dino.x + 16, top + 18, 22, 24);
    ctx.fillRect(dino.x + 30, top, 18, 18);
    ctx.fillRect(dino.x + 2, top + 24, 16, 8);
    ctx.fillStyle = '#fff';
    ctx.fillRect(dino.x + 40, top + 5, 4, 4);
    ctx.fillStyle = '#800000';
    var stride = Math.floor(tick / 6) % 2;
    if (!onGround()) {
      ctx.fillRect(dino.x + 20, top + 40, 6, 10);
      ctx.fillRect(dino.x + 32, top + 40, 6, 8);
    } else {
      ctx.fillRect(dino.x + 20, top + 40, 6, stride ? 12 : 6);
      ctx.fillRect(dino.x + 32, top + 40, 6, stride ? 6 : 12);
    }
  }

  function drawObstacle(ob) {
    if (ob.kind === 'cactus') {
      ctx.fillStyle = '#2f6b3a';
      ctx.fillRect(ob.x + ob.w / 2 - 4, ob.y, 8, ob.h);
      ctx.fillRect(ob.x, ob.y + 14, ob.w, 6);
      ctx.fillRect(ob.x + 1, ob.y + 8, 5, 12);
      if (ob.w > 20) ctx.fillRect(ob.x + ob.w - 6, ob.y + 6, 5, 14);
      return;
    }
    var flap = Math.floor(tick / 8) % 2;
    ctx.fillStyle = '#5c4a32';
    ctx.fillRect(ob.x + 14, ob.y + 5, 22, 8);
    ctx.fillRect(ob.x + 32, ob.y + 3, 12, 6);
    ctx.fillRect(ob.x + 6, flap ? ob.y : ob.y + 10, 16, 4);
    ctx.fillRect(ob.x, flap ? ob.y + 11 : ob.y + 1, 12, 4);
  }

  function drawMessage(line, sub) {
    ctx.fillStyle = 'rgba(244, 239, 228, 0.78)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#800000';
    ctx.font = '700 28px Arial, Helvetica, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(line, W / 2, H / 2 - 6);
    ctx.font = '14px Arial, Helvetica, sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText(sub, W / 2, H / 2 + 22);
    ctx.textAlign = 'left';
  }

  function draw() {
    ctx.fillStyle = '#f4efe4';
    ctx.fillRect(0, 0, W, H);
    drawGround();
    obstacles.forEach(drawObstacle);
    drawDino();
    if (state === 'ready') drawMessage('T-REX JUMP', 'Space or tap to start');
    if (state === 'dead') drawMessage('GAME OVER', 'Space or tap to retry');
  }

  function loop(now) {
    requestAnimationFrame(loop);
    if (!loop.last) loop.last = now;
    var dt = Math.min(34, now - loop.last);
    loop.last = now;
    update(dt / 16.67);
    draw();
  }

  function typing() {
    var el = document.activeElement;
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
  }

  document.addEventListener('keydown', function (e) {
    if (typing()) return;
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      jump();
    }
    if (e.code === 'ArrowDown') {
      e.preventDefault();
      dino.wantDuck = true;
    }
  });

  document.addEventListener('keyup', function (e) {
    if (e.code === 'ArrowDown') dino.wantDuck = false;
  });

  canvas.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    jump();
  });

  var jumpBtn = document.getElementById('trexJump');
  var duckBtn = document.getElementById('trexDuck');
  if (jumpBtn) {
    jumpBtn.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      jump();
    });
  }
  if (duckBtn) {
    var releaseDuck = function () { dino.wantDuck = false; };
    duckBtn.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      dino.wantDuck = true;
    });
    duckBtn.addEventListener('pointerup', releaseDuck);
    duckBtn.addEventListener('pointerleave', releaseDuck);
    duckBtn.addEventListener('pointercancel', releaseDuck);
  }

  paintHud();
  draw();
  requestAnimationFrame(loop);
})();
