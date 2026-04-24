// src/App.tsx
import { useState as useState4, useEffect as useEffect4, useMemo as useMemo4, useRef as useRef4 } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { Plus, Calendar, BookOpen, CheckCircle2, Clock, ChevronRight, ChevronDown, X, Settings, LogOut, LogIn, Trash2, Sun, Moon, Zap, Play, Pause, Square, CheckSquare, Edit3, Coffee, Brain, Eye, EyeOff, AlertCircle } from "lucide-react";
import { format, differenceInDays, isPast, formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import "react-day-picker/dist/style.css";

// node_modules/canvas-confetti/dist/confetti.module.mjs
var module = {};
(function main(global, module2, isWorker, workerSize) {
  var canUseWorker = !!(global.Worker && global.Blob && global.Promise && global.OffscreenCanvas && global.OffscreenCanvasRenderingContext2D && global.HTMLCanvasElement && global.HTMLCanvasElement.prototype.transferControlToOffscreen && global.URL && global.URL.createObjectURL);
  var canUsePaths = typeof Path2D === "function" && typeof DOMMatrix === "function";
  var canDrawBitmap = (function() {
    if (!global.OffscreenCanvas) {
      return false;
    }
    try {
      var canvas = new OffscreenCanvas(1, 1);
      var ctx = canvas.getContext("2d");
      ctx.fillRect(0, 0, 1, 1);
      var bitmap = canvas.transferToImageBitmap();
      ctx.createPattern(bitmap, "no-repeat");
    } catch (e) {
      return false;
    }
    return true;
  })();
  function noop2() {
  }
  function promise(func) {
    var ModulePromise = module2.exports.Promise;
    var Prom = ModulePromise !== void 0 ? ModulePromise : global.Promise;
    if (typeof Prom === "function") {
      return new Prom(func);
    }
    func(noop2, noop2);
    return null;
  }
  var bitmapMapper = /* @__PURE__ */ (function(skipTransform, map) {
    return {
      transform: function(bitmap) {
        if (skipTransform) {
          return bitmap;
        }
        if (map.has(bitmap)) {
          return map.get(bitmap);
        }
        var canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        var ctx = canvas.getContext("2d");
        ctx.drawImage(bitmap, 0, 0);
        map.set(bitmap, canvas);
        return canvas;
      },
      clear: function() {
        map.clear();
      }
    };
  })(canDrawBitmap, /* @__PURE__ */ new Map());
  var raf = (function() {
    var TIME = Math.floor(1e3 / 60);
    var frame, cancel;
    var frames = {};
    var lastFrameTime = 0;
    if (typeof requestAnimationFrame === "function" && typeof cancelAnimationFrame === "function") {
      frame = function(cb) {
        var id = Math.random();
        frames[id] = requestAnimationFrame(function onFrame(time) {
          if (lastFrameTime === time || lastFrameTime + TIME - 1 < time) {
            lastFrameTime = time;
            delete frames[id];
            cb();
          } else {
            frames[id] = requestAnimationFrame(onFrame);
          }
        });
        return id;
      };
      cancel = function(id) {
        if (frames[id]) {
          cancelAnimationFrame(frames[id]);
        }
      };
    } else {
      frame = function(cb) {
        return setTimeout(cb, TIME);
      };
      cancel = function(timer) {
        return clearTimeout(timer);
      };
    }
    return { frame, cancel };
  })();
  var getWorker = /* @__PURE__ */ (function() {
    var worker;
    var prom;
    var resolves = {};
    function decorate(worker2) {
      function execute(options, callback) {
        worker2.postMessage({ options: options || {}, callback });
      }
      worker2.init = function initWorker(canvas) {
        var offscreen = canvas.transferControlToOffscreen();
        worker2.postMessage({ canvas: offscreen }, [offscreen]);
      };
      worker2.fire = function fireWorker(options, size, done) {
        if (prom) {
          execute(options, null);
          return prom;
        }
        var id = Math.random().toString(36).slice(2);
        prom = promise(function(resolve) {
          function workerDone(msg) {
            if (msg.data.callback !== id) {
              return;
            }
            delete resolves[id];
            worker2.removeEventListener("message", workerDone);
            prom = null;
            bitmapMapper.clear();
            done();
            resolve();
          }
          worker2.addEventListener("message", workerDone);
          execute(options, id);
          resolves[id] = workerDone.bind(null, { data: { callback: id } });
        });
        return prom;
      };
      worker2.reset = function resetWorker() {
        worker2.postMessage({ reset: true });
        for (var id in resolves) {
          resolves[id]();
          delete resolves[id];
        }
      };
    }
    return function() {
      if (worker) {
        return worker;
      }
      if (!isWorker && canUseWorker) {
        var code = [
          "var CONFETTI, SIZE = {}, module = {};",
          "(" + main.toString() + ")(this, module, true, SIZE);",
          "onmessage = function(msg) {",
          "  if (msg.data.options) {",
          "    CONFETTI(msg.data.options).then(function () {",
          "      if (msg.data.callback) {",
          "        postMessage({ callback: msg.data.callback });",
          "      }",
          "    });",
          "  } else if (msg.data.reset) {",
          "    CONFETTI && CONFETTI.reset();",
          "  } else if (msg.data.resize) {",
          "    SIZE.width = msg.data.resize.width;",
          "    SIZE.height = msg.data.resize.height;",
          "  } else if (msg.data.canvas) {",
          "    SIZE.width = msg.data.canvas.width;",
          "    SIZE.height = msg.data.canvas.height;",
          "    CONFETTI = module.exports.create(msg.data.canvas);",
          "  }",
          "}"
        ].join("\n");
        try {
          worker = new Worker(URL.createObjectURL(new Blob([code])));
        } catch (e) {
          typeof console !== "undefined" && typeof console.warn === "function" ? console.warn("\u{1F38A} Could not load worker", e) : null;
          return null;
        }
        decorate(worker);
      }
      return worker;
    };
  })();
  var defaults = {
    particleCount: 50,
    angle: 90,
    spread: 45,
    startVelocity: 45,
    decay: 0.9,
    gravity: 1,
    drift: 0,
    ticks: 200,
    x: 0.5,
    y: 0.5,
    shapes: ["square", "circle"],
    zIndex: 100,
    colors: [
      "#26ccff",
      "#a25afd",
      "#ff5e7e",
      "#88ff5a",
      "#fcff42",
      "#ffa62d",
      "#ff36ff"
    ],
    // probably should be true, but back-compat
    disableForReducedMotion: false,
    scalar: 1
  };
  function convert(val, transform) {
    return transform ? transform(val) : val;
  }
  function isOk(val) {
    return !(val === null || val === void 0);
  }
  function prop(options, name, transform) {
    return convert(
      options && isOk(options[name]) ? options[name] : defaults[name],
      transform
    );
  }
  function onlyPositiveInt(number) {
    return number < 0 ? 0 : Math.floor(number);
  }
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  function toDecimal(str) {
    return parseInt(str, 16);
  }
  function colorsToRgb(colors) {
    return colors.map(hexToRgb);
  }
  function hexToRgb(str) {
    var val = String(str).replace(/[^0-9a-f]/gi, "");
    if (val.length < 6) {
      val = val[0] + val[0] + val[1] + val[1] + val[2] + val[2];
    }
    return {
      r: toDecimal(val.substring(0, 2)),
      g: toDecimal(val.substring(2, 4)),
      b: toDecimal(val.substring(4, 6))
    };
  }
  function getOrigin(options) {
    var origin = prop(options, "origin", Object);
    origin.x = prop(origin, "x", Number);
    origin.y = prop(origin, "y", Number);
    return origin;
  }
  function setCanvasWindowSize(canvas) {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
  }
  function setCanvasRectSize(canvas) {
    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  function getCanvas(zIndex) {
    var canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = zIndex;
    return canvas;
  }
  function ellipse(context, x, y, radiusX, radiusY, rotation, startAngle, endAngle, antiClockwise) {
    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    context.scale(radiusX, radiusY);
    context.arc(0, 0, 1, startAngle, endAngle, antiClockwise);
    context.restore();
  }
  function randomPhysics(opts) {
    var radAngle = opts.angle * (Math.PI / 180);
    var radSpread = opts.spread * (Math.PI / 180);
    return {
      x: opts.x,
      y: opts.y,
      wobble: Math.random() * 10,
      wobbleSpeed: Math.min(0.11, Math.random() * 0.1 + 0.05),
      velocity: opts.startVelocity * 0.5 + Math.random() * opts.startVelocity,
      angle2D: -radAngle + (0.5 * radSpread - Math.random() * radSpread),
      tiltAngle: (Math.random() * (0.75 - 0.25) + 0.25) * Math.PI,
      color: opts.color,
      shape: opts.shape,
      tick: 0,
      totalTicks: opts.ticks,
      decay: opts.decay,
      drift: opts.drift,
      random: Math.random() + 2,
      tiltSin: 0,
      tiltCos: 0,
      wobbleX: 0,
      wobbleY: 0,
      gravity: opts.gravity * 3,
      ovalScalar: 0.6,
      scalar: opts.scalar,
      flat: opts.flat
    };
  }
  function updateFetti(context, fetti) {
    fetti.x += Math.cos(fetti.angle2D) * fetti.velocity + fetti.drift;
    fetti.y += Math.sin(fetti.angle2D) * fetti.velocity + fetti.gravity;
    fetti.velocity *= fetti.decay;
    if (fetti.flat) {
      fetti.wobble = 0;
      fetti.wobbleX = fetti.x + 10 * fetti.scalar;
      fetti.wobbleY = fetti.y + 10 * fetti.scalar;
      fetti.tiltSin = 0;
      fetti.tiltCos = 0;
      fetti.random = 1;
    } else {
      fetti.wobble += fetti.wobbleSpeed;
      fetti.wobbleX = fetti.x + 10 * fetti.scalar * Math.cos(fetti.wobble);
      fetti.wobbleY = fetti.y + 10 * fetti.scalar * Math.sin(fetti.wobble);
      fetti.tiltAngle += 0.1;
      fetti.tiltSin = Math.sin(fetti.tiltAngle);
      fetti.tiltCos = Math.cos(fetti.tiltAngle);
      fetti.random = Math.random() + 2;
    }
    var progress = fetti.tick++ / fetti.totalTicks;
    var x1 = fetti.x + fetti.random * fetti.tiltCos;
    var y1 = fetti.y + fetti.random * fetti.tiltSin;
    var x2 = fetti.wobbleX + fetti.random * fetti.tiltCos;
    var y2 = fetti.wobbleY + fetti.random * fetti.tiltSin;
    context.fillStyle = "rgba(" + fetti.color.r + ", " + fetti.color.g + ", " + fetti.color.b + ", " + (1 - progress) + ")";
    context.beginPath();
    if (canUsePaths && fetti.shape.type === "path" && typeof fetti.shape.path === "string" && Array.isArray(fetti.shape.matrix)) {
      context.fill(transformPath2D(
        fetti.shape.path,
        fetti.shape.matrix,
        fetti.x,
        fetti.y,
        Math.abs(x2 - x1) * 0.1,
        Math.abs(y2 - y1) * 0.1,
        Math.PI / 10 * fetti.wobble
      ));
    } else if (fetti.shape.type === "bitmap") {
      var rotation = Math.PI / 10 * fetti.wobble;
      var scaleX = Math.abs(x2 - x1) * 0.1;
      var scaleY = Math.abs(y2 - y1) * 0.1;
      var width = fetti.shape.bitmap.width * fetti.scalar;
      var height = fetti.shape.bitmap.height * fetti.scalar;
      var matrix = new DOMMatrix([
        Math.cos(rotation) * scaleX,
        Math.sin(rotation) * scaleX,
        -Math.sin(rotation) * scaleY,
        Math.cos(rotation) * scaleY,
        fetti.x,
        fetti.y
      ]);
      matrix.multiplySelf(new DOMMatrix(fetti.shape.matrix));
      var pattern = context.createPattern(bitmapMapper.transform(fetti.shape.bitmap), "no-repeat");
      pattern.setTransform(matrix);
      context.globalAlpha = 1 - progress;
      context.fillStyle = pattern;
      context.fillRect(
        fetti.x - width / 2,
        fetti.y - height / 2,
        width,
        height
      );
      context.globalAlpha = 1;
    } else if (fetti.shape === "circle") {
      context.ellipse ? context.ellipse(fetti.x, fetti.y, Math.abs(x2 - x1) * fetti.ovalScalar, Math.abs(y2 - y1) * fetti.ovalScalar, Math.PI / 10 * fetti.wobble, 0, 2 * Math.PI) : ellipse(context, fetti.x, fetti.y, Math.abs(x2 - x1) * fetti.ovalScalar, Math.abs(y2 - y1) * fetti.ovalScalar, Math.PI / 10 * fetti.wobble, 0, 2 * Math.PI);
    } else if (fetti.shape === "star") {
      var rot = Math.PI / 2 * 3;
      var innerRadius = 4 * fetti.scalar;
      var outerRadius = 8 * fetti.scalar;
      var x = fetti.x;
      var y = fetti.y;
      var spikes = 5;
      var step = Math.PI / spikes;
      while (spikes--) {
        x = fetti.x + Math.cos(rot) * outerRadius;
        y = fetti.y + Math.sin(rot) * outerRadius;
        context.lineTo(x, y);
        rot += step;
        x = fetti.x + Math.cos(rot) * innerRadius;
        y = fetti.y + Math.sin(rot) * innerRadius;
        context.lineTo(x, y);
        rot += step;
      }
    } else {
      context.moveTo(Math.floor(fetti.x), Math.floor(fetti.y));
      context.lineTo(Math.floor(fetti.wobbleX), Math.floor(y1));
      context.lineTo(Math.floor(x2), Math.floor(y2));
      context.lineTo(Math.floor(x1), Math.floor(fetti.wobbleY));
    }
    context.closePath();
    context.fill();
    return fetti.tick < fetti.totalTicks;
  }
  function animate(canvas, fettis, resizer, size, done) {
    var animatingFettis = fettis.slice();
    var context = canvas.getContext("2d");
    var animationFrame;
    var destroy;
    var prom = promise(function(resolve) {
      function onDone() {
        animationFrame = destroy = null;
        context.clearRect(0, 0, size.width, size.height);
        bitmapMapper.clear();
        done();
        resolve();
      }
      function update() {
        if (isWorker && !(size.width === workerSize.width && size.height === workerSize.height)) {
          size.width = canvas.width = workerSize.width;
          size.height = canvas.height = workerSize.height;
        }
        if (!size.width && !size.height) {
          resizer(canvas);
          size.width = canvas.width;
          size.height = canvas.height;
        }
        context.clearRect(0, 0, size.width, size.height);
        animatingFettis = animatingFettis.filter(function(fetti) {
          return updateFetti(context, fetti);
        });
        if (animatingFettis.length) {
          animationFrame = raf.frame(update);
        } else {
          onDone();
        }
      }
      animationFrame = raf.frame(update);
      destroy = onDone;
    });
    return {
      addFettis: function(fettis2) {
        animatingFettis = animatingFettis.concat(fettis2);
        return prom;
      },
      canvas,
      promise: prom,
      reset: function() {
        if (animationFrame) {
          raf.cancel(animationFrame);
        }
        if (destroy) {
          destroy();
        }
      }
    };
  }
  function confettiCannon(canvas, globalOpts) {
    var isLibCanvas = !canvas;
    var allowResize = !!prop(globalOpts || {}, "resize");
    var hasResizeEventRegistered = false;
    var globalDisableForReducedMotion = prop(globalOpts, "disableForReducedMotion", Boolean);
    var shouldUseWorker = canUseWorker && !!prop(globalOpts || {}, "useWorker");
    var worker = shouldUseWorker ? getWorker() : null;
    var resizer = isLibCanvas ? setCanvasWindowSize : setCanvasRectSize;
    var initialized = canvas && worker ? !!canvas.__confetti_initialized : false;
    var preferLessMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion)").matches;
    var animationObj;
    function fireLocal(options, size, done) {
      var particleCount = prop(options, "particleCount", onlyPositiveInt);
      var angle = prop(options, "angle", Number);
      var spread = prop(options, "spread", Number);
      var startVelocity = prop(options, "startVelocity", Number);
      var decay = prop(options, "decay", Number);
      var gravity = prop(options, "gravity", Number);
      var drift = prop(options, "drift", Number);
      var colors = prop(options, "colors", colorsToRgb);
      var ticks = prop(options, "ticks", Number);
      var shapes = prop(options, "shapes");
      var scalar = prop(options, "scalar");
      var flat = !!prop(options, "flat");
      var origin = getOrigin(options);
      var temp = particleCount;
      var fettis = [];
      var startX = canvas.width * origin.x;
      var startY = canvas.height * origin.y;
      while (temp--) {
        fettis.push(
          randomPhysics({
            x: startX,
            y: startY,
            angle,
            spread,
            startVelocity,
            color: colors[temp % colors.length],
            shape: shapes[randomInt(0, shapes.length)],
            ticks,
            decay,
            gravity,
            drift,
            scalar,
            flat
          })
        );
      }
      if (animationObj) {
        return animationObj.addFettis(fettis);
      }
      animationObj = animate(canvas, fettis, resizer, size, done);
      return animationObj.promise;
    }
    function fire(options) {
      var disableForReducedMotion = globalDisableForReducedMotion || prop(options, "disableForReducedMotion", Boolean);
      var zIndex = prop(options, "zIndex", Number);
      if (disableForReducedMotion && preferLessMotion) {
        return promise(function(resolve) {
          resolve();
        });
      }
      if (isLibCanvas && animationObj) {
        canvas = animationObj.canvas;
      } else if (isLibCanvas && !canvas) {
        canvas = getCanvas(zIndex);
        document.body.appendChild(canvas);
      }
      if (allowResize && !initialized) {
        resizer(canvas);
      }
      var size = {
        width: canvas.width,
        height: canvas.height
      };
      if (worker && !initialized) {
        worker.init(canvas);
      }
      initialized = true;
      if (worker) {
        canvas.__confetti_initialized = true;
      }
      function onResize() {
        if (worker) {
          var obj = {
            getBoundingClientRect: function() {
              if (!isLibCanvas) {
                return canvas.getBoundingClientRect();
              }
            }
          };
          resizer(obj);
          worker.postMessage({
            resize: {
              width: obj.width,
              height: obj.height
            }
          });
          return;
        }
        size.width = size.height = null;
      }
      function done() {
        animationObj = null;
        if (allowResize) {
          hasResizeEventRegistered = false;
          global.removeEventListener("resize", onResize);
        }
        if (isLibCanvas && canvas) {
          if (document.body.contains(canvas)) {
            document.body.removeChild(canvas);
          }
          canvas = null;
          initialized = false;
        }
      }
      if (allowResize && !hasResizeEventRegistered) {
        hasResizeEventRegistered = true;
        global.addEventListener("resize", onResize, false);
      }
      if (worker) {
        return worker.fire(options, size, done);
      }
      return fireLocal(options, size, done);
    }
    fire.reset = function() {
      if (worker) {
        worker.reset();
      }
      if (animationObj) {
        animationObj.reset();
      }
    };
    return fire;
  }
  var defaultFire;
  function getDefaultFire() {
    if (!defaultFire) {
      defaultFire = confettiCannon(null, { useWorker: true, resize: true });
    }
    return defaultFire;
  }
  function transformPath2D(pathString, pathMatrix, x, y, scaleX, scaleY, rotation) {
    var path2d = new Path2D(pathString);
    var t1 = new Path2D();
    t1.addPath(path2d, new DOMMatrix(pathMatrix));
    var t2 = new Path2D();
    t2.addPath(t1, new DOMMatrix([
      Math.cos(rotation) * scaleX,
      Math.sin(rotation) * scaleX,
      -Math.sin(rotation) * scaleY,
      Math.cos(rotation) * scaleY,
      x,
      y
    ]));
    return t2;
  }
  function shapeFromPath(pathData) {
    if (!canUsePaths) {
      throw new Error("path confetti are not supported in this browser");
    }
    var path, matrix;
    if (typeof pathData === "string") {
      path = pathData;
    } else {
      path = pathData.path;
      matrix = pathData.matrix;
    }
    var path2d = new Path2D(path);
    var tempCanvas = document.createElement("canvas");
    var tempCtx = tempCanvas.getContext("2d");
    if (!matrix) {
      var maxSize = 1e3;
      var minX = maxSize;
      var minY = maxSize;
      var maxX = 0;
      var maxY = 0;
      var width, height;
      for (var x = 0; x < maxSize; x += 2) {
        for (var y = 0; y < maxSize; y += 2) {
          if (tempCtx.isPointInPath(path2d, x, y, "nonzero")) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }
      width = maxX - minX;
      height = maxY - minY;
      var maxDesiredSize = 10;
      var scale = Math.min(maxDesiredSize / width, maxDesiredSize / height);
      matrix = [
        scale,
        0,
        0,
        scale,
        -Math.round(width / 2 + minX) * scale,
        -Math.round(height / 2 + minY) * scale
      ];
    }
    return {
      type: "path",
      path,
      matrix
    };
  }
  function shapeFromText(textData) {
    var text, scalar = 1, color = "#000000", fontFamily = '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", "Twemoji Mozilla", "system emoji", sans-serif';
    if (typeof textData === "string") {
      text = textData;
    } else {
      text = textData.text;
      scalar = "scalar" in textData ? textData.scalar : scalar;
      fontFamily = "fontFamily" in textData ? textData.fontFamily : fontFamily;
      color = "color" in textData ? textData.color : color;
    }
    var fontSize = 10 * scalar;
    var font = "" + fontSize + "px " + fontFamily;
    var canvas = new OffscreenCanvas(fontSize, fontSize);
    var ctx = canvas.getContext("2d");
    ctx.font = font;
    var size = ctx.measureText(text);
    var width = Math.ceil(size.actualBoundingBoxRight + size.actualBoundingBoxLeft);
    var height = Math.ceil(size.actualBoundingBoxAscent + size.actualBoundingBoxDescent);
    var padding = 2;
    var x = size.actualBoundingBoxLeft + padding;
    var y = size.actualBoundingBoxAscent + padding;
    width += padding + padding;
    height += padding + padding;
    canvas = new OffscreenCanvas(width, height);
    ctx = canvas.getContext("2d");
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    var scale = 1 / scalar;
    return {
      type: "bitmap",
      // TODO these probably need to be transfered for workers
      bitmap: canvas.transferToImageBitmap(),
      matrix: [scale, 0, 0, scale, -width * scale / 2, -height * scale / 2]
    };
  }
  module2.exports = function() {
    return getDefaultFire().apply(this, arguments);
  };
  module2.exports.reset = function() {
    getDefaultFire().reset();
  };
  module2.exports.create = confettiCannon;
  module2.exports.shapeFromPath = shapeFromPath;
  module2.exports.shapeFromText = shapeFromText;
})((function() {
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  return this || {};
})(), module, false);
var confetti_module_default = module.exports;
var create = module.exports.create;

// node_modules/@dnd-kit/core/dist/core.esm.js
import React2, { createContext, useContext, useEffect as useEffect2, useState as useState2, useCallback as useCallback3, useMemo as useMemo2, useRef as useRef2, memo, useReducer, cloneElement, forwardRef } from "react";
import { createPortal, unstable_batchedUpdates } from "react-dom";

// node_modules/@dnd-kit/utilities/dist/utilities.esm.js
import { useMemo, useLayoutEffect, useEffect, useRef, useCallback } from "react";
function useCombinedRefs() {
  for (var _len = arguments.length, refs = new Array(_len), _key = 0; _key < _len; _key++) {
    refs[_key] = arguments[_key];
  }
  return useMemo(
    () => (node) => {
      refs.forEach((ref) => ref(node));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  );
}
var canUseDOM = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
function isWindow(element) {
  const elementString = Object.prototype.toString.call(element);
  return elementString === "[object Window]" || // In Electron context the Window object serializes to [object global]
  elementString === "[object global]";
}
function isNode(node) {
  return "nodeType" in node;
}
function getWindow(target) {
  var _target$ownerDocument, _target$ownerDocument2;
  if (!target) {
    return window;
  }
  if (isWindow(target)) {
    return target;
  }
  if (!isNode(target)) {
    return window;
  }
  return (_target$ownerDocument = (_target$ownerDocument2 = target.ownerDocument) == null ? void 0 : _target$ownerDocument2.defaultView) != null ? _target$ownerDocument : window;
}
function isDocument(node) {
  const {
    Document
  } = getWindow(node);
  return node instanceof Document;
}
function isHTMLElement(node) {
  if (isWindow(node)) {
    return false;
  }
  return node instanceof getWindow(node).HTMLElement;
}
function isSVGElement(node) {
  return node instanceof getWindow(node).SVGElement;
}
function getOwnerDocument(target) {
  if (!target) {
    return document;
  }
  if (isWindow(target)) {
    return target.document;
  }
  if (!isNode(target)) {
    return document;
  }
  if (isDocument(target)) {
    return target;
  }
  if (isHTMLElement(target) || isSVGElement(target)) {
    return target.ownerDocument;
  }
  return document;
}
var useIsomorphicLayoutEffect = canUseDOM ? useLayoutEffect : useEffect;
function useEvent(handler) {
  const handlerRef = useRef(handler);
  useIsomorphicLayoutEffect(() => {
    handlerRef.current = handler;
  });
  return useCallback(function() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return handlerRef.current == null ? void 0 : handlerRef.current(...args);
  }, []);
}
function useInterval() {
  const intervalRef = useRef(null);
  const set = useCallback((listener, duration) => {
    intervalRef.current = setInterval(listener, duration);
  }, []);
  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  return [set, clear];
}
function useLatestValue(value, dependencies) {
  if (dependencies === void 0) {
    dependencies = [value];
  }
  const valueRef = useRef(value);
  useIsomorphicLayoutEffect(() => {
    if (valueRef.current !== value) {
      valueRef.current = value;
    }
  }, dependencies);
  return valueRef;
}
function useLazyMemo(callback, dependencies) {
  const valueRef = useRef();
  return useMemo(
    () => {
      const newValue = callback(valueRef.current);
      valueRef.current = newValue;
      return newValue;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...dependencies]
  );
}
function useNodeRef(onChange) {
  const onChangeHandler = useEvent(onChange);
  const node = useRef(null);
  const setNodeRef = useCallback(
    (element) => {
      if (element !== node.current) {
        onChangeHandler == null ? void 0 : onChangeHandler(element, node.current);
      }
      node.current = element;
    },
    //eslint-disable-next-line
    []
  );
  return [node, setNodeRef];
}
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
var ids = {};
function useUniqueId(prefix, value) {
  return useMemo(() => {
    if (value) {
      return value;
    }
    const id = ids[prefix] == null ? 0 : ids[prefix] + 1;
    ids[prefix] = id;
    return prefix + "-" + id;
  }, [prefix, value]);
}
function createAdjustmentFn(modifier) {
  return function(object) {
    for (var _len = arguments.length, adjustments = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      adjustments[_key - 1] = arguments[_key];
    }
    return adjustments.reduce((accumulator, adjustment) => {
      const entries = Object.entries(adjustment);
      for (const [key, valueAdjustment] of entries) {
        const value = accumulator[key];
        if (value != null) {
          accumulator[key] = value + modifier * valueAdjustment;
        }
      }
      return accumulator;
    }, {
      ...object
    });
  };
}
var add = /* @__PURE__ */ createAdjustmentFn(1);
var subtract = /* @__PURE__ */ createAdjustmentFn(-1);
function hasViewportRelativeCoordinates(event) {
  return "clientX" in event && "clientY" in event;
}
function isKeyboardEvent(event) {
  if (!event) {
    return false;
  }
  const {
    KeyboardEvent
  } = getWindow(event.target);
  return KeyboardEvent && event instanceof KeyboardEvent;
}
function isTouchEvent(event) {
  if (!event) {
    return false;
  }
  const {
    TouchEvent
  } = getWindow(event.target);
  return TouchEvent && event instanceof TouchEvent;
}
function getEventCoordinates(event) {
  if (isTouchEvent(event)) {
    if (event.touches && event.touches.length) {
      const {
        clientX: x,
        clientY: y
      } = event.touches[0];
      return {
        x,
        y
      };
    } else if (event.changedTouches && event.changedTouches.length) {
      const {
        clientX: x,
        clientY: y
      } = event.changedTouches[0];
      return {
        x,
        y
      };
    }
  }
  if (hasViewportRelativeCoordinates(event)) {
    return {
      x: event.clientX,
      y: event.clientY
    };
  }
  return null;
}
var CSS = /* @__PURE__ */ Object.freeze({
  Translate: {
    toString(transform) {
      if (!transform) {
        return;
      }
      const {
        x,
        y
      } = transform;
      return "translate3d(" + (x ? Math.round(x) : 0) + "px, " + (y ? Math.round(y) : 0) + "px, 0)";
    }
  },
  Scale: {
    toString(transform) {
      if (!transform) {
        return;
      }
      const {
        scaleX,
        scaleY
      } = transform;
      return "scaleX(" + scaleX + ") scaleY(" + scaleY + ")";
    }
  },
  Transform: {
    toString(transform) {
      if (!transform) {
        return;
      }
      return [CSS.Translate.toString(transform), CSS.Scale.toString(transform)].join(" ");
    }
  },
  Transition: {
    toString(_ref) {
      let {
        property,
        duration,
        easing
      } = _ref;
      return property + " " + duration + "ms " + easing;
    }
  }
});
var SELECTOR = "a,frame,iframe,input:not([type=hidden]):not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled),*[tabindex]";
function findFirstFocusableNode(element) {
  if (element.matches(SELECTOR)) {
    return element;
  }
  return element.querySelector(SELECTOR);
}

// node_modules/@dnd-kit/accessibility/dist/accessibility.esm.js
import React, { useState, useCallback as useCallback2 } from "react";
var hiddenStyles = {
  display: "none"
};
function HiddenText(_ref) {
  let {
    id,
    value
  } = _ref;
  return React.createElement("div", {
    id,
    style: hiddenStyles
  }, value);
}
function LiveRegion(_ref) {
  let {
    id,
    announcement,
    ariaLiveType = "assertive"
  } = _ref;
  const visuallyHidden = {
    position: "fixed",
    top: 0,
    left: 0,
    width: 1,
    height: 1,
    margin: -1,
    border: 0,
    padding: 0,
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    clipPath: "inset(100%)",
    whiteSpace: "nowrap"
  };
  return React.createElement("div", {
    id,
    style: visuallyHidden,
    role: "status",
    "aria-live": ariaLiveType,
    "aria-atomic": true
  }, announcement);
}
function useAnnouncement() {
  const [announcement, setAnnouncement] = useState("");
  const announce = useCallback2((value) => {
    if (value != null) {
      setAnnouncement(value);
    }
  }, []);
  return {
    announce,
    announcement
  };
}

// node_modules/@dnd-kit/core/dist/core.esm.js
var DndMonitorContext = /* @__PURE__ */ createContext(null);
function useDndMonitor(listener) {
  const registerListener = useContext(DndMonitorContext);
  useEffect2(() => {
    if (!registerListener) {
      throw new Error("useDndMonitor must be used within a children of <DndContext>");
    }
    const unsubscribe = registerListener(listener);
    return unsubscribe;
  }, [listener, registerListener]);
}
function useDndMonitorProvider() {
  const [listeners] = useState2(() => /* @__PURE__ */ new Set());
  const registerListener = useCallback3((listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, [listeners]);
  const dispatch = useCallback3((_ref) => {
    let {
      type,
      event
    } = _ref;
    listeners.forEach((listener) => {
      var _listener$type;
      return (_listener$type = listener[type]) == null ? void 0 : _listener$type.call(listener, event);
    });
  }, [listeners]);
  return [dispatch, registerListener];
}
var defaultScreenReaderInstructions = {
  draggable: "\n    To pick up a draggable item, press the space bar.\n    While dragging, use the arrow keys to move the item.\n    Press space again to drop the item in its new position, or press escape to cancel.\n  "
};
var defaultAnnouncements = {
  onDragStart(_ref) {
    let {
      active
    } = _ref;
    return "Picked up draggable item " + active.id + ".";
  },
  onDragOver(_ref2) {
    let {
      active,
      over
    } = _ref2;
    if (over) {
      return "Draggable item " + active.id + " was moved over droppable area " + over.id + ".";
    }
    return "Draggable item " + active.id + " is no longer over a droppable area.";
  },
  onDragEnd(_ref3) {
    let {
      active,
      over
    } = _ref3;
    if (over) {
      return "Draggable item " + active.id + " was dropped over droppable area " + over.id;
    }
    return "Draggable item " + active.id + " was dropped.";
  },
  onDragCancel(_ref4) {
    let {
      active
    } = _ref4;
    return "Dragging was cancelled. Draggable item " + active.id + " was dropped.";
  }
};
function Accessibility(_ref) {
  let {
    announcements = defaultAnnouncements,
    container,
    hiddenTextDescribedById,
    screenReaderInstructions = defaultScreenReaderInstructions
  } = _ref;
  const {
    announce,
    announcement
  } = useAnnouncement();
  const liveRegionId = useUniqueId("DndLiveRegion");
  const [mounted, setMounted] = useState2(false);
  useEffect2(() => {
    setMounted(true);
  }, []);
  useDndMonitor(useMemo2(() => ({
    onDragStart(_ref2) {
      let {
        active
      } = _ref2;
      announce(announcements.onDragStart({
        active
      }));
    },
    onDragMove(_ref3) {
      let {
        active,
        over
      } = _ref3;
      if (announcements.onDragMove) {
        announce(announcements.onDragMove({
          active,
          over
        }));
      }
    },
    onDragOver(_ref4) {
      let {
        active,
        over
      } = _ref4;
      announce(announcements.onDragOver({
        active,
        over
      }));
    },
    onDragEnd(_ref5) {
      let {
        active,
        over
      } = _ref5;
      announce(announcements.onDragEnd({
        active,
        over
      }));
    },
    onDragCancel(_ref6) {
      let {
        active,
        over
      } = _ref6;
      announce(announcements.onDragCancel({
        active,
        over
      }));
    }
  }), [announce, announcements]));
  if (!mounted) {
    return null;
  }
  const markup = React2.createElement(React2.Fragment, null, React2.createElement(HiddenText, {
    id: hiddenTextDescribedById,
    value: screenReaderInstructions.draggable
  }), React2.createElement(LiveRegion, {
    id: liveRegionId,
    announcement
  }));
  return container ? createPortal(markup, container) : markup;
}
var Action;
(function(Action2) {
  Action2["DragStart"] = "dragStart";
  Action2["DragMove"] = "dragMove";
  Action2["DragEnd"] = "dragEnd";
  Action2["DragCancel"] = "dragCancel";
  Action2["DragOver"] = "dragOver";
  Action2["RegisterDroppable"] = "registerDroppable";
  Action2["SetDroppableDisabled"] = "setDroppableDisabled";
  Action2["UnregisterDroppable"] = "unregisterDroppable";
})(Action || (Action = {}));
function noop() {
}
function useSensor(sensor, options) {
  return useMemo2(
    () => ({
      sensor,
      options: options != null ? options : {}
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sensor, options]
  );
}
function useSensors() {
  for (var _len = arguments.length, sensors = new Array(_len), _key = 0; _key < _len; _key++) {
    sensors[_key] = arguments[_key];
  }
  return useMemo2(
    () => [...sensors].filter((sensor) => sensor != null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...sensors]
  );
}
var defaultCoordinates = /* @__PURE__ */ Object.freeze({
  x: 0,
  y: 0
});
function distanceBetween(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
function sortCollisionsAsc(_ref, _ref2) {
  let {
    data: {
      value: a
    }
  } = _ref;
  let {
    data: {
      value: b
    }
  } = _ref2;
  return a - b;
}
function sortCollisionsDesc(_ref3, _ref4) {
  let {
    data: {
      value: a
    }
  } = _ref3;
  let {
    data: {
      value: b
    }
  } = _ref4;
  return b - a;
}
function cornersOfRectangle(_ref5) {
  let {
    left,
    top,
    height,
    width
  } = _ref5;
  return [{
    x: left,
    y: top
  }, {
    x: left + width,
    y: top
  }, {
    x: left,
    y: top + height
  }, {
    x: left + width,
    y: top + height
  }];
}
function getFirstCollision(collisions, property) {
  if (!collisions || collisions.length === 0) {
    return null;
  }
  const [firstCollision] = collisions;
  return property ? firstCollision[property] : firstCollision;
}
function centerOfRectangle(rect, left, top) {
  if (left === void 0) {
    left = rect.left;
  }
  if (top === void 0) {
    top = rect.top;
  }
  return {
    x: left + rect.width * 0.5,
    y: top + rect.height * 0.5
  };
}
var closestCenter = (_ref) => {
  let {
    collisionRect,
    droppableRects,
    droppableContainers
  } = _ref;
  const centerRect = centerOfRectangle(collisionRect, collisionRect.left, collisionRect.top);
  const collisions = [];
  for (const droppableContainer of droppableContainers) {
    const {
      id
    } = droppableContainer;
    const rect = droppableRects.get(id);
    if (rect) {
      const distBetween = distanceBetween(centerOfRectangle(rect), centerRect);
      collisions.push({
        id,
        data: {
          droppableContainer,
          value: distBetween
        }
      });
    }
  }
  return collisions.sort(sortCollisionsAsc);
};
var closestCorners = (_ref) => {
  let {
    collisionRect,
    droppableRects,
    droppableContainers
  } = _ref;
  const corners = cornersOfRectangle(collisionRect);
  const collisions = [];
  for (const droppableContainer of droppableContainers) {
    const {
      id
    } = droppableContainer;
    const rect = droppableRects.get(id);
    if (rect) {
      const rectCorners = cornersOfRectangle(rect);
      const distances = corners.reduce((accumulator, corner, index) => {
        return accumulator + distanceBetween(rectCorners[index], corner);
      }, 0);
      const effectiveDistance = Number((distances / 4).toFixed(4));
      collisions.push({
        id,
        data: {
          droppableContainer,
          value: effectiveDistance
        }
      });
    }
  }
  return collisions.sort(sortCollisionsAsc);
};
function getIntersectionRatio(entry, target) {
  const top = Math.max(target.top, entry.top);
  const left = Math.max(target.left, entry.left);
  const right = Math.min(target.left + target.width, entry.left + entry.width);
  const bottom = Math.min(target.top + target.height, entry.top + entry.height);
  const width = right - left;
  const height = bottom - top;
  if (left < right && top < bottom) {
    const targetArea = target.width * target.height;
    const entryArea = entry.width * entry.height;
    const intersectionArea = width * height;
    const intersectionRatio = intersectionArea / (targetArea + entryArea - intersectionArea);
    return Number(intersectionRatio.toFixed(4));
  }
  return 0;
}
var rectIntersection = (_ref) => {
  let {
    collisionRect,
    droppableRects,
    droppableContainers
  } = _ref;
  const collisions = [];
  for (const droppableContainer of droppableContainers) {
    const {
      id
    } = droppableContainer;
    const rect = droppableRects.get(id);
    if (rect) {
      const intersectionRatio = getIntersectionRatio(rect, collisionRect);
      if (intersectionRatio > 0) {
        collisions.push({
          id,
          data: {
            droppableContainer,
            value: intersectionRatio
          }
        });
      }
    }
  }
  return collisions.sort(sortCollisionsDesc);
};
function adjustScale(transform, rect1, rect2) {
  return {
    ...transform,
    scaleX: rect1 && rect2 ? rect1.width / rect2.width : 1,
    scaleY: rect1 && rect2 ? rect1.height / rect2.height : 1
  };
}
function getRectDelta(rect1, rect2) {
  return rect1 && rect2 ? {
    x: rect1.left - rect2.left,
    y: rect1.top - rect2.top
  } : defaultCoordinates;
}
function createRectAdjustmentFn(modifier) {
  return function adjustClientRect(rect) {
    for (var _len = arguments.length, adjustments = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      adjustments[_key - 1] = arguments[_key];
    }
    return adjustments.reduce((acc, adjustment) => ({
      ...acc,
      top: acc.top + modifier * adjustment.y,
      bottom: acc.bottom + modifier * adjustment.y,
      left: acc.left + modifier * adjustment.x,
      right: acc.right + modifier * adjustment.x
    }), {
      ...rect
    });
  };
}
var getAdjustedRect = /* @__PURE__ */ createRectAdjustmentFn(1);
function parseTransform(transform) {
  if (transform.startsWith("matrix3d(")) {
    const transformArray = transform.slice(9, -1).split(/, /);
    return {
      x: +transformArray[12],
      y: +transformArray[13],
      scaleX: +transformArray[0],
      scaleY: +transformArray[5]
    };
  } else if (transform.startsWith("matrix(")) {
    const transformArray = transform.slice(7, -1).split(/, /);
    return {
      x: +transformArray[4],
      y: +transformArray[5],
      scaleX: +transformArray[0],
      scaleY: +transformArray[3]
    };
  }
  return null;
}
function inverseTransform(rect, transform, transformOrigin) {
  const parsedTransform = parseTransform(transform);
  if (!parsedTransform) {
    return rect;
  }
  const {
    scaleX,
    scaleY,
    x: translateX,
    y: translateY
  } = parsedTransform;
  const x = rect.left - translateX - (1 - scaleX) * parseFloat(transformOrigin);
  const y = rect.top - translateY - (1 - scaleY) * parseFloat(transformOrigin.slice(transformOrigin.indexOf(" ") + 1));
  const w = scaleX ? rect.width / scaleX : rect.width;
  const h = scaleY ? rect.height / scaleY : rect.height;
  return {
    width: w,
    height: h,
    top: y,
    right: x + w,
    bottom: y + h,
    left: x
  };
}
var defaultOptions = {
  ignoreTransform: false
};
function getClientRect(element, options) {
  if (options === void 0) {
    options = defaultOptions;
  }
  let rect = element.getBoundingClientRect();
  if (options.ignoreTransform) {
    const {
      transform,
      transformOrigin
    } = getWindow(element).getComputedStyle(element);
    if (transform) {
      rect = inverseTransform(rect, transform, transformOrigin);
    }
  }
  const {
    top,
    left,
    width,
    height,
    bottom,
    right
  } = rect;
  return {
    top,
    left,
    width,
    height,
    bottom,
    right
  };
}
function getTransformAgnosticClientRect(element) {
  return getClientRect(element, {
    ignoreTransform: true
  });
}
function getWindowClientRect(element) {
  const width = element.innerWidth;
  const height = element.innerHeight;
  return {
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width,
    height
  };
}
function isFixed(node, computedStyle) {
  if (computedStyle === void 0) {
    computedStyle = getWindow(node).getComputedStyle(node);
  }
  return computedStyle.position === "fixed";
}
function isScrollable(element, computedStyle) {
  if (computedStyle === void 0) {
    computedStyle = getWindow(element).getComputedStyle(element);
  }
  const overflowRegex = /(auto|scroll|overlay)/;
  const properties2 = ["overflow", "overflowX", "overflowY"];
  return properties2.some((property) => {
    const value = computedStyle[property];
    return typeof value === "string" ? overflowRegex.test(value) : false;
  });
}
function getScrollableAncestors(element, limit) {
  const scrollParents = [];
  function findScrollableAncestors(node) {
    if (limit != null && scrollParents.length >= limit) {
      return scrollParents;
    }
    if (!node) {
      return scrollParents;
    }
    if (isDocument(node) && node.scrollingElement != null && !scrollParents.includes(node.scrollingElement)) {
      scrollParents.push(node.scrollingElement);
      return scrollParents;
    }
    if (!isHTMLElement(node) || isSVGElement(node)) {
      return scrollParents;
    }
    if (scrollParents.includes(node)) {
      return scrollParents;
    }
    const computedStyle = getWindow(element).getComputedStyle(node);
    if (node !== element) {
      if (isScrollable(node, computedStyle)) {
        scrollParents.push(node);
      }
    }
    if (isFixed(node, computedStyle)) {
      return scrollParents;
    }
    return findScrollableAncestors(node.parentNode);
  }
  if (!element) {
    return scrollParents;
  }
  return findScrollableAncestors(element);
}
function getFirstScrollableAncestor(node) {
  const [firstScrollableAncestor] = getScrollableAncestors(node, 1);
  return firstScrollableAncestor != null ? firstScrollableAncestor : null;
}
function getScrollableElement(element) {
  if (!canUseDOM || !element) {
    return null;
  }
  if (isWindow(element)) {
    return element;
  }
  if (!isNode(element)) {
    return null;
  }
  if (isDocument(element) || element === getOwnerDocument(element).scrollingElement) {
    return window;
  }
  if (isHTMLElement(element)) {
    return element;
  }
  return null;
}
function getScrollXCoordinate(element) {
  if (isWindow(element)) {
    return element.scrollX;
  }
  return element.scrollLeft;
}
function getScrollYCoordinate(element) {
  if (isWindow(element)) {
    return element.scrollY;
  }
  return element.scrollTop;
}
function getScrollCoordinates(element) {
  return {
    x: getScrollXCoordinate(element),
    y: getScrollYCoordinate(element)
  };
}
var Direction;
(function(Direction2) {
  Direction2[Direction2["Forward"] = 1] = "Forward";
  Direction2[Direction2["Backward"] = -1] = "Backward";
})(Direction || (Direction = {}));
function isDocumentScrollingElement(element) {
  if (!canUseDOM || !element) {
    return false;
  }
  return element === document.scrollingElement;
}
function getScrollPosition(scrollingContainer) {
  const minScroll = {
    x: 0,
    y: 0
  };
  const dimensions = isDocumentScrollingElement(scrollingContainer) ? {
    height: window.innerHeight,
    width: window.innerWidth
  } : {
    height: scrollingContainer.clientHeight,
    width: scrollingContainer.clientWidth
  };
  const maxScroll = {
    x: scrollingContainer.scrollWidth - dimensions.width,
    y: scrollingContainer.scrollHeight - dimensions.height
  };
  const isTop = scrollingContainer.scrollTop <= minScroll.y;
  const isLeft = scrollingContainer.scrollLeft <= minScroll.x;
  const isBottom = scrollingContainer.scrollTop >= maxScroll.y;
  const isRight = scrollingContainer.scrollLeft >= maxScroll.x;
  return {
    isTop,
    isLeft,
    isBottom,
    isRight,
    maxScroll,
    minScroll
  };
}
var defaultThreshold = {
  x: 0.2,
  y: 0.2
};
function getScrollDirectionAndSpeed(scrollContainer, scrollContainerRect, _ref, acceleration, thresholdPercentage) {
  let {
    top,
    left,
    right,
    bottom
  } = _ref;
  if (acceleration === void 0) {
    acceleration = 10;
  }
  if (thresholdPercentage === void 0) {
    thresholdPercentage = defaultThreshold;
  }
  const {
    isTop,
    isBottom,
    isLeft,
    isRight
  } = getScrollPosition(scrollContainer);
  const direction = {
    x: 0,
    y: 0
  };
  const speed = {
    x: 0,
    y: 0
  };
  const threshold = {
    height: scrollContainerRect.height * thresholdPercentage.y,
    width: scrollContainerRect.width * thresholdPercentage.x
  };
  if (!isTop && top <= scrollContainerRect.top + threshold.height) {
    direction.y = Direction.Backward;
    speed.y = acceleration * Math.abs((scrollContainerRect.top + threshold.height - top) / threshold.height);
  } else if (!isBottom && bottom >= scrollContainerRect.bottom - threshold.height) {
    direction.y = Direction.Forward;
    speed.y = acceleration * Math.abs((scrollContainerRect.bottom - threshold.height - bottom) / threshold.height);
  }
  if (!isRight && right >= scrollContainerRect.right - threshold.width) {
    direction.x = Direction.Forward;
    speed.x = acceleration * Math.abs((scrollContainerRect.right - threshold.width - right) / threshold.width);
  } else if (!isLeft && left <= scrollContainerRect.left + threshold.width) {
    direction.x = Direction.Backward;
    speed.x = acceleration * Math.abs((scrollContainerRect.left + threshold.width - left) / threshold.width);
  }
  return {
    direction,
    speed
  };
}
function getScrollElementRect(element) {
  if (element === document.scrollingElement) {
    const {
      innerWidth,
      innerHeight
    } = window;
    return {
      top: 0,
      left: 0,
      right: innerWidth,
      bottom: innerHeight,
      width: innerWidth,
      height: innerHeight
    };
  }
  const {
    top,
    left,
    right,
    bottom
  } = element.getBoundingClientRect();
  return {
    top,
    left,
    right,
    bottom,
    width: element.clientWidth,
    height: element.clientHeight
  };
}
function getScrollOffsets(scrollableAncestors) {
  return scrollableAncestors.reduce((acc, node) => {
    return add(acc, getScrollCoordinates(node));
  }, defaultCoordinates);
}
function getScrollXOffset(scrollableAncestors) {
  return scrollableAncestors.reduce((acc, node) => {
    return acc + getScrollXCoordinate(node);
  }, 0);
}
function getScrollYOffset(scrollableAncestors) {
  return scrollableAncestors.reduce((acc, node) => {
    return acc + getScrollYCoordinate(node);
  }, 0);
}
function scrollIntoViewIfNeeded(element, measure) {
  if (measure === void 0) {
    measure = getClientRect;
  }
  if (!element) {
    return;
  }
  const {
    top,
    left,
    bottom,
    right
  } = measure(element);
  const firstScrollableAncestor = getFirstScrollableAncestor(element);
  if (!firstScrollableAncestor) {
    return;
  }
  if (bottom <= 0 || right <= 0 || top >= window.innerHeight || left >= window.innerWidth) {
    element.scrollIntoView({
      block: "center",
      inline: "center"
    });
  }
}
var properties = [["x", ["left", "right"], getScrollXOffset], ["y", ["top", "bottom"], getScrollYOffset]];
var Rect = class {
  constructor(rect, element) {
    this.rect = void 0;
    this.width = void 0;
    this.height = void 0;
    this.top = void 0;
    this.bottom = void 0;
    this.right = void 0;
    this.left = void 0;
    const scrollableAncestors = getScrollableAncestors(element);
    const scrollOffsets = getScrollOffsets(scrollableAncestors);
    this.rect = {
      ...rect
    };
    this.width = rect.width;
    this.height = rect.height;
    for (const [axis, keys, getScrollOffset] of properties) {
      for (const key of keys) {
        Object.defineProperty(this, key, {
          get: () => {
            const currentOffsets = getScrollOffset(scrollableAncestors);
            const scrollOffsetsDeltla = scrollOffsets[axis] - currentOffsets;
            return this.rect[key] + scrollOffsetsDeltla;
          },
          enumerable: true
        });
      }
    }
    Object.defineProperty(this, "rect", {
      enumerable: false
    });
  }
};
var Listeners = class {
  constructor(target) {
    this.target = void 0;
    this.listeners = [];
    this.removeAll = () => {
      this.listeners.forEach((listener) => {
        var _this$target;
        return (_this$target = this.target) == null ? void 0 : _this$target.removeEventListener(...listener);
      });
    };
    this.target = target;
  }
  add(eventName, handler, options) {
    var _this$target2;
    (_this$target2 = this.target) == null ? void 0 : _this$target2.addEventListener(eventName, handler, options);
    this.listeners.push([eventName, handler, options]);
  }
};
function getEventListenerTarget(target) {
  const {
    EventTarget
  } = getWindow(target);
  return target instanceof EventTarget ? target : getOwnerDocument(target);
}
function hasExceededDistance(delta, measurement) {
  const dx = Math.abs(delta.x);
  const dy = Math.abs(delta.y);
  if (typeof measurement === "number") {
    return Math.sqrt(dx ** 2 + dy ** 2) > measurement;
  }
  if ("x" in measurement && "y" in measurement) {
    return dx > measurement.x && dy > measurement.y;
  }
  if ("x" in measurement) {
    return dx > measurement.x;
  }
  if ("y" in measurement) {
    return dy > measurement.y;
  }
  return false;
}
var EventName;
(function(EventName2) {
  EventName2["Click"] = "click";
  EventName2["DragStart"] = "dragstart";
  EventName2["Keydown"] = "keydown";
  EventName2["ContextMenu"] = "contextmenu";
  EventName2["Resize"] = "resize";
  EventName2["SelectionChange"] = "selectionchange";
  EventName2["VisibilityChange"] = "visibilitychange";
})(EventName || (EventName = {}));
function preventDefault(event) {
  event.preventDefault();
}
function stopPropagation(event) {
  event.stopPropagation();
}
var KeyboardCode;
(function(KeyboardCode2) {
  KeyboardCode2["Space"] = "Space";
  KeyboardCode2["Down"] = "ArrowDown";
  KeyboardCode2["Right"] = "ArrowRight";
  KeyboardCode2["Left"] = "ArrowLeft";
  KeyboardCode2["Up"] = "ArrowUp";
  KeyboardCode2["Esc"] = "Escape";
  KeyboardCode2["Enter"] = "Enter";
  KeyboardCode2["Tab"] = "Tab";
})(KeyboardCode || (KeyboardCode = {}));
var defaultKeyboardCodes = {
  start: [KeyboardCode.Space, KeyboardCode.Enter],
  cancel: [KeyboardCode.Esc],
  end: [KeyboardCode.Space, KeyboardCode.Enter, KeyboardCode.Tab]
};
var defaultKeyboardCoordinateGetter = (event, _ref) => {
  let {
    currentCoordinates
  } = _ref;
  switch (event.code) {
    case KeyboardCode.Right:
      return {
        ...currentCoordinates,
        x: currentCoordinates.x + 25
      };
    case KeyboardCode.Left:
      return {
        ...currentCoordinates,
        x: currentCoordinates.x - 25
      };
    case KeyboardCode.Down:
      return {
        ...currentCoordinates,
        y: currentCoordinates.y + 25
      };
    case KeyboardCode.Up:
      return {
        ...currentCoordinates,
        y: currentCoordinates.y - 25
      };
  }
  return void 0;
};
var KeyboardSensor = class {
  constructor(props) {
    this.props = void 0;
    this.autoScrollEnabled = false;
    this.referenceCoordinates = void 0;
    this.listeners = void 0;
    this.windowListeners = void 0;
    this.props = props;
    const {
      event: {
        target
      }
    } = props;
    this.props = props;
    this.listeners = new Listeners(getOwnerDocument(target));
    this.windowListeners = new Listeners(getWindow(target));
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.attach();
  }
  attach() {
    this.handleStart();
    this.windowListeners.add(EventName.Resize, this.handleCancel);
    this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
    setTimeout(() => this.listeners.add(EventName.Keydown, this.handleKeyDown));
  }
  handleStart() {
    const {
      activeNode,
      onStart
    } = this.props;
    const node = activeNode.node.current;
    if (node) {
      scrollIntoViewIfNeeded(node);
    }
    onStart(defaultCoordinates);
  }
  handleKeyDown(event) {
    if (isKeyboardEvent(event)) {
      const {
        active,
        context,
        options
      } = this.props;
      const {
        keyboardCodes = defaultKeyboardCodes,
        coordinateGetter = defaultKeyboardCoordinateGetter,
        scrollBehavior = "smooth"
      } = options;
      const {
        code
      } = event;
      if (keyboardCodes.end.includes(code)) {
        this.handleEnd(event);
        return;
      }
      if (keyboardCodes.cancel.includes(code)) {
        this.handleCancel(event);
        return;
      }
      const {
        collisionRect
      } = context.current;
      const currentCoordinates = collisionRect ? {
        x: collisionRect.left,
        y: collisionRect.top
      } : defaultCoordinates;
      if (!this.referenceCoordinates) {
        this.referenceCoordinates = currentCoordinates;
      }
      const newCoordinates = coordinateGetter(event, {
        active,
        context: context.current,
        currentCoordinates
      });
      if (newCoordinates) {
        const coordinatesDelta = subtract(newCoordinates, currentCoordinates);
        const scrollDelta = {
          x: 0,
          y: 0
        };
        const {
          scrollableAncestors
        } = context.current;
        for (const scrollContainer of scrollableAncestors) {
          const direction = event.code;
          const {
            isTop,
            isRight,
            isLeft,
            isBottom,
            maxScroll,
            minScroll
          } = getScrollPosition(scrollContainer);
          const scrollElementRect = getScrollElementRect(scrollContainer);
          const clampedCoordinates = {
            x: Math.min(direction === KeyboardCode.Right ? scrollElementRect.right - scrollElementRect.width / 2 : scrollElementRect.right, Math.max(direction === KeyboardCode.Right ? scrollElementRect.left : scrollElementRect.left + scrollElementRect.width / 2, newCoordinates.x)),
            y: Math.min(direction === KeyboardCode.Down ? scrollElementRect.bottom - scrollElementRect.height / 2 : scrollElementRect.bottom, Math.max(direction === KeyboardCode.Down ? scrollElementRect.top : scrollElementRect.top + scrollElementRect.height / 2, newCoordinates.y))
          };
          const canScrollX = direction === KeyboardCode.Right && !isRight || direction === KeyboardCode.Left && !isLeft;
          const canScrollY = direction === KeyboardCode.Down && !isBottom || direction === KeyboardCode.Up && !isTop;
          if (canScrollX && clampedCoordinates.x !== newCoordinates.x) {
            const newScrollCoordinates = scrollContainer.scrollLeft + coordinatesDelta.x;
            const canScrollToNewCoordinates = direction === KeyboardCode.Right && newScrollCoordinates <= maxScroll.x || direction === KeyboardCode.Left && newScrollCoordinates >= minScroll.x;
            if (canScrollToNewCoordinates && !coordinatesDelta.y) {
              scrollContainer.scrollTo({
                left: newScrollCoordinates,
                behavior: scrollBehavior
              });
              return;
            }
            if (canScrollToNewCoordinates) {
              scrollDelta.x = scrollContainer.scrollLeft - newScrollCoordinates;
            } else {
              scrollDelta.x = direction === KeyboardCode.Right ? scrollContainer.scrollLeft - maxScroll.x : scrollContainer.scrollLeft - minScroll.x;
            }
            if (scrollDelta.x) {
              scrollContainer.scrollBy({
                left: -scrollDelta.x,
                behavior: scrollBehavior
              });
            }
            break;
          } else if (canScrollY && clampedCoordinates.y !== newCoordinates.y) {
            const newScrollCoordinates = scrollContainer.scrollTop + coordinatesDelta.y;
            const canScrollToNewCoordinates = direction === KeyboardCode.Down && newScrollCoordinates <= maxScroll.y || direction === KeyboardCode.Up && newScrollCoordinates >= minScroll.y;
            if (canScrollToNewCoordinates && !coordinatesDelta.x) {
              scrollContainer.scrollTo({
                top: newScrollCoordinates,
                behavior: scrollBehavior
              });
              return;
            }
            if (canScrollToNewCoordinates) {
              scrollDelta.y = scrollContainer.scrollTop - newScrollCoordinates;
            } else {
              scrollDelta.y = direction === KeyboardCode.Down ? scrollContainer.scrollTop - maxScroll.y : scrollContainer.scrollTop - minScroll.y;
            }
            if (scrollDelta.y) {
              scrollContainer.scrollBy({
                top: -scrollDelta.y,
                behavior: scrollBehavior
              });
            }
            break;
          }
        }
        this.handleMove(event, add(subtract(newCoordinates, this.referenceCoordinates), scrollDelta));
      }
    }
  }
  handleMove(event, coordinates) {
    const {
      onMove
    } = this.props;
    event.preventDefault();
    onMove(coordinates);
  }
  handleEnd(event) {
    const {
      onEnd
    } = this.props;
    event.preventDefault();
    this.detach();
    onEnd();
  }
  handleCancel(event) {
    const {
      onCancel
    } = this.props;
    event.preventDefault();
    this.detach();
    onCancel();
  }
  detach() {
    this.listeners.removeAll();
    this.windowListeners.removeAll();
  }
};
KeyboardSensor.activators = [{
  eventName: "onKeyDown",
  handler: (event, _ref, _ref2) => {
    let {
      keyboardCodes = defaultKeyboardCodes,
      onActivation
    } = _ref;
    let {
      active
    } = _ref2;
    const {
      code
    } = event.nativeEvent;
    if (keyboardCodes.start.includes(code)) {
      const activator = active.activatorNode.current;
      if (activator && event.target !== activator) {
        return false;
      }
      event.preventDefault();
      onActivation == null ? void 0 : onActivation({
        event: event.nativeEvent
      });
      return true;
    }
    return false;
  }
}];
function isDistanceConstraint(constraint) {
  return Boolean(constraint && "distance" in constraint);
}
function isDelayConstraint(constraint) {
  return Boolean(constraint && "delay" in constraint);
}
var AbstractPointerSensor = class {
  constructor(props, events2, listenerTarget) {
    var _getEventCoordinates;
    if (listenerTarget === void 0) {
      listenerTarget = getEventListenerTarget(props.event.target);
    }
    this.props = void 0;
    this.events = void 0;
    this.autoScrollEnabled = true;
    this.document = void 0;
    this.activated = false;
    this.initialCoordinates = void 0;
    this.timeoutId = null;
    this.listeners = void 0;
    this.documentListeners = void 0;
    this.windowListeners = void 0;
    this.props = props;
    this.events = events2;
    const {
      event
    } = props;
    const {
      target
    } = event;
    this.props = props;
    this.events = events2;
    this.document = getOwnerDocument(target);
    this.documentListeners = new Listeners(this.document);
    this.listeners = new Listeners(listenerTarget);
    this.windowListeners = new Listeners(getWindow(target));
    this.initialCoordinates = (_getEventCoordinates = getEventCoordinates(event)) != null ? _getEventCoordinates : defaultCoordinates;
    this.handleStart = this.handleStart.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.removeTextSelection = this.removeTextSelection.bind(this);
    this.attach();
  }
  attach() {
    const {
      events: events2,
      props: {
        options: {
          activationConstraint,
          bypassActivationConstraint
        }
      }
    } = this;
    this.listeners.add(events2.move.name, this.handleMove, {
      passive: false
    });
    this.listeners.add(events2.end.name, this.handleEnd);
    if (events2.cancel) {
      this.listeners.add(events2.cancel.name, this.handleCancel);
    }
    this.windowListeners.add(EventName.Resize, this.handleCancel);
    this.windowListeners.add(EventName.DragStart, preventDefault);
    this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
    this.windowListeners.add(EventName.ContextMenu, preventDefault);
    this.documentListeners.add(EventName.Keydown, this.handleKeydown);
    if (activationConstraint) {
      if (bypassActivationConstraint != null && bypassActivationConstraint({
        event: this.props.event,
        activeNode: this.props.activeNode,
        options: this.props.options
      })) {
        return this.handleStart();
      }
      if (isDelayConstraint(activationConstraint)) {
        this.timeoutId = setTimeout(this.handleStart, activationConstraint.delay);
        this.handlePending(activationConstraint);
        return;
      }
      if (isDistanceConstraint(activationConstraint)) {
        this.handlePending(activationConstraint);
        return;
      }
    }
    this.handleStart();
  }
  detach() {
    this.listeners.removeAll();
    this.windowListeners.removeAll();
    setTimeout(this.documentListeners.removeAll, 50);
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
  handlePending(constraint, offset) {
    const {
      active,
      onPending
    } = this.props;
    onPending(active, constraint, this.initialCoordinates, offset);
  }
  handleStart() {
    const {
      initialCoordinates
    } = this;
    const {
      onStart
    } = this.props;
    if (initialCoordinates) {
      this.activated = true;
      this.documentListeners.add(EventName.Click, stopPropagation, {
        capture: true
      });
      this.removeTextSelection();
      this.documentListeners.add(EventName.SelectionChange, this.removeTextSelection);
      onStart(initialCoordinates);
    }
  }
  handleMove(event) {
    var _getEventCoordinates2;
    const {
      activated,
      initialCoordinates,
      props
    } = this;
    const {
      onMove,
      options: {
        activationConstraint
      }
    } = props;
    if (!initialCoordinates) {
      return;
    }
    const coordinates = (_getEventCoordinates2 = getEventCoordinates(event)) != null ? _getEventCoordinates2 : defaultCoordinates;
    const delta = subtract(initialCoordinates, coordinates);
    if (!activated && activationConstraint) {
      if (isDistanceConstraint(activationConstraint)) {
        if (activationConstraint.tolerance != null && hasExceededDistance(delta, activationConstraint.tolerance)) {
          return this.handleCancel();
        }
        if (hasExceededDistance(delta, activationConstraint.distance)) {
          return this.handleStart();
        }
      }
      if (isDelayConstraint(activationConstraint)) {
        if (hasExceededDistance(delta, activationConstraint.tolerance)) {
          return this.handleCancel();
        }
      }
      this.handlePending(activationConstraint, delta);
      return;
    }
    if (event.cancelable) {
      event.preventDefault();
    }
    onMove(coordinates);
  }
  handleEnd() {
    const {
      onAbort,
      onEnd
    } = this.props;
    this.detach();
    if (!this.activated) {
      onAbort(this.props.active);
    }
    onEnd();
  }
  handleCancel() {
    const {
      onAbort,
      onCancel
    } = this.props;
    this.detach();
    if (!this.activated) {
      onAbort(this.props.active);
    }
    onCancel();
  }
  handleKeydown(event) {
    if (event.code === KeyboardCode.Esc) {
      this.handleCancel();
    }
  }
  removeTextSelection() {
    var _this$document$getSel;
    (_this$document$getSel = this.document.getSelection()) == null ? void 0 : _this$document$getSel.removeAllRanges();
  }
};
var events = {
  cancel: {
    name: "pointercancel"
  },
  move: {
    name: "pointermove"
  },
  end: {
    name: "pointerup"
  }
};
var PointerSensor = class extends AbstractPointerSensor {
  constructor(props) {
    const {
      event
    } = props;
    const listenerTarget = getOwnerDocument(event.target);
    super(props, events, listenerTarget);
  }
};
PointerSensor.activators = [{
  eventName: "onPointerDown",
  handler: (_ref, _ref2) => {
    let {
      nativeEvent: event
    } = _ref;
    let {
      onActivation
    } = _ref2;
    if (!event.isPrimary || event.button !== 0) {
      return false;
    }
    onActivation == null ? void 0 : onActivation({
      event
    });
    return true;
  }
}];
var events$1 = {
  move: {
    name: "mousemove"
  },
  end: {
    name: "mouseup"
  }
};
var MouseButton;
(function(MouseButton2) {
  MouseButton2[MouseButton2["RightClick"] = 2] = "RightClick";
})(MouseButton || (MouseButton = {}));
var MouseSensor = class extends AbstractPointerSensor {
  constructor(props) {
    super(props, events$1, getOwnerDocument(props.event.target));
  }
};
MouseSensor.activators = [{
  eventName: "onMouseDown",
  handler: (_ref, _ref2) => {
    let {
      nativeEvent: event
    } = _ref;
    let {
      onActivation
    } = _ref2;
    if (event.button === MouseButton.RightClick) {
      return false;
    }
    onActivation == null ? void 0 : onActivation({
      event
    });
    return true;
  }
}];
var events$2 = {
  cancel: {
    name: "touchcancel"
  },
  move: {
    name: "touchmove"
  },
  end: {
    name: "touchend"
  }
};
var TouchSensor = class extends AbstractPointerSensor {
  constructor(props) {
    super(props, events$2);
  }
  static setup() {
    window.addEventListener(events$2.move.name, noop2, {
      capture: false,
      passive: false
    });
    return function teardown() {
      window.removeEventListener(events$2.move.name, noop2);
    };
    function noop2() {
    }
  }
};
TouchSensor.activators = [{
  eventName: "onTouchStart",
  handler: (_ref, _ref2) => {
    let {
      nativeEvent: event
    } = _ref;
    let {
      onActivation
    } = _ref2;
    const {
      touches
    } = event;
    if (touches.length > 1) {
      return false;
    }
    onActivation == null ? void 0 : onActivation({
      event
    });
    return true;
  }
}];
var AutoScrollActivator;
(function(AutoScrollActivator2) {
  AutoScrollActivator2[AutoScrollActivator2["Pointer"] = 0] = "Pointer";
  AutoScrollActivator2[AutoScrollActivator2["DraggableRect"] = 1] = "DraggableRect";
})(AutoScrollActivator || (AutoScrollActivator = {}));
var TraversalOrder;
(function(TraversalOrder2) {
  TraversalOrder2[TraversalOrder2["TreeOrder"] = 0] = "TreeOrder";
  TraversalOrder2[TraversalOrder2["ReversedTreeOrder"] = 1] = "ReversedTreeOrder";
})(TraversalOrder || (TraversalOrder = {}));
function useAutoScroller(_ref) {
  let {
    acceleration,
    activator = AutoScrollActivator.Pointer,
    canScroll,
    draggingRect,
    enabled,
    interval = 5,
    order = TraversalOrder.TreeOrder,
    pointerCoordinates,
    scrollableAncestors,
    scrollableAncestorRects,
    delta,
    threshold
  } = _ref;
  const scrollIntent = useScrollIntent({
    delta,
    disabled: !enabled
  });
  const [setAutoScrollInterval, clearAutoScrollInterval] = useInterval();
  const scrollSpeed = useRef2({
    x: 0,
    y: 0
  });
  const scrollDirection = useRef2({
    x: 0,
    y: 0
  });
  const rect = useMemo2(() => {
    switch (activator) {
      case AutoScrollActivator.Pointer:
        return pointerCoordinates ? {
          top: pointerCoordinates.y,
          bottom: pointerCoordinates.y,
          left: pointerCoordinates.x,
          right: pointerCoordinates.x
        } : null;
      case AutoScrollActivator.DraggableRect:
        return draggingRect;
    }
  }, [activator, draggingRect, pointerCoordinates]);
  const scrollContainerRef = useRef2(null);
  const autoScroll = useCallback3(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) {
      return;
    }
    const scrollLeft = scrollSpeed.current.x * scrollDirection.current.x;
    const scrollTop = scrollSpeed.current.y * scrollDirection.current.y;
    scrollContainer.scrollBy(scrollLeft, scrollTop);
  }, []);
  const sortedScrollableAncestors = useMemo2(() => order === TraversalOrder.TreeOrder ? [...scrollableAncestors].reverse() : scrollableAncestors, [order, scrollableAncestors]);
  useEffect2(
    () => {
      if (!enabled || !scrollableAncestors.length || !rect) {
        clearAutoScrollInterval();
        return;
      }
      for (const scrollContainer of sortedScrollableAncestors) {
        if ((canScroll == null ? void 0 : canScroll(scrollContainer)) === false) {
          continue;
        }
        const index = scrollableAncestors.indexOf(scrollContainer);
        const scrollContainerRect = scrollableAncestorRects[index];
        if (!scrollContainerRect) {
          continue;
        }
        const {
          direction,
          speed
        } = getScrollDirectionAndSpeed(scrollContainer, scrollContainerRect, rect, acceleration, threshold);
        for (const axis of ["x", "y"]) {
          if (!scrollIntent[axis][direction[axis]]) {
            speed[axis] = 0;
            direction[axis] = 0;
          }
        }
        if (speed.x > 0 || speed.y > 0) {
          clearAutoScrollInterval();
          scrollContainerRef.current = scrollContainer;
          setAutoScrollInterval(autoScroll, interval);
          scrollSpeed.current = speed;
          scrollDirection.current = direction;
          return;
        }
      }
      scrollSpeed.current = {
        x: 0,
        y: 0
      };
      scrollDirection.current = {
        x: 0,
        y: 0
      };
      clearAutoScrollInterval();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      acceleration,
      autoScroll,
      canScroll,
      clearAutoScrollInterval,
      enabled,
      interval,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(rect),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(scrollIntent),
      setAutoScrollInterval,
      scrollableAncestors,
      sortedScrollableAncestors,
      scrollableAncestorRects,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(threshold)
    ]
  );
}
var defaultScrollIntent = {
  x: {
    [Direction.Backward]: false,
    [Direction.Forward]: false
  },
  y: {
    [Direction.Backward]: false,
    [Direction.Forward]: false
  }
};
function useScrollIntent(_ref2) {
  let {
    delta,
    disabled
  } = _ref2;
  const previousDelta = usePrevious(delta);
  return useLazyMemo((previousIntent) => {
    if (disabled || !previousDelta || !previousIntent) {
      return defaultScrollIntent;
    }
    const direction = {
      x: Math.sign(delta.x - previousDelta.x),
      y: Math.sign(delta.y - previousDelta.y)
    };
    return {
      x: {
        [Direction.Backward]: previousIntent.x[Direction.Backward] || direction.x === -1,
        [Direction.Forward]: previousIntent.x[Direction.Forward] || direction.x === 1
      },
      y: {
        [Direction.Backward]: previousIntent.y[Direction.Backward] || direction.y === -1,
        [Direction.Forward]: previousIntent.y[Direction.Forward] || direction.y === 1
      }
    };
  }, [disabled, delta, previousDelta]);
}
function useCachedNode(draggableNodes, id) {
  const draggableNode = id != null ? draggableNodes.get(id) : void 0;
  const node = draggableNode ? draggableNode.node.current : null;
  return useLazyMemo((cachedNode) => {
    var _ref;
    if (id == null) {
      return null;
    }
    return (_ref = node != null ? node : cachedNode) != null ? _ref : null;
  }, [node, id]);
}
function useCombineActivators(sensors, getSyntheticHandler) {
  return useMemo2(() => sensors.reduce((accumulator, sensor) => {
    const {
      sensor: Sensor
    } = sensor;
    const sensorActivators = Sensor.activators.map((activator) => ({
      eventName: activator.eventName,
      handler: getSyntheticHandler(activator.handler, sensor)
    }));
    return [...accumulator, ...sensorActivators];
  }, []), [sensors, getSyntheticHandler]);
}
var MeasuringStrategy;
(function(MeasuringStrategy2) {
  MeasuringStrategy2[MeasuringStrategy2["Always"] = 0] = "Always";
  MeasuringStrategy2[MeasuringStrategy2["BeforeDragging"] = 1] = "BeforeDragging";
  MeasuringStrategy2[MeasuringStrategy2["WhileDragging"] = 2] = "WhileDragging";
})(MeasuringStrategy || (MeasuringStrategy = {}));
var MeasuringFrequency;
(function(MeasuringFrequency2) {
  MeasuringFrequency2["Optimized"] = "optimized";
})(MeasuringFrequency || (MeasuringFrequency = {}));
var defaultValue = /* @__PURE__ */ new Map();
function useDroppableMeasuring(containers, _ref) {
  let {
    dragging,
    dependencies,
    config
  } = _ref;
  const [queue, setQueue] = useState2(null);
  const {
    frequency,
    measure,
    strategy
  } = config;
  const containersRef = useRef2(containers);
  const disabled = isDisabled();
  const disabledRef = useLatestValue(disabled);
  const measureDroppableContainers = useCallback3(function(ids2) {
    if (ids2 === void 0) {
      ids2 = [];
    }
    if (disabledRef.current) {
      return;
    }
    setQueue((value) => {
      if (value === null) {
        return ids2;
      }
      return value.concat(ids2.filter((id) => !value.includes(id)));
    });
  }, [disabledRef]);
  const timeoutId = useRef2(null);
  const droppableRects = useLazyMemo((previousValue) => {
    if (disabled && !dragging) {
      return defaultValue;
    }
    if (!previousValue || previousValue === defaultValue || containersRef.current !== containers || queue != null) {
      const map = /* @__PURE__ */ new Map();
      for (let container of containers) {
        if (!container) {
          continue;
        }
        if (queue && queue.length > 0 && !queue.includes(container.id) && container.rect.current) {
          map.set(container.id, container.rect.current);
          continue;
        }
        const node = container.node.current;
        const rect = node ? new Rect(measure(node), node) : null;
        container.rect.current = rect;
        if (rect) {
          map.set(container.id, rect);
        }
      }
      return map;
    }
    return previousValue;
  }, [containers, queue, dragging, disabled, measure]);
  useEffect2(() => {
    containersRef.current = containers;
  }, [containers]);
  useEffect2(
    () => {
      if (disabled) {
        return;
      }
      measureDroppableContainers();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dragging, disabled]
  );
  useEffect2(
    () => {
      if (queue && queue.length > 0) {
        setQueue(null);
      }
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(queue)]
  );
  useEffect2(
    () => {
      if (disabled || typeof frequency !== "number" || timeoutId.current !== null) {
        return;
      }
      timeoutId.current = setTimeout(() => {
        measureDroppableContainers();
        timeoutId.current = null;
      }, frequency);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [frequency, disabled, measureDroppableContainers, ...dependencies]
  );
  return {
    droppableRects,
    measureDroppableContainers,
    measuringScheduled: queue != null
  };
  function isDisabled() {
    switch (strategy) {
      case MeasuringStrategy.Always:
        return false;
      case MeasuringStrategy.BeforeDragging:
        return dragging;
      default:
        return !dragging;
    }
  }
}
function useInitialValue(value, computeFn) {
  return useLazyMemo((previousValue) => {
    if (!value) {
      return null;
    }
    if (previousValue) {
      return previousValue;
    }
    return typeof computeFn === "function" ? computeFn(value) : value;
  }, [computeFn, value]);
}
function useInitialRect(node, measure) {
  return useInitialValue(node, measure);
}
function useMutationObserver(_ref) {
  let {
    callback,
    disabled
  } = _ref;
  const handleMutations = useEvent(callback);
  const mutationObserver = useMemo2(() => {
    if (disabled || typeof window === "undefined" || typeof window.MutationObserver === "undefined") {
      return void 0;
    }
    const {
      MutationObserver
    } = window;
    return new MutationObserver(handleMutations);
  }, [handleMutations, disabled]);
  useEffect2(() => {
    return () => mutationObserver == null ? void 0 : mutationObserver.disconnect();
  }, [mutationObserver]);
  return mutationObserver;
}
function useResizeObserver(_ref) {
  let {
    callback,
    disabled
  } = _ref;
  const handleResize = useEvent(callback);
  const resizeObserver = useMemo2(
    () => {
      if (disabled || typeof window === "undefined" || typeof window.ResizeObserver === "undefined") {
        return void 0;
      }
      const {
        ResizeObserver
      } = window;
      return new ResizeObserver(handleResize);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled]
  );
  useEffect2(() => {
    return () => resizeObserver == null ? void 0 : resizeObserver.disconnect();
  }, [resizeObserver]);
  return resizeObserver;
}
function defaultMeasure(element) {
  return new Rect(getClientRect(element), element);
}
function useRect(element, measure, fallbackRect) {
  if (measure === void 0) {
    measure = defaultMeasure;
  }
  const [rect, setRect] = useState2(null);
  function measureRect() {
    setRect((currentRect) => {
      if (!element) {
        return null;
      }
      if (element.isConnected === false) {
        var _ref;
        return (_ref = currentRect != null ? currentRect : fallbackRect) != null ? _ref : null;
      }
      const newRect = measure(element);
      if (JSON.stringify(currentRect) === JSON.stringify(newRect)) {
        return currentRect;
      }
      return newRect;
    });
  }
  const mutationObserver = useMutationObserver({
    callback(records) {
      if (!element) {
        return;
      }
      for (const record of records) {
        const {
          type,
          target
        } = record;
        if (type === "childList" && target instanceof HTMLElement && target.contains(element)) {
          measureRect();
          break;
        }
      }
    }
  });
  const resizeObserver = useResizeObserver({
    callback: measureRect
  });
  useIsomorphicLayoutEffect(() => {
    measureRect();
    if (element) {
      resizeObserver == null ? void 0 : resizeObserver.observe(element);
      mutationObserver == null ? void 0 : mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    } else {
      resizeObserver == null ? void 0 : resizeObserver.disconnect();
      mutationObserver == null ? void 0 : mutationObserver.disconnect();
    }
  }, [element]);
  return rect;
}
function useRectDelta(rect) {
  const initialRect = useInitialValue(rect);
  return getRectDelta(rect, initialRect);
}
var defaultValue$1 = [];
function useScrollableAncestors(node) {
  const previousNode = useRef2(node);
  const ancestors = useLazyMemo((previousValue) => {
    if (!node) {
      return defaultValue$1;
    }
    if (previousValue && previousValue !== defaultValue$1 && node && previousNode.current && node.parentNode === previousNode.current.parentNode) {
      return previousValue;
    }
    return getScrollableAncestors(node);
  }, [node]);
  useEffect2(() => {
    previousNode.current = node;
  }, [node]);
  return ancestors;
}
function useScrollOffsets(elements) {
  const [scrollCoordinates, setScrollCoordinates] = useState2(null);
  const prevElements = useRef2(elements);
  const handleScroll = useCallback3((event) => {
    const scrollingElement = getScrollableElement(event.target);
    if (!scrollingElement) {
      return;
    }
    setScrollCoordinates((scrollCoordinates2) => {
      if (!scrollCoordinates2) {
        return null;
      }
      scrollCoordinates2.set(scrollingElement, getScrollCoordinates(scrollingElement));
      return new Map(scrollCoordinates2);
    });
  }, []);
  useEffect2(() => {
    const previousElements = prevElements.current;
    if (elements !== previousElements) {
      cleanup(previousElements);
      const entries = elements.map((element) => {
        const scrollableElement = getScrollableElement(element);
        if (scrollableElement) {
          scrollableElement.addEventListener("scroll", handleScroll, {
            passive: true
          });
          return [scrollableElement, getScrollCoordinates(scrollableElement)];
        }
        return null;
      }).filter((entry) => entry != null);
      setScrollCoordinates(entries.length ? new Map(entries) : null);
      prevElements.current = elements;
    }
    return () => {
      cleanup(elements);
      cleanup(previousElements);
    };
    function cleanup(elements2) {
      elements2.forEach((element) => {
        const scrollableElement = getScrollableElement(element);
        scrollableElement == null ? void 0 : scrollableElement.removeEventListener("scroll", handleScroll);
      });
    }
  }, [handleScroll, elements]);
  return useMemo2(() => {
    if (elements.length) {
      return scrollCoordinates ? Array.from(scrollCoordinates.values()).reduce((acc, coordinates) => add(acc, coordinates), defaultCoordinates) : getScrollOffsets(elements);
    }
    return defaultCoordinates;
  }, [elements, scrollCoordinates]);
}
function useScrollOffsetsDelta(scrollOffsets, dependencies) {
  if (dependencies === void 0) {
    dependencies = [];
  }
  const initialScrollOffsets = useRef2(null);
  useEffect2(
    () => {
      initialScrollOffsets.current = null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies
  );
  useEffect2(() => {
    const hasScrollOffsets = scrollOffsets !== defaultCoordinates;
    if (hasScrollOffsets && !initialScrollOffsets.current) {
      initialScrollOffsets.current = scrollOffsets;
    }
    if (!hasScrollOffsets && initialScrollOffsets.current) {
      initialScrollOffsets.current = null;
    }
  }, [scrollOffsets]);
  return initialScrollOffsets.current ? subtract(scrollOffsets, initialScrollOffsets.current) : defaultCoordinates;
}
function useSensorSetup(sensors) {
  useEffect2(
    () => {
      if (!canUseDOM) {
        return;
      }
      const teardownFns = sensors.map((_ref) => {
        let {
          sensor
        } = _ref;
        return sensor.setup == null ? void 0 : sensor.setup();
      });
      return () => {
        for (const teardown of teardownFns) {
          teardown == null ? void 0 : teardown();
        }
      };
    },
    // TO-DO: Sensors length could theoretically change which would not be a valid dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
    sensors.map((_ref2) => {
      let {
        sensor
      } = _ref2;
      return sensor;
    })
  );
}
function useSyntheticListeners(listeners, id) {
  return useMemo2(() => {
    return listeners.reduce((acc, _ref) => {
      let {
        eventName,
        handler
      } = _ref;
      acc[eventName] = (event) => {
        handler(event, id);
      };
      return acc;
    }, {});
  }, [listeners, id]);
}
function useWindowRect(element) {
  return useMemo2(() => element ? getWindowClientRect(element) : null, [element]);
}
var defaultValue$2 = [];
function useRects(elements, measure) {
  if (measure === void 0) {
    measure = getClientRect;
  }
  const [firstElement] = elements;
  const windowRect = useWindowRect(firstElement ? getWindow(firstElement) : null);
  const [rects, setRects] = useState2(defaultValue$2);
  function measureRects() {
    setRects(() => {
      if (!elements.length) {
        return defaultValue$2;
      }
      return elements.map((element) => isDocumentScrollingElement(element) ? windowRect : new Rect(measure(element), element));
    });
  }
  const resizeObserver = useResizeObserver({
    callback: measureRects
  });
  useIsomorphicLayoutEffect(() => {
    resizeObserver == null ? void 0 : resizeObserver.disconnect();
    measureRects();
    elements.forEach((element) => resizeObserver == null ? void 0 : resizeObserver.observe(element));
  }, [elements]);
  return rects;
}
function getMeasurableNode(node) {
  if (!node) {
    return null;
  }
  if (node.children.length > 1) {
    return node;
  }
  const firstChild = node.children[0];
  return isHTMLElement(firstChild) ? firstChild : node;
}
function useDragOverlayMeasuring(_ref) {
  let {
    measure
  } = _ref;
  const [rect, setRect] = useState2(null);
  const handleResize = useCallback3((entries) => {
    for (const {
      target
    } of entries) {
      if (isHTMLElement(target)) {
        setRect((rect2) => {
          const newRect = measure(target);
          return rect2 ? {
            ...rect2,
            width: newRect.width,
            height: newRect.height
          } : newRect;
        });
        break;
      }
    }
  }, [measure]);
  const resizeObserver = useResizeObserver({
    callback: handleResize
  });
  const handleNodeChange = useCallback3((element) => {
    const node = getMeasurableNode(element);
    resizeObserver == null ? void 0 : resizeObserver.disconnect();
    if (node) {
      resizeObserver == null ? void 0 : resizeObserver.observe(node);
    }
    setRect(node ? measure(node) : null);
  }, [measure, resizeObserver]);
  const [nodeRef, setRef] = useNodeRef(handleNodeChange);
  return useMemo2(() => ({
    nodeRef,
    rect,
    setRef
  }), [rect, nodeRef, setRef]);
}
var defaultSensors = [{
  sensor: PointerSensor,
  options: {}
}, {
  sensor: KeyboardSensor,
  options: {}
}];
var defaultData = {
  current: {}
};
var defaultMeasuringConfiguration = {
  draggable: {
    measure: getTransformAgnosticClientRect
  },
  droppable: {
    measure: getTransformAgnosticClientRect,
    strategy: MeasuringStrategy.WhileDragging,
    frequency: MeasuringFrequency.Optimized
  },
  dragOverlay: {
    measure: getClientRect
  }
};
var DroppableContainersMap = class extends Map {
  get(id) {
    var _super$get;
    return id != null ? (_super$get = super.get(id)) != null ? _super$get : void 0 : void 0;
  }
  toArray() {
    return Array.from(this.values());
  }
  getEnabled() {
    return this.toArray().filter((_ref) => {
      let {
        disabled
      } = _ref;
      return !disabled;
    });
  }
  getNodeFor(id) {
    var _this$get$node$curren, _this$get;
    return (_this$get$node$curren = (_this$get = this.get(id)) == null ? void 0 : _this$get.node.current) != null ? _this$get$node$curren : void 0;
  }
};
var defaultPublicContext = {
  activatorEvent: null,
  active: null,
  activeNode: null,
  activeNodeRect: null,
  collisions: null,
  containerNodeRect: null,
  draggableNodes: /* @__PURE__ */ new Map(),
  droppableRects: /* @__PURE__ */ new Map(),
  droppableContainers: /* @__PURE__ */ new DroppableContainersMap(),
  over: null,
  dragOverlay: {
    nodeRef: {
      current: null
    },
    rect: null,
    setRef: noop
  },
  scrollableAncestors: [],
  scrollableAncestorRects: [],
  measuringConfiguration: defaultMeasuringConfiguration,
  measureDroppableContainers: noop,
  windowRect: null,
  measuringScheduled: false
};
var defaultInternalContext = {
  activatorEvent: null,
  activators: [],
  active: null,
  activeNodeRect: null,
  ariaDescribedById: {
    draggable: ""
  },
  dispatch: noop,
  draggableNodes: /* @__PURE__ */ new Map(),
  over: null,
  measureDroppableContainers: noop
};
var InternalContext = /* @__PURE__ */ createContext(defaultInternalContext);
var PublicContext = /* @__PURE__ */ createContext(defaultPublicContext);
function getInitialState() {
  return {
    draggable: {
      active: null,
      initialCoordinates: {
        x: 0,
        y: 0
      },
      nodes: /* @__PURE__ */ new Map(),
      translate: {
        x: 0,
        y: 0
      }
    },
    droppable: {
      containers: new DroppableContainersMap()
    }
  };
}
function reducer(state, action) {
  switch (action.type) {
    case Action.DragStart:
      return {
        ...state,
        draggable: {
          ...state.draggable,
          initialCoordinates: action.initialCoordinates,
          active: action.active
        }
      };
    case Action.DragMove:
      if (state.draggable.active == null) {
        return state;
      }
      return {
        ...state,
        draggable: {
          ...state.draggable,
          translate: {
            x: action.coordinates.x - state.draggable.initialCoordinates.x,
            y: action.coordinates.y - state.draggable.initialCoordinates.y
          }
        }
      };
    case Action.DragEnd:
    case Action.DragCancel:
      return {
        ...state,
        draggable: {
          ...state.draggable,
          active: null,
          initialCoordinates: {
            x: 0,
            y: 0
          },
          translate: {
            x: 0,
            y: 0
          }
        }
      };
    case Action.RegisterDroppable: {
      const {
        element
      } = action;
      const {
        id
      } = element;
      const containers = new DroppableContainersMap(state.droppable.containers);
      containers.set(id, element);
      return {
        ...state,
        droppable: {
          ...state.droppable,
          containers
        }
      };
    }
    case Action.SetDroppableDisabled: {
      const {
        id,
        key,
        disabled
      } = action;
      const element = state.droppable.containers.get(id);
      if (!element || key !== element.key) {
        return state;
      }
      const containers = new DroppableContainersMap(state.droppable.containers);
      containers.set(id, {
        ...element,
        disabled
      });
      return {
        ...state,
        droppable: {
          ...state.droppable,
          containers
        }
      };
    }
    case Action.UnregisterDroppable: {
      const {
        id,
        key
      } = action;
      const element = state.droppable.containers.get(id);
      if (!element || key !== element.key) {
        return state;
      }
      const containers = new DroppableContainersMap(state.droppable.containers);
      containers.delete(id);
      return {
        ...state,
        droppable: {
          ...state.droppable,
          containers
        }
      };
    }
    default: {
      return state;
    }
  }
}
function RestoreFocus(_ref) {
  let {
    disabled
  } = _ref;
  const {
    active,
    activatorEvent,
    draggableNodes
  } = useContext(InternalContext);
  const previousActivatorEvent = usePrevious(activatorEvent);
  const previousActiveId = usePrevious(active == null ? void 0 : active.id);
  useEffect2(() => {
    if (disabled) {
      return;
    }
    if (!activatorEvent && previousActivatorEvent && previousActiveId != null) {
      if (!isKeyboardEvent(previousActivatorEvent)) {
        return;
      }
      if (document.activeElement === previousActivatorEvent.target) {
        return;
      }
      const draggableNode = draggableNodes.get(previousActiveId);
      if (!draggableNode) {
        return;
      }
      const {
        activatorNode,
        node
      } = draggableNode;
      if (!activatorNode.current && !node.current) {
        return;
      }
      requestAnimationFrame(() => {
        for (const element of [activatorNode.current, node.current]) {
          if (!element) {
            continue;
          }
          const focusableNode = findFirstFocusableNode(element);
          if (focusableNode) {
            focusableNode.focus();
            break;
          }
        }
      });
    }
  }, [activatorEvent, disabled, draggableNodes, previousActiveId, previousActivatorEvent]);
  return null;
}
function applyModifiers(modifiers, _ref) {
  let {
    transform,
    ...args
  } = _ref;
  return modifiers != null && modifiers.length ? modifiers.reduce((accumulator, modifier) => {
    return modifier({
      transform: accumulator,
      ...args
    });
  }, transform) : transform;
}
function useMeasuringConfiguration(config) {
  return useMemo2(
    () => ({
      draggable: {
        ...defaultMeasuringConfiguration.draggable,
        ...config == null ? void 0 : config.draggable
      },
      droppable: {
        ...defaultMeasuringConfiguration.droppable,
        ...config == null ? void 0 : config.droppable
      },
      dragOverlay: {
        ...defaultMeasuringConfiguration.dragOverlay,
        ...config == null ? void 0 : config.dragOverlay
      }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config == null ? void 0 : config.draggable, config == null ? void 0 : config.droppable, config == null ? void 0 : config.dragOverlay]
  );
}
function useLayoutShiftScrollCompensation(_ref) {
  let {
    activeNode,
    measure,
    initialRect,
    config = true
  } = _ref;
  const initialized = useRef2(false);
  const {
    x,
    y
  } = typeof config === "boolean" ? {
    x: config,
    y: config
  } : config;
  useIsomorphicLayoutEffect(() => {
    const disabled = !x && !y;
    if (disabled || !activeNode) {
      initialized.current = false;
      return;
    }
    if (initialized.current || !initialRect) {
      return;
    }
    const node = activeNode == null ? void 0 : activeNode.node.current;
    if (!node || node.isConnected === false) {
      return;
    }
    const rect = measure(node);
    const rectDelta = getRectDelta(rect, initialRect);
    if (!x) {
      rectDelta.x = 0;
    }
    if (!y) {
      rectDelta.y = 0;
    }
    initialized.current = true;
    if (Math.abs(rectDelta.x) > 0 || Math.abs(rectDelta.y) > 0) {
      const firstScrollableAncestor = getFirstScrollableAncestor(node);
      if (firstScrollableAncestor) {
        firstScrollableAncestor.scrollBy({
          top: rectDelta.y,
          left: rectDelta.x
        });
      }
    }
  }, [activeNode, x, y, initialRect, measure]);
}
var ActiveDraggableContext = /* @__PURE__ */ createContext({
  ...defaultCoordinates,
  scaleX: 1,
  scaleY: 1
});
var Status;
(function(Status2) {
  Status2[Status2["Uninitialized"] = 0] = "Uninitialized";
  Status2[Status2["Initializing"] = 1] = "Initializing";
  Status2[Status2["Initialized"] = 2] = "Initialized";
})(Status || (Status = {}));
var DndContext = /* @__PURE__ */ memo(function DndContext2(_ref) {
  var _sensorContext$curren, _dragOverlay$nodeRef$, _dragOverlay$rect, _over$rect;
  let {
    id,
    accessibility,
    autoScroll = true,
    children,
    sensors = defaultSensors,
    collisionDetection = rectIntersection,
    measuring,
    modifiers,
    ...props
  } = _ref;
  const store = useReducer(reducer, void 0, getInitialState);
  const [state, dispatch] = store;
  const [dispatchMonitorEvent, registerMonitorListener] = useDndMonitorProvider();
  const [status, setStatus] = useState2(Status.Uninitialized);
  const isInitialized = status === Status.Initialized;
  const {
    draggable: {
      active: activeId,
      nodes: draggableNodes,
      translate
    },
    droppable: {
      containers: droppableContainers
    }
  } = state;
  const node = activeId != null ? draggableNodes.get(activeId) : null;
  const activeRects = useRef2({
    initial: null,
    translated: null
  });
  const active = useMemo2(() => {
    var _node$data;
    return activeId != null ? {
      id: activeId,
      // It's possible for the active node to unmount while dragging
      data: (_node$data = node == null ? void 0 : node.data) != null ? _node$data : defaultData,
      rect: activeRects
    } : null;
  }, [activeId, node]);
  const activeRef = useRef2(null);
  const [activeSensor, setActiveSensor] = useState2(null);
  const [activatorEvent, setActivatorEvent] = useState2(null);
  const latestProps = useLatestValue(props, Object.values(props));
  const draggableDescribedById = useUniqueId("DndDescribedBy", id);
  const enabledDroppableContainers = useMemo2(() => droppableContainers.getEnabled(), [droppableContainers]);
  const measuringConfiguration = useMeasuringConfiguration(measuring);
  const {
    droppableRects,
    measureDroppableContainers,
    measuringScheduled
  } = useDroppableMeasuring(enabledDroppableContainers, {
    dragging: isInitialized,
    dependencies: [translate.x, translate.y],
    config: measuringConfiguration.droppable
  });
  const activeNode = useCachedNode(draggableNodes, activeId);
  const activationCoordinates = useMemo2(() => activatorEvent ? getEventCoordinates(activatorEvent) : null, [activatorEvent]);
  const autoScrollOptions = getAutoScrollerOptions();
  const initialActiveNodeRect = useInitialRect(activeNode, measuringConfiguration.draggable.measure);
  useLayoutShiftScrollCompensation({
    activeNode: activeId != null ? draggableNodes.get(activeId) : null,
    config: autoScrollOptions.layoutShiftCompensation,
    initialRect: initialActiveNodeRect,
    measure: measuringConfiguration.draggable.measure
  });
  const activeNodeRect = useRect(activeNode, measuringConfiguration.draggable.measure, initialActiveNodeRect);
  const containerNodeRect = useRect(activeNode ? activeNode.parentElement : null);
  const sensorContext = useRef2({
    activatorEvent: null,
    active: null,
    activeNode,
    collisionRect: null,
    collisions: null,
    droppableRects,
    draggableNodes,
    draggingNode: null,
    draggingNodeRect: null,
    droppableContainers,
    over: null,
    scrollableAncestors: [],
    scrollAdjustedTranslate: null
  });
  const overNode = droppableContainers.getNodeFor((_sensorContext$curren = sensorContext.current.over) == null ? void 0 : _sensorContext$curren.id);
  const dragOverlay = useDragOverlayMeasuring({
    measure: measuringConfiguration.dragOverlay.measure
  });
  const draggingNode = (_dragOverlay$nodeRef$ = dragOverlay.nodeRef.current) != null ? _dragOverlay$nodeRef$ : activeNode;
  const draggingNodeRect = isInitialized ? (_dragOverlay$rect = dragOverlay.rect) != null ? _dragOverlay$rect : activeNodeRect : null;
  const usesDragOverlay = Boolean(dragOverlay.nodeRef.current && dragOverlay.rect);
  const nodeRectDelta = useRectDelta(usesDragOverlay ? null : activeNodeRect);
  const windowRect = useWindowRect(draggingNode ? getWindow(draggingNode) : null);
  const scrollableAncestors = useScrollableAncestors(isInitialized ? overNode != null ? overNode : activeNode : null);
  const scrollableAncestorRects = useRects(scrollableAncestors);
  const modifiedTranslate = applyModifiers(modifiers, {
    transform: {
      x: translate.x - nodeRectDelta.x,
      y: translate.y - nodeRectDelta.y,
      scaleX: 1,
      scaleY: 1
    },
    activatorEvent,
    active,
    activeNodeRect,
    containerNodeRect,
    draggingNodeRect,
    over: sensorContext.current.over,
    overlayNodeRect: dragOverlay.rect,
    scrollableAncestors,
    scrollableAncestorRects,
    windowRect
  });
  const pointerCoordinates = activationCoordinates ? add(activationCoordinates, translate) : null;
  const scrollOffsets = useScrollOffsets(scrollableAncestors);
  const scrollAdjustment = useScrollOffsetsDelta(scrollOffsets);
  const activeNodeScrollDelta = useScrollOffsetsDelta(scrollOffsets, [activeNodeRect]);
  const scrollAdjustedTranslate = add(modifiedTranslate, scrollAdjustment);
  const collisionRect = draggingNodeRect ? getAdjustedRect(draggingNodeRect, modifiedTranslate) : null;
  const collisions = active && collisionRect ? collisionDetection({
    active,
    collisionRect,
    droppableRects,
    droppableContainers: enabledDroppableContainers,
    pointerCoordinates
  }) : null;
  const overId = getFirstCollision(collisions, "id");
  const [over, setOver] = useState2(null);
  const appliedTranslate = usesDragOverlay ? modifiedTranslate : add(modifiedTranslate, activeNodeScrollDelta);
  const transform = adjustScale(appliedTranslate, (_over$rect = over == null ? void 0 : over.rect) != null ? _over$rect : null, activeNodeRect);
  const activeSensorRef = useRef2(null);
  const instantiateSensor = useCallback3(
    (event, _ref2) => {
      let {
        sensor: Sensor,
        options
      } = _ref2;
      if (activeRef.current == null) {
        return;
      }
      const activeNode2 = draggableNodes.get(activeRef.current);
      if (!activeNode2) {
        return;
      }
      const activatorEvent2 = event.nativeEvent;
      const sensorInstance = new Sensor({
        active: activeRef.current,
        activeNode: activeNode2,
        event: activatorEvent2,
        options,
        // Sensors need to be instantiated with refs for arguments that change over time
        // otherwise they are frozen in time with the stale arguments
        context: sensorContext,
        onAbort(id2) {
          const draggableNode = draggableNodes.get(id2);
          if (!draggableNode) {
            return;
          }
          const {
            onDragAbort
          } = latestProps.current;
          const event2 = {
            id: id2
          };
          onDragAbort == null ? void 0 : onDragAbort(event2);
          dispatchMonitorEvent({
            type: "onDragAbort",
            event: event2
          });
        },
        onPending(id2, constraint, initialCoordinates, offset) {
          const draggableNode = draggableNodes.get(id2);
          if (!draggableNode) {
            return;
          }
          const {
            onDragPending
          } = latestProps.current;
          const event2 = {
            id: id2,
            constraint,
            initialCoordinates,
            offset
          };
          onDragPending == null ? void 0 : onDragPending(event2);
          dispatchMonitorEvent({
            type: "onDragPending",
            event: event2
          });
        },
        onStart(initialCoordinates) {
          const id2 = activeRef.current;
          if (id2 == null) {
            return;
          }
          const draggableNode = draggableNodes.get(id2);
          if (!draggableNode) {
            return;
          }
          const {
            onDragStart
          } = latestProps.current;
          const event2 = {
            activatorEvent: activatorEvent2,
            active: {
              id: id2,
              data: draggableNode.data,
              rect: activeRects
            }
          };
          unstable_batchedUpdates(() => {
            onDragStart == null ? void 0 : onDragStart(event2);
            setStatus(Status.Initializing);
            dispatch({
              type: Action.DragStart,
              initialCoordinates,
              active: id2
            });
            dispatchMonitorEvent({
              type: "onDragStart",
              event: event2
            });
            setActiveSensor(activeSensorRef.current);
            setActivatorEvent(activatorEvent2);
          });
        },
        onMove(coordinates) {
          dispatch({
            type: Action.DragMove,
            coordinates
          });
        },
        onEnd: createHandler(Action.DragEnd),
        onCancel: createHandler(Action.DragCancel)
      });
      activeSensorRef.current = sensorInstance;
      function createHandler(type) {
        return async function handler() {
          const {
            active: active2,
            collisions: collisions2,
            over: over2,
            scrollAdjustedTranslate: scrollAdjustedTranslate2
          } = sensorContext.current;
          let event2 = null;
          if (active2 && scrollAdjustedTranslate2) {
            const {
              cancelDrop
            } = latestProps.current;
            event2 = {
              activatorEvent: activatorEvent2,
              active: active2,
              collisions: collisions2,
              delta: scrollAdjustedTranslate2,
              over: over2
            };
            if (type === Action.DragEnd && typeof cancelDrop === "function") {
              const shouldCancel = await Promise.resolve(cancelDrop(event2));
              if (shouldCancel) {
                type = Action.DragCancel;
              }
            }
          }
          activeRef.current = null;
          unstable_batchedUpdates(() => {
            dispatch({
              type
            });
            setStatus(Status.Uninitialized);
            setOver(null);
            setActiveSensor(null);
            setActivatorEvent(null);
            activeSensorRef.current = null;
            const eventName = type === Action.DragEnd ? "onDragEnd" : "onDragCancel";
            if (event2) {
              const handler2 = latestProps.current[eventName];
              handler2 == null ? void 0 : handler2(event2);
              dispatchMonitorEvent({
                type: eventName,
                event: event2
              });
            }
          });
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draggableNodes]
  );
  const bindActivatorToSensorInstantiator = useCallback3((handler, sensor) => {
    return (event, active2) => {
      const nativeEvent = event.nativeEvent;
      const activeDraggableNode = draggableNodes.get(active2);
      if (
        // Another sensor is already instantiating
        activeRef.current !== null || // No active draggable
        !activeDraggableNode || // Event has already been captured
        nativeEvent.dndKit || nativeEvent.defaultPrevented
      ) {
        return;
      }
      const activationContext = {
        active: activeDraggableNode
      };
      const shouldActivate = handler(event, sensor.options, activationContext);
      if (shouldActivate === true) {
        nativeEvent.dndKit = {
          capturedBy: sensor.sensor
        };
        activeRef.current = active2;
        instantiateSensor(event, sensor);
      }
    };
  }, [draggableNodes, instantiateSensor]);
  const activators = useCombineActivators(sensors, bindActivatorToSensorInstantiator);
  useSensorSetup(sensors);
  useIsomorphicLayoutEffect(() => {
    if (activeNodeRect && status === Status.Initializing) {
      setStatus(Status.Initialized);
    }
  }, [activeNodeRect, status]);
  useEffect2(
    () => {
      const {
        onDragMove
      } = latestProps.current;
      const {
        active: active2,
        activatorEvent: activatorEvent2,
        collisions: collisions2,
        over: over2
      } = sensorContext.current;
      if (!active2 || !activatorEvent2) {
        return;
      }
      const event = {
        active: active2,
        activatorEvent: activatorEvent2,
        collisions: collisions2,
        delta: {
          x: scrollAdjustedTranslate.x,
          y: scrollAdjustedTranslate.y
        },
        over: over2
      };
      unstable_batchedUpdates(() => {
        onDragMove == null ? void 0 : onDragMove(event);
        dispatchMonitorEvent({
          type: "onDragMove",
          event
        });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scrollAdjustedTranslate.x, scrollAdjustedTranslate.y]
  );
  useEffect2(
    () => {
      const {
        active: active2,
        activatorEvent: activatorEvent2,
        collisions: collisions2,
        droppableContainers: droppableContainers2,
        scrollAdjustedTranslate: scrollAdjustedTranslate2
      } = sensorContext.current;
      if (!active2 || activeRef.current == null || !activatorEvent2 || !scrollAdjustedTranslate2) {
        return;
      }
      const {
        onDragOver
      } = latestProps.current;
      const overContainer = droppableContainers2.get(overId);
      const over2 = overContainer && overContainer.rect.current ? {
        id: overContainer.id,
        rect: overContainer.rect.current,
        data: overContainer.data,
        disabled: overContainer.disabled
      } : null;
      const event = {
        active: active2,
        activatorEvent: activatorEvent2,
        collisions: collisions2,
        delta: {
          x: scrollAdjustedTranslate2.x,
          y: scrollAdjustedTranslate2.y
        },
        over: over2
      };
      unstable_batchedUpdates(() => {
        setOver(over2);
        onDragOver == null ? void 0 : onDragOver(event);
        dispatchMonitorEvent({
          type: "onDragOver",
          event
        });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [overId]
  );
  useIsomorphicLayoutEffect(() => {
    sensorContext.current = {
      activatorEvent,
      active,
      activeNode,
      collisionRect,
      collisions,
      droppableRects,
      draggableNodes,
      draggingNode,
      draggingNodeRect,
      droppableContainers,
      over,
      scrollableAncestors,
      scrollAdjustedTranslate
    };
    activeRects.current = {
      initial: draggingNodeRect,
      translated: collisionRect
    };
  }, [active, activeNode, collisions, collisionRect, draggableNodes, draggingNode, draggingNodeRect, droppableRects, droppableContainers, over, scrollableAncestors, scrollAdjustedTranslate]);
  useAutoScroller({
    ...autoScrollOptions,
    delta: translate,
    draggingRect: collisionRect,
    pointerCoordinates,
    scrollableAncestors,
    scrollableAncestorRects
  });
  const publicContext = useMemo2(() => {
    const context = {
      active,
      activeNode,
      activeNodeRect,
      activatorEvent,
      collisions,
      containerNodeRect,
      dragOverlay,
      draggableNodes,
      droppableContainers,
      droppableRects,
      over,
      measureDroppableContainers,
      scrollableAncestors,
      scrollableAncestorRects,
      measuringConfiguration,
      measuringScheduled,
      windowRect
    };
    return context;
  }, [active, activeNode, activeNodeRect, activatorEvent, collisions, containerNodeRect, dragOverlay, draggableNodes, droppableContainers, droppableRects, over, measureDroppableContainers, scrollableAncestors, scrollableAncestorRects, measuringConfiguration, measuringScheduled, windowRect]);
  const internalContext = useMemo2(() => {
    const context = {
      activatorEvent,
      activators,
      active,
      activeNodeRect,
      ariaDescribedById: {
        draggable: draggableDescribedById
      },
      dispatch,
      draggableNodes,
      over,
      measureDroppableContainers
    };
    return context;
  }, [activatorEvent, activators, active, activeNodeRect, dispatch, draggableDescribedById, draggableNodes, over, measureDroppableContainers]);
  return React2.createElement(DndMonitorContext.Provider, {
    value: registerMonitorListener
  }, React2.createElement(InternalContext.Provider, {
    value: internalContext
  }, React2.createElement(PublicContext.Provider, {
    value: publicContext
  }, React2.createElement(ActiveDraggableContext.Provider, {
    value: transform
  }, children)), React2.createElement(RestoreFocus, {
    disabled: (accessibility == null ? void 0 : accessibility.restoreFocus) === false
  })), React2.createElement(Accessibility, {
    ...accessibility,
    hiddenTextDescribedById: draggableDescribedById
  }));
  function getAutoScrollerOptions() {
    const activeSensorDisablesAutoscroll = (activeSensor == null ? void 0 : activeSensor.autoScrollEnabled) === false;
    const autoScrollGloballyDisabled = typeof autoScroll === "object" ? autoScroll.enabled === false : autoScroll === false;
    const enabled = isInitialized && !activeSensorDisablesAutoscroll && !autoScrollGloballyDisabled;
    if (typeof autoScroll === "object") {
      return {
        ...autoScroll,
        enabled
      };
    }
    return {
      enabled
    };
  }
});
var NullContext = /* @__PURE__ */ createContext(null);
var defaultRole = "button";
var ID_PREFIX = "Draggable";
function useDraggable(_ref) {
  let {
    id,
    data,
    disabled = false,
    attributes
  } = _ref;
  const key = useUniqueId(ID_PREFIX);
  const {
    activators,
    activatorEvent,
    active,
    activeNodeRect,
    ariaDescribedById,
    draggableNodes,
    over
  } = useContext(InternalContext);
  const {
    role = defaultRole,
    roleDescription = "draggable",
    tabIndex = 0
  } = attributes != null ? attributes : {};
  const isDragging = (active == null ? void 0 : active.id) === id;
  const transform = useContext(isDragging ? ActiveDraggableContext : NullContext);
  const [node, setNodeRef] = useNodeRef();
  const [activatorNode, setActivatorNodeRef] = useNodeRef();
  const listeners = useSyntheticListeners(activators, id);
  const dataRef = useLatestValue(data);
  useIsomorphicLayoutEffect(
    () => {
      draggableNodes.set(id, {
        id,
        key,
        node,
        activatorNode,
        data: dataRef
      });
      return () => {
        const node2 = draggableNodes.get(id);
        if (node2 && node2.key === key) {
          draggableNodes.delete(id);
        }
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draggableNodes, id]
  );
  const memoizedAttributes = useMemo2(() => ({
    role,
    tabIndex,
    "aria-disabled": disabled,
    "aria-pressed": isDragging && role === defaultRole ? true : void 0,
    "aria-roledescription": roleDescription,
    "aria-describedby": ariaDescribedById.draggable
  }), [disabled, role, tabIndex, isDragging, roleDescription, ariaDescribedById.draggable]);
  return {
    active,
    activatorEvent,
    activeNodeRect,
    attributes: memoizedAttributes,
    isDragging,
    listeners: disabled ? void 0 : listeners,
    node,
    over,
    setNodeRef,
    setActivatorNodeRef,
    transform
  };
}
function useDndContext() {
  return useContext(PublicContext);
}
var ID_PREFIX$1 = "Droppable";
var defaultResizeObserverConfig = {
  timeout: 25
};
function useDroppable(_ref) {
  let {
    data,
    disabled = false,
    id,
    resizeObserverConfig
  } = _ref;
  const key = useUniqueId(ID_PREFIX$1);
  const {
    active,
    dispatch,
    over,
    measureDroppableContainers
  } = useContext(InternalContext);
  const previous = useRef2({
    disabled
  });
  const resizeObserverConnected = useRef2(false);
  const rect = useRef2(null);
  const callbackId = useRef2(null);
  const {
    disabled: resizeObserverDisabled,
    updateMeasurementsFor,
    timeout: resizeObserverTimeout
  } = {
    ...defaultResizeObserverConfig,
    ...resizeObserverConfig
  };
  const ids2 = useLatestValue(updateMeasurementsFor != null ? updateMeasurementsFor : id);
  const handleResize = useCallback3(
    () => {
      if (!resizeObserverConnected.current) {
        resizeObserverConnected.current = true;
        return;
      }
      if (callbackId.current != null) {
        clearTimeout(callbackId.current);
      }
      callbackId.current = setTimeout(() => {
        measureDroppableContainers(Array.isArray(ids2.current) ? ids2.current : [ids2.current]);
        callbackId.current = null;
      }, resizeObserverTimeout);
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [resizeObserverTimeout]
  );
  const resizeObserver = useResizeObserver({
    callback: handleResize,
    disabled: resizeObserverDisabled || !active
  });
  const handleNodeChange = useCallback3((newElement, previousElement) => {
    if (!resizeObserver) {
      return;
    }
    if (previousElement) {
      resizeObserver.unobserve(previousElement);
      resizeObserverConnected.current = false;
    }
    if (newElement) {
      resizeObserver.observe(newElement);
    }
  }, [resizeObserver]);
  const [nodeRef, setNodeRef] = useNodeRef(handleNodeChange);
  const dataRef = useLatestValue(data);
  useEffect2(() => {
    if (!resizeObserver || !nodeRef.current) {
      return;
    }
    resizeObserver.disconnect();
    resizeObserverConnected.current = false;
    resizeObserver.observe(nodeRef.current);
  }, [nodeRef, resizeObserver]);
  useEffect2(
    () => {
      dispatch({
        type: Action.RegisterDroppable,
        element: {
          id,
          key,
          disabled,
          node: nodeRef,
          rect,
          data: dataRef
        }
      });
      return () => dispatch({
        type: Action.UnregisterDroppable,
        key,
        id
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id]
  );
  useEffect2(() => {
    if (disabled !== previous.current.disabled) {
      dispatch({
        type: Action.SetDroppableDisabled,
        id,
        key,
        disabled
      });
      previous.current.disabled = disabled;
    }
  }, [id, key, disabled, dispatch]);
  return {
    active,
    rect,
    isOver: (over == null ? void 0 : over.id) === id,
    node: nodeRef,
    over,
    setNodeRef
  };
}

// node_modules/@dnd-kit/sortable/dist/sortable.esm.js
import React3, { useMemo as useMemo3, useRef as useRef3, useEffect as useEffect3, useState as useState3, useContext as useContext2 } from "react";
function arrayMove(array, from, to) {
  const newArray = array.slice();
  newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from, 1)[0]);
  return newArray;
}
function getSortedRects(items, rects) {
  return items.reduce((accumulator, id, index) => {
    const rect = rects.get(id);
    if (rect) {
      accumulator[index] = rect;
    }
    return accumulator;
  }, Array(items.length));
}
function isValidIndex(index) {
  return index !== null && index >= 0;
}
function itemsEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
function normalizeDisabled(disabled) {
  if (typeof disabled === "boolean") {
    return {
      draggable: disabled,
      droppable: disabled
    };
  }
  return disabled;
}
var rectSortingStrategy = (_ref) => {
  let {
    rects,
    activeIndex,
    overIndex,
    index
  } = _ref;
  const newRects = arrayMove(rects, overIndex, activeIndex);
  const oldRect = rects[index];
  const newRect = newRects[index];
  if (!newRect || !oldRect) {
    return null;
  }
  return {
    x: newRect.left - oldRect.left,
    y: newRect.top - oldRect.top,
    scaleX: newRect.width / oldRect.width,
    scaleY: newRect.height / oldRect.height
  };
};
var defaultScale$1 = {
  scaleX: 1,
  scaleY: 1
};
var verticalListSortingStrategy = (_ref) => {
  var _rects$activeIndex;
  let {
    activeIndex,
    activeNodeRect: fallbackActiveRect,
    index,
    rects,
    overIndex
  } = _ref;
  const activeNodeRect = (_rects$activeIndex = rects[activeIndex]) != null ? _rects$activeIndex : fallbackActiveRect;
  if (!activeNodeRect) {
    return null;
  }
  if (index === activeIndex) {
    const overIndexRect = rects[overIndex];
    if (!overIndexRect) {
      return null;
    }
    return {
      x: 0,
      y: activeIndex < overIndex ? overIndexRect.top + overIndexRect.height - (activeNodeRect.top + activeNodeRect.height) : overIndexRect.top - activeNodeRect.top,
      ...defaultScale$1
    };
  }
  const itemGap = getItemGap$1(rects, index, activeIndex);
  if (index > activeIndex && index <= overIndex) {
    return {
      x: 0,
      y: -activeNodeRect.height - itemGap,
      ...defaultScale$1
    };
  }
  if (index < activeIndex && index >= overIndex) {
    return {
      x: 0,
      y: activeNodeRect.height + itemGap,
      ...defaultScale$1
    };
  }
  return {
    x: 0,
    y: 0,
    ...defaultScale$1
  };
};
function getItemGap$1(clientRects, index, activeIndex) {
  const currentRect = clientRects[index];
  const previousRect = clientRects[index - 1];
  const nextRect = clientRects[index + 1];
  if (!currentRect) {
    return 0;
  }
  if (activeIndex < index) {
    return previousRect ? currentRect.top - (previousRect.top + previousRect.height) : nextRect ? nextRect.top - (currentRect.top + currentRect.height) : 0;
  }
  return nextRect ? nextRect.top - (currentRect.top + currentRect.height) : previousRect ? currentRect.top - (previousRect.top + previousRect.height) : 0;
}
var ID_PREFIX2 = "Sortable";
var Context = /* @__PURE__ */ React3.createContext({
  activeIndex: -1,
  containerId: ID_PREFIX2,
  disableTransforms: false,
  items: [],
  overIndex: -1,
  useDragOverlay: false,
  sortedRects: [],
  strategy: rectSortingStrategy,
  disabled: {
    draggable: false,
    droppable: false
  }
});
function SortableContext(_ref) {
  let {
    children,
    id,
    items: userDefinedItems,
    strategy = rectSortingStrategy,
    disabled: disabledProp = false
  } = _ref;
  const {
    active,
    dragOverlay,
    droppableRects,
    over,
    measureDroppableContainers
  } = useDndContext();
  const containerId = useUniqueId(ID_PREFIX2, id);
  const useDragOverlay = Boolean(dragOverlay.rect !== null);
  const items = useMemo3(() => userDefinedItems.map((item) => typeof item === "object" && "id" in item ? item.id : item), [userDefinedItems]);
  const isDragging = active != null;
  const activeIndex = active ? items.indexOf(active.id) : -1;
  const overIndex = over ? items.indexOf(over.id) : -1;
  const previousItemsRef = useRef3(items);
  const itemsHaveChanged = !itemsEqual(items, previousItemsRef.current);
  const disableTransforms = overIndex !== -1 && activeIndex === -1 || itemsHaveChanged;
  const disabled = normalizeDisabled(disabledProp);
  useIsomorphicLayoutEffect(() => {
    if (itemsHaveChanged && isDragging) {
      measureDroppableContainers(items);
    }
  }, [itemsHaveChanged, items, isDragging, measureDroppableContainers]);
  useEffect3(() => {
    previousItemsRef.current = items;
  }, [items]);
  const contextValue = useMemo3(
    () => ({
      activeIndex,
      containerId,
      disabled,
      disableTransforms,
      items,
      overIndex,
      useDragOverlay,
      sortedRects: getSortedRects(items, droppableRects),
      strategy
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeIndex, containerId, disabled.draggable, disabled.droppable, disableTransforms, items, overIndex, droppableRects, useDragOverlay, strategy]
  );
  return React3.createElement(Context.Provider, {
    value: contextValue
  }, children);
}
var defaultNewIndexGetter = (_ref) => {
  let {
    id,
    items,
    activeIndex,
    overIndex
  } = _ref;
  return arrayMove(items, activeIndex, overIndex).indexOf(id);
};
var defaultAnimateLayoutChanges = (_ref2) => {
  let {
    containerId,
    isSorting,
    wasDragging,
    index,
    items,
    newIndex,
    previousItems,
    previousContainerId,
    transition
  } = _ref2;
  if (!transition || !wasDragging) {
    return false;
  }
  if (previousItems !== items && index === newIndex) {
    return false;
  }
  if (isSorting) {
    return true;
  }
  return newIndex !== index && containerId === previousContainerId;
};
var defaultTransition = {
  duration: 200,
  easing: "ease"
};
var transitionProperty = "transform";
var disabledTransition = /* @__PURE__ */ CSS.Transition.toString({
  property: transitionProperty,
  duration: 0,
  easing: "linear"
});
var defaultAttributes = {
  roleDescription: "sortable"
};
function useDerivedTransform(_ref) {
  let {
    disabled,
    index,
    node,
    rect
  } = _ref;
  const [derivedTransform, setDerivedtransform] = useState3(null);
  const previousIndex = useRef3(index);
  useIsomorphicLayoutEffect(() => {
    if (!disabled && index !== previousIndex.current && node.current) {
      const initial = rect.current;
      if (initial) {
        const current = getClientRect(node.current, {
          ignoreTransform: true
        });
        const delta = {
          x: initial.left - current.left,
          y: initial.top - current.top,
          scaleX: initial.width / current.width,
          scaleY: initial.height / current.height
        };
        if (delta.x || delta.y) {
          setDerivedtransform(delta);
        }
      }
    }
    if (index !== previousIndex.current) {
      previousIndex.current = index;
    }
  }, [disabled, index, node, rect]);
  useEffect3(() => {
    if (derivedTransform) {
      setDerivedtransform(null);
    }
  }, [derivedTransform]);
  return derivedTransform;
}
function useSortable(_ref) {
  let {
    animateLayoutChanges = defaultAnimateLayoutChanges,
    attributes: userDefinedAttributes,
    disabled: localDisabled,
    data: customData,
    getNewIndex = defaultNewIndexGetter,
    id,
    strategy: localStrategy,
    resizeObserverConfig,
    transition = defaultTransition
  } = _ref;
  const {
    items,
    containerId,
    activeIndex,
    disabled: globalDisabled,
    disableTransforms,
    sortedRects,
    overIndex,
    useDragOverlay,
    strategy: globalStrategy
  } = useContext2(Context);
  const disabled = normalizeLocalDisabled(localDisabled, globalDisabled);
  const index = items.indexOf(id);
  const data = useMemo3(() => ({
    sortable: {
      containerId,
      index,
      items
    },
    ...customData
  }), [containerId, customData, index, items]);
  const itemsAfterCurrentSortable = useMemo3(() => items.slice(items.indexOf(id)), [items, id]);
  const {
    rect,
    node,
    isOver,
    setNodeRef: setDroppableNodeRef
  } = useDroppable({
    id,
    data,
    disabled: disabled.droppable,
    resizeObserverConfig: {
      updateMeasurementsFor: itemsAfterCurrentSortable,
      ...resizeObserverConfig
    }
  });
  const {
    active,
    activatorEvent,
    activeNodeRect,
    attributes,
    setNodeRef: setDraggableNodeRef,
    listeners,
    isDragging,
    over,
    setActivatorNodeRef,
    transform
  } = useDraggable({
    id,
    data,
    attributes: {
      ...defaultAttributes,
      ...userDefinedAttributes
    },
    disabled: disabled.draggable
  });
  const setNodeRef = useCombinedRefs(setDroppableNodeRef, setDraggableNodeRef);
  const isSorting = Boolean(active);
  const displaceItem = isSorting && !disableTransforms && isValidIndex(activeIndex) && isValidIndex(overIndex);
  const shouldDisplaceDragSource = !useDragOverlay && isDragging;
  const dragSourceDisplacement = shouldDisplaceDragSource && displaceItem ? transform : null;
  const strategy = localStrategy != null ? localStrategy : globalStrategy;
  const finalTransform = displaceItem ? dragSourceDisplacement != null ? dragSourceDisplacement : strategy({
    rects: sortedRects,
    activeNodeRect,
    activeIndex,
    overIndex,
    index
  }) : null;
  const newIndex = isValidIndex(activeIndex) && isValidIndex(overIndex) ? getNewIndex({
    id,
    items,
    activeIndex,
    overIndex
  }) : index;
  const activeId = active == null ? void 0 : active.id;
  const previous = useRef3({
    activeId,
    items,
    newIndex,
    containerId
  });
  const itemsHaveChanged = items !== previous.current.items;
  const shouldAnimateLayoutChanges = animateLayoutChanges({
    active,
    containerId,
    isDragging,
    isSorting,
    id,
    index,
    items,
    newIndex: previous.current.newIndex,
    previousItems: previous.current.items,
    previousContainerId: previous.current.containerId,
    transition,
    wasDragging: previous.current.activeId != null
  });
  const derivedTransform = useDerivedTransform({
    disabled: !shouldAnimateLayoutChanges,
    index,
    node,
    rect
  });
  useEffect3(() => {
    if (isSorting && previous.current.newIndex !== newIndex) {
      previous.current.newIndex = newIndex;
    }
    if (containerId !== previous.current.containerId) {
      previous.current.containerId = containerId;
    }
    if (items !== previous.current.items) {
      previous.current.items = items;
    }
  }, [isSorting, newIndex, containerId, items]);
  useEffect3(() => {
    if (activeId === previous.current.activeId) {
      return;
    }
    if (activeId != null && previous.current.activeId == null) {
      previous.current.activeId = activeId;
      return;
    }
    const timeoutId = setTimeout(() => {
      previous.current.activeId = activeId;
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [activeId]);
  return {
    active,
    activeIndex,
    attributes,
    data,
    rect,
    index,
    newIndex,
    items,
    isOver,
    isSorting,
    isDragging,
    listeners,
    node,
    overIndex,
    over,
    setNodeRef,
    setActivatorNodeRef,
    setDroppableNodeRef,
    setDraggableNodeRef,
    transform: derivedTransform != null ? derivedTransform : finalTransform,
    transition: getTransition()
  };
  function getTransition() {
    if (
      // Temporarily disable transitions for a single frame to set up derived transforms
      derivedTransform || // Or to prevent items jumping to back to their "new" position when items change
      itemsHaveChanged && previous.current.newIndex === index
    ) {
      return disabledTransition;
    }
    if (shouldDisplaceDragSource && !isKeyboardEvent(activatorEvent) || !transition) {
      return void 0;
    }
    if (isSorting || shouldAnimateLayoutChanges) {
      return CSS.Transition.toString({
        ...transition,
        property: transitionProperty
      });
    }
    return void 0;
  }
}
function normalizeLocalDisabled(localDisabled, globalDisabled) {
  var _localDisabled$dragga, _localDisabled$droppa;
  if (typeof localDisabled === "boolean") {
    return {
      draggable: localDisabled,
      // Backwards compatibility
      droppable: false
    };
  }
  return {
    draggable: (_localDisabled$dragga = localDisabled == null ? void 0 : localDisabled.draggable) != null ? _localDisabled$dragga : globalDisabled.draggable,
    droppable: (_localDisabled$droppa = localDisabled == null ? void 0 : localDisabled.droppable) != null ? _localDisabled$droppa : globalDisabled.droppable
  };
}
function hasSortableData(entry) {
  if (!entry) {
    return false;
  }
  const data = entry.data.current;
  if (data && "sortable" in data && typeof data.sortable === "object" && "containerId" in data.sortable && "items" in data.sortable && "index" in data.sortable) {
    return true;
  }
  return false;
}
var directions = [KeyboardCode.Down, KeyboardCode.Right, KeyboardCode.Up, KeyboardCode.Left];
var sortableKeyboardCoordinates = (event, _ref) => {
  let {
    context: {
      active,
      collisionRect,
      droppableRects,
      droppableContainers,
      over,
      scrollableAncestors
    }
  } = _ref;
  if (directions.includes(event.code)) {
    event.preventDefault();
    if (!active || !collisionRect) {
      return;
    }
    const filteredContainers = [];
    droppableContainers.getEnabled().forEach((entry) => {
      if (!entry || entry != null && entry.disabled) {
        return;
      }
      const rect = droppableRects.get(entry.id);
      if (!rect) {
        return;
      }
      switch (event.code) {
        case KeyboardCode.Down:
          if (collisionRect.top < rect.top) {
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Up:
          if (collisionRect.top > rect.top) {
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Left:
          if (collisionRect.left > rect.left) {
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Right:
          if (collisionRect.left < rect.left) {
            filteredContainers.push(entry);
          }
          break;
      }
    });
    const collisions = closestCorners({
      active,
      collisionRect,
      droppableRects,
      droppableContainers: filteredContainers,
      pointerCoordinates: null
    });
    let closestId = getFirstCollision(collisions, "id");
    if (closestId === (over == null ? void 0 : over.id) && collisions.length > 1) {
      closestId = collisions[1].id;
    }
    if (closestId != null) {
      const activeDroppable = droppableContainers.get(active.id);
      const newDroppable = droppableContainers.get(closestId);
      const newRect = newDroppable ? droppableRects.get(newDroppable.id) : null;
      const newNode = newDroppable == null ? void 0 : newDroppable.node.current;
      if (newNode && newRect && activeDroppable && newDroppable) {
        const newScrollAncestors = getScrollableAncestors(newNode);
        const hasDifferentScrollAncestors = newScrollAncestors.some((element, index) => scrollableAncestors[index] !== element);
        const hasSameContainer = isSameContainer(activeDroppable, newDroppable);
        const isAfterActive = isAfter(activeDroppable, newDroppable);
        const offset = hasDifferentScrollAncestors || !hasSameContainer ? {
          x: 0,
          y: 0
        } : {
          x: isAfterActive ? collisionRect.width - newRect.width : 0,
          y: isAfterActive ? collisionRect.height - newRect.height : 0
        };
        const rectCoordinates = {
          x: newRect.left,
          y: newRect.top
        };
        const newCoordinates = offset.x && offset.y ? rectCoordinates : subtract(rectCoordinates, offset);
        return newCoordinates;
      }
    }
  }
  return void 0;
};
function isSameContainer(a, b) {
  if (!hasSortableData(a) || !hasSortableData(b)) {
    return false;
  }
  return a.data.current.sortable.containerId === b.data.current.sortable.containerId;
}
function isAfter(a, b) {
  if (!hasSortableData(a) || !hasSortableData(b)) {
    return false;
  }
  if (!isSameContainer(a, b)) {
    return false;
  }
  return a.data.current.sortable.index < b.data.current.sortable.index;
}

// src/lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/translations.ts
var translations = {
  ja: {
    appName: "\u5B66\u7FD2\u9032\u6357\u30DE\u30CD\u30FC\u30B8\u30E3\u30FC",
    active: "\u9032\u884C\u4E2D",
    archive: "\u30A2\u30FC\u30AB\u30A4\u30D6",
    progress: "\u5168\u4F53\u306E\u9032\u6357",
    tasksCount: "\u8AB2\u984C\u6570",
    upcoming: "\u671F\u9650\u5207\u8FEB",
    recentActivity: "\u6700\u8FD1\u306E\u30A2\u30AF\u30C6\u30A3\u30D3\u30C6\u30A3",
    noTasks: "\u30BF\u30B9\u30AF\u304C\u3042\u308A\u307E\u305B\u3093",
    noActivity: "\u8A18\u9332\u306F\u3042\u308A\u307E\u305B\u3093",
    addNew: "\u65B0\u898F\u8FFD\u52A0",
    editTask: "\u30BF\u30B9\u30AF\u3092\u7DE8\u96C6",
    title: "\u30BF\u30A4\u30C8\u30EB",
    subject: "\u79D1\u76EE",
    deadline: "\u7DE0\u5207\u65E5",
    priority: "\u512A\u5148\u5EA6",
    details: "\u8A73\u7D30",
    save: "\u4FDD\u5B58",
    cancel: "\u30AD\u30E3\u30F3\u30BB\u30EB",
    delete: "\u524A\u9664",
    complete: "\u5B8C\u4E86\u306B\u3059\u308B",
    completed: "\u5B8C\u4E86\u6E08\u307F",
    startTimer: "\u53D6\u308A\u7D44\u3080",
    focusMode: "\u8A08\u6E2C\u30E2\u30FC\u30C9\u306E\u9078\u629E",
    focusModeStopwatch: "\u30B9\u30C8\u30C3\u30D7\u30A6\u30A9\u30C3\u30C1",
    focusModePomodoro: "\u30DD\u30E2\u30C9\u30FC\u30ED",
    focusModeDescStopwatch: "\u6642\u9593\u3092\u8A08\u308A\u306A\u304C\u3089\u96C6\u4E2D",
    focusModeDescPomodoro: "25\u5206\u96C6\u4E2D\u3057\u30665\u5206\u4F11\u61A9",
    stopTimer: "\u7D42\u4E86",
    pause: "\u4E00\u6642\u505C\u6B62",
    resume: "\u518D\u958B",
    taskType: "\u9032\u6357\u5F62\u5F0F",
    percentage: "\u30D1\u30FC\u30BB\u30F3\u30C8\u5F62\u5F0F",
    pages: "\u30DA\u30FC\u30B8\u5F62\u5F0F",
    startPage: "\u958B\u59CB\u30DA\u30FC\u30B8",
    endPage: "\u7D42\u4E86\u30DA\u30FC\u30B8",
    progressUpdate: "\u9032\u6357\u3092\u5165\u529B",
    currentProgress: "\u73FE\u5728\u306E\u9032\u6357",
    afterUpdate: "\u66F4\u65B0\u5F8C",
    record: "\u8A18\u9332\u3059\u308B",
    pomodoro: "\u30DD\u30E2\u30C9\u30FC\u30ED",
    stopwatch: "\u30B9\u30C8\u30C3\u30D7\u30A6\u30A9\u30C3\u30C1",
    focusTime: "\u96C6\u4E2D\u6642\u9593",
    breakTime: "\u4F11\u61A9",
    sessions: "\u30BB\u30C3\u30B7\u30E7\u30F3",
    workPhase: "\u96C6\u4E2D\u30D5\u30A7\u30FC\u30BA",
    breakPhase: "\u4F11\u61A9\u30D5\u30A7\u30FC\u30BA",
    confirmDelete: "\u3053\u306E\u30BF\u30B9\u30AF\u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F",
    confirmComplete: "\u3053\u306E\u30BF\u30B9\u30AF\u3092\u5B8C\u4E86\u306B\u3057\u307E\u3059\u304B\uFF1F",
    taskCompletedMessage: "\u30BF\u30B9\u30AF\u5B8C\u4E86\uFF01\u304A\u75B2\u308C\u69D8\u3067\u3059\uFF01",
    askToComplete: "\u9032\u6357\u304C100%\u306B\u9054\u3057\u307E\u3057\u305F\u3002\u5B8C\u4E86\u3068\u3057\u3066\u8A18\u9332\u3057\u307E\u3059\u304B\uFF1F",
    confirmPermanentDelete: "\u3053\u306E\u30BF\u30B9\u30AF\u3092\u5B8C\u5168\u306B\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F",
    selectAll: "\u3059\u3079\u3066\u9078\u629E",
    deselectAll: "\u9078\u629E\u89E3\u9664",
    deleteSelected: "\u9078\u629E\u3057\u305F\u9805\u76EE\u3092\u524A\u9664",
    confirmDeleteSelected: "\u9078\u629E\u3057\u305F\u30BF\u30B9\u30AF\u3092\u5C65\u6B74\u304B\u3089\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F",
    selectionMode: "\u9078\u629E",
    exitSelectionMode: "\u30AD\u30E3\u30F3\u30BB\u30EB",
    reorderInfo: "\u30C9\u30E9\u30C3\u30B0\u3057\u3066\u4E26\u3073\u66FF\u3048",
    urgency_urgent: "\u81F3\u6025",
    urgency_warning: "\u8B66\u544A",
    urgency_normal: "\u9806\u8ABF",
    urgency_archive: "\u30A2\u30FC\u30AB\u30A4\u30D6",
    urgency_completed: "\u5B8C\u4E86",
    daysLeft: "\u6B8B\u308A",
    days: "\u65E5",
    overdue: "\u671F\u9650\u5207\u308C",
    today: "\u4ECA\u65E5",
    low: "\u4F4E",
    medium: "\u4E2D",
    high: "\u9AD8",
    settings: "\u8A2D\u5B9A",
    theme: "\u30C6\u30FC\u30DE",
    language: "\u8A00\u8A9E",
    light: "\u30E9\u30A4\u30C8",
    navy: "\u30CD\u30A4\u30D3\u30FC",
    editSubjects: "\u6559\u79D1\u306E\u7DE8\u96C6",
    addSubject: "\u8FFD\u52A0",
    newSubjectPlaceholder: "\u65B0\u3057\u3044\u6559\u79D1\u540D...",
    confirmDeleteSubject: " \u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F",
    subjectPlaceholder: "\u79D1\u76EE\u540D\u3092\u5165\u529B...",
    titlePlaceholder: "\u8AB2\u984C\u306E\u30BF\u30A4\u30C8\u30EB\u3092\u5165\u529B...",
    descriptionPlaceholder: "\u8A73\u7D30\u60C5\u5831\u5165\u529B...",
    toggleDigitalTimer: "\u30C7\u30B8\u30BF\u30EB\u6642\u8A08\u3092\u8868\u793A",
    invalidProgressInput: "1\u301C100\u306E\u9593\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044",
    allSubjects: "\u3059\u3079\u3066",
    filterBySubject: "\u6559\u79D1\u3067\u7D5E\u308A\u8FBC\u307F",
    license: "\u30E9\u30A4\u30BB\u30F3\u30B9",
    license_desc: "\u3053\u306E\u30A2\u30D7\u30EA\u306FMIT\u30E9\u30A4\u30BB\u30F3\u30B9\u306E\u3082\u3068\u3067\u516C\u958B\u3055\u308C\u3066\u3044\u307E\u3059\u3002",
    feedback: "\u3054\u610F\u898B\u30FB\u3054\u8981\u671B",
    feedback_desc: "\u30A2\u30D7\u30EA\u306E\u6539\u5584\u306B\u3054\u5354\u529B\u304F\u3060\u3055\u3044",
    send_feedback: "\u610F\u898B\u7BB1\u3092\u958B\u304F",
    termsOfService: "\u5229\u7528\u898F\u7D04",
    progressLabel: "\u9032\u6357",
    logout: "\u30ED\u30B0\u30A2\u30A6\u30C8",
    version: "\u30D0\u30FC\u30B8\u30E7\u30F3"
  },
  en: {
    appName: "Study Tracker",
    active: "In Progress",
    archive: "Archive",
    progress: "Overall Progress",
    tasksCount: "Tasks",
    upcoming: "Upcoming",
    recentActivity: "Recent Activity",
    noTasks: "No tasks found",
    noActivity: "No activity logs",
    addNew: "Add New",
    editTask: "Edit Task",
    title: "Title",
    subject: "Subject",
    deadline: "Deadline",
    priority: "Priority",
    details: "Details",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    complete: "Complete",
    completed: "Completed",
    startTimer: "Focus",
    focusMode: "Select Mode",
    focusModeStopwatch: "Stopwatch",
    focusModePomodoro: "Pomodoro",
    focusModeDescStopwatch: "Track time as you go",
    focusModeDescPomodoro: "25m work / 5m break",
    stopTimer: "Stop",
    pause: "Pause",
    resume: "Resume",
    taskType: "Task Type",
    percentage: "Percentage",
    pages: "Pages",
    startPage: "Start Page",
    endPage: "End Page",
    progressUpdate: "Update Progress",
    currentProgress: "Current Progress",
    afterUpdate: "After Update",
    record: "Record",
    pomodoro: "Pomodoro",
    stopwatch: "Stopwatch",
    focusTime: "Focus",
    breakTime: "Break",
    sessions: "Sessions",
    workPhase: "Focus Phase",
    breakPhase: "Break Phase",
    confirmDelete: "Delete this task (move to archive)?",
    confirmComplete: "Mark this task as completed?",
    taskCompletedMessage: "Task completed! Great job!",
    askToComplete: "Progress reached 100%. Mark as completed?",
    confirmPermanentDelete: "Permanently delete this task?",
    selectAll: "Select All",
    deselectAll: "Deselect All",
    deleteSelected: "Delete Selected",
    confirmDeleteSelected: "Delete selected tasks from history permanently?",
    selectionMode: "Edit",
    exitSelectionMode: "Cancel",
    reorderInfo: "Drag to reorder",
    urgency_urgent: "Urgent",
    urgency_warning: "Warning",
    urgency_normal: "Good",
    urgency_archive: "Archived",
    urgency_completed: "Done",
    daysLeft: "Left",
    days: "d",
    overdue: "Overdue",
    today: "Today",
    low: "Low",
    medium: "Med",
    high: "High",
    settings: "Settings",
    theme: "Theme",
    language: "Language",
    light: "Light",
    navy: "Navy",
    editSubjects: "Edit Subjects",
    addSubject: "Add",
    newSubjectPlaceholder: "New subject name...",
    confirmDeleteSubject: "Delete ",
    subjectPlaceholder: "Enter subject...",
    titlePlaceholder: "Enter task title...",
    descriptionPlaceholder: "Enter description...",
    toggleDigitalTimer: "Show Digital Clock",
    invalidProgressInput: "Input must be between 1 and 100",
    allSubjects: "All",
    filterBySubject: "Filter by subject",
    license: "License",
    license_desc: "This app is released under the MIT License.",
    feedback: "Feedback",
    feedback_desc: "Help us improve the app",
    send_feedback: "Open Feedback Box",
    termsOfService: "Terms of Service",
    progressLabel: "Progress",
    logout: "Logout",
    version: "Version"
  }
};

// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  getDocFromServer,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";

// firebase-applet-config.json
var firebase_applet_config_default = {
  projectId: "gen-lang-client-0819118944",
  appId: "1:670305378100:web:cbf05f183bf9611ce84f61",
  apiKey: "AIzaSyA7P3JSJYj9rxmUt04iKXLwNmK-mzy0PZ4",
  authDomain: "gen-lang-client-0819118944.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-5a6f048f-d0e7-4cbc-81d5-e57f525a177e",
  storageBucket: "gen-lang-client-0819118944.firebasestorage.app",
  messagingSenderId: "670305378100",
  measurementId: ""
};

// src/lib/firebase.ts
var app = initializeApp(firebase_applet_config_default);
var db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
}, firebase_applet_config_default.firestoreDatabaseId);
var auth = getAuth(app);
var googleProvider = new GoogleAuthProvider();

// src/App.tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
}
var DEFAULT_SUBJECTS = [
  "\u56FD\u8A9E",
  "\u6570\u5B66",
  "\u82F1\u8A9E",
  "\u7269\u7406",
  "\u5316\u5B66",
  "\u751F\u7269",
  "\u5730\u5B66",
  "\u4E16\u754C\u53F2",
  "\u65E5\u672C\u53F2",
  "\u5730\u7406",
  "\u73FE\u4EE3\u793E\u4F1A",
  "\u502B\u7406",
  "\u653F\u6CBB\u30FB\u7D4C\u6E08",
  "\u60C5\u5831",
  "\u305D\u306E\u4ED6"
];
var APP_VERSION = "1.2.0";
var RELEASE_NOTES = {
  version: "1.2.0",
  title: "\u{1F389} \u30A2\u30C3\u30D7\u30C7\u30FC\u30C8\u306E\u304A\u77E5\u3089\u305B (v1.2.0)",
  features: {
    title: "\u2728 \u65B0\u6A5F\u80FD\u30FB\u6539\u5584\u70B9",
    items: [
      "\u8A2D\u5B9A\u753B\u9762\u304B\u3089\u300C\u6559\u79D1\u306E\u4E26\u3073\u66FF\u3048\u300D\u304C\u3067\u304D\u308B\u3088\u3046\u306B\u306A\u308A\u307E\u3057\u305F",
      "\u30A2\u30FC\u30AB\u30A4\u30D6\u6E08\u307F\uFF08\u5C65\u6B74\uFF09\u30BF\u30B9\u30AF\u306E\u300C\u9078\u629E\u524A\u9664\u300D\u306B\u5BFE\u5FDC\u3057\u307E\u3057\u305F",
      "\u30BF\u30B9\u30AF\u8A73\u7D30\u753B\u9762\u306B\u3001\u76F4\u63A5\u9032\u6357\u3092\u5909\u66F4\u3067\u304D\u308B\u300C\u9032\u6357\u3092\u5165\u529B\u300D\u6A5F\u80FD\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F"
    ]
  }
};
var TERMS_OF_SERVICE = {
  title: "\u{1F680} Submission-Manager \u30A2\u30D7\u30EA\u6982\u8981",
  intro: "\u300C\u9032\u6357\u3092\u53EF\u8996\u5316\u3057\u3001\u63D0\u51FA\u671F\u9650\u3092\u9003\u3055\u306A\u3044\u3002\u300D\n\nSubmission-Manager\u306F\u3001\u65E5\u3005\u306E\u8AB2\u984C\u3084\u63D0\u51FA\u7269\u3092\u4E00\u62EC\u7BA1\u7406\u3057\u3001\u5B66\u7FD2\u52B9\u7387\u3092\u6700\u5927\u5316\u3059\u308B\u305F\u3081\u306B\u958B\u767A\u3055\u308C\u305F\u9032\u6357\u7BA1\u7406\u30C4\u30FC\u30EB\u3067\u3059\u3002",
  features: {
    title: "\u{1F4CC} \u4E3B\u306A\u6A5F\u80FD",
    items: [
      "\u30BF\u30B9\u30AF\u30FB\u8AB2\u984C\u306E\u9032\u6357\u7BA1\u7406: 0%\u301C100%\u306E\u30B9\u30C6\u30FC\u30BF\u30B9\u3067\u9032\u884C\u72B6\u6CC1\u3092\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u306B\u628A\u63E1\u3002",
      "\u671F\u9650\u901A\u77E5\u30B7\u30B9\u30C6\u30E0: \u6B8B\u308A\u65E5\u6570\u3084\u671F\u9650\u9593\u8FD1\u306E\u30BF\u30B9\u30AF\u3092\u3072\u3068\u76EE\u3067\u78BA\u8A8D\u53EF\u80FD\u3002",
      "\u79D1\u76EE\u30FB\u30AB\u30C6\u30B4\u30EA\u30FC\u5225\u30D5\u30A3\u30EB\u30BF: \u6574\u7406\u3055\u308C\u305F\u8868\u793A\u3067\u3001\u8FF7\u308F\u305A\u30BF\u30B9\u30AF\u306B\u7740\u624B\u3002"
    ]
  },
  terms: {
    title: "\u{1F4DD} \u3054\u5229\u7528\u898F\u7D04\u304A\u3088\u3073\u514D\u8CAC\u4E8B\u9805",
    intro: "\u672C\u30A2\u30D7\u30EA\u306E\u5229\u7528\u306B\u3042\u305F\u308A\u3001\u4EE5\u4E0B\u306E\u5185\u5BB9\u3092\u5FC5\u305A\u3054\u78BA\u8A8D\u304F\u3060\u3055\u3044\u3002",
    sections: [
      {
        title: "1. \u30B5\u30FC\u30D3\u30B9\u306E\u7D99\u7D9A\u6027\u306B\u3064\u3044\u3066",
        content: "\u672C\u30A2\u30D7\u30EA\u306F Google Firebase \u304A\u3088\u3073\u7121\u6599\u67A0\u306E\u30B5\u30FC\u30D0\u30FC\u8CC7\u6E90\u3092\u5229\u7528\u3057\u3066\u904B\u7528\u3055\u308C\u3066\u3044\u307E\u3059\u3002\n\n\u7121\u6599\u67A0\u306E\u5236\u9650\u3084\u30D7\u30E9\u30C3\u30C8\u30D5\u30A9\u30FC\u30E0\u306E\u4ED5\u69D8\u5909\u66F4\u306B\u3088\u308A\u3001\u4E88\u544A\u306A\u304F\u30B5\u30FC\u30D3\u30B9\u306E\u505C\u6B62\u3001\u307E\u305F\u306F\u4E00\u90E8\u6A5F\u80FD\u304C\u5229\u7528\u3067\u304D\u306A\u304F\u306A\u308B\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059\u3002\u3042\u3089\u304B\u3058\u3081\u3054\u4E86\u627F\u304F\u3060\u3055\u3044\u3002"
      },
      {
        title: "2. \u30D7\u30E9\u30A4\u30D0\u30B7\u30FC\u3068\u500B\u4EBA\u60C5\u5831\u306E\u53D6\u308A\u6271\u3044",
        content: "\u500B\u4EBA\u60C5\u5831\u306E\u975E\u4FDD\u6301: \u5F53\u30A2\u30D7\u30EA\u3067\u306F\u3001\u30A2\u30AB\u30A6\u30F3\u30C8\u60C5\u5831\uFF08\u6C0F\u540D\u30FB\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u7B49\uFF09\u3084\u3001\u4F5C\u6210\u3055\u308C\u305F\u30BF\u30B9\u30AF\u306E\u5177\u4F53\u7684\u306A\u5185\u5BB9\u3001\u305D\u306E\u4ED6\u500B\u4EBA\u3092\u7279\u5B9A\u3067\u304D\u308B\u60C5\u5831\u306F\u4E00\u5207\u53D6\u5F97\u30FB\u4FDD\u6301\u3044\u305F\u3057\u307E\u305B\u3093\u3002\n\n\u30C7\u30FC\u30BF\u306E\u533F\u540D\u6027: \u5165\u529B\u3055\u308C\u305F\u30C7\u30FC\u30BF\u306F\u30D6\u30E9\u30A6\u30B6\u307E\u305F\u306F\u30D7\u30E9\u30C3\u30C8\u30D5\u30A9\u30FC\u30E0\u4E0A\u306E\u533F\u540D\u5316\u3055\u308C\u305F\u9818\u57DF\u3067\u51E6\u7406\u3055\u308C\u307E\u3059\u3002"
      },
      {
        title: "3. \u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF\u3068\u5B66\u8853\u5229\u7528",
        content: "\u30E6\u30FC\u30B6\u30FC\u306E\u7686\u69D8\u304B\u3089\u3044\u305F\u3060\u3044\u305F\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF\u3084\u3001\u7D71\u8A08\u7684\u306A\u5229\u7528\u72B6\u6CC1\u30C7\u30FC\u30BF\uFF08\u500B\u4EBA\u3092\u7279\u5B9A\u3057\u306A\u3044\u5F62\u306E\u3082\u306E\uFF09\u306F\u3001\u5B66\u8853\u7684\u306A\u767A\u8868\u3084\u7814\u7A76\u3001\u958B\u767A\u5831\u544A\u7B49\u306B\u4F7F\u7528\u3055\u305B\u3066\u3044\u305F\u3060\u304F\u5834\u5408\u304C\u3042\u308A\u307E\u3059\u3002"
      },
      {
        title: "4. \u514D\u8CAC\u4E8B\u9805",
        content: "\u672C\u30A2\u30D7\u30EA\u306E\u4F7F\u7528\u306B\u3088\u3063\u3066\u751F\u3058\u305F\u640D\u5BB3\uFF08\u30C7\u30FC\u30BF\u306E\u6D88\u5931\u3001\u671F\u9650\u306E\u5931\u5FF5\u7B49\uFF09\u306B\u3064\u3044\u3066\u3001\u958B\u767A\u8005\u306F\u4E00\u5207\u306E\u8CAC\u4EFB\u3092\u8CA0\u3044\u304B\u306D\u307E\u3059\u3002\u91CD\u8981\u306A\u30BF\u30B9\u30AF\u306B\u3064\u3044\u3066\u306F\u3001\u9069\u5B9C\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u3084\u4F75\u7528\u7BA1\u7406\u3092\u304A\u52E7\u3081\u3044\u305F\u3057\u307E\u3059\u3002"
      }
    ],
    footer: "\u30ED\u30B0\u30A4\u30F3\u3059\u308B\u3053\u3068\u3067\u3001\u5229\u7528\u898F\u7D04\u304A\u3088\u3073\u514D\u8CAC\u4E8B\u9805\u306B\u540C\u610F\u3057\u305F\u3082\u306E\u3068\u307F\u306A\u3055\u308C\u307E\u3059\u3002"
  }
};
function App() {
  const [user, setUser] = useState4(null);
  const [showUpdateModal, setShowUpdateModal] = useState4(false);
  const [isAuthReady, setIsAuthReady] = useState4(false);
  const [submissions, setSubmissions] = useState4([]);
  const [selectedId, setSelectedId] = useState4(null);
  const [isAdding, setIsAdding] = useState4(false);
  const [isEditing, setIsEditing] = useState4(false);
  const [editData, setEditData] = useState4(null);
  const [selectedDate, setSelectedDate] = useState4(/* @__PURE__ */ new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState4(false);
  const [addTaskType, setAddTaskType] = useState4("percentage");
  const [activeTab, setActiveTab] = useState4("active");
  const [isSelectionMode, setIsSelectionMode] = useState4(false);
  const [selectedArchiveIds, setSelectedArchiveIds] = useState4(/* @__PURE__ */ new Set());
  const [subjectFilter, setSubjectFilter] = useState4(null);
  const [modalSubject, setModalSubject] = useState4("");
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState4(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState4(() => {
    return localStorage.getItem("app-terms-accepted") === "true";
  });
  const [showUpdateNotice, setShowUpdateNotice] = useState4(() => {
    return localStorage.getItem("app-last-version") !== APP_VERSION;
  });
  const [showTermsModal, setShowTermsModal] = useState4(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState4(false);
  const [tempAccepted, setTempAccepted] = useState4(false);
  useEffect4(() => {
    setSelectedArchiveIds(/* @__PURE__ */ new Set());
    setIsSelectionMode(false);
  }, [activeTab, subjectFilter]);
  useEffect4(() => {
    if (isAdding) {
      setModalSubject("");
    }
  }, [isAdding]);
  useEffect4(() => {
    if (isEditing && editData) {
      setModalSubject(editData.subject);
    }
  }, [isEditing, editData]);
  const [language, setLanguage] = useState4(() => {
    const saved = localStorage.getItem("app-language");
    return saved || "ja";
  });
  const [modalPriority, setModalPriority] = useState4("medium");
  const [theme, setTheme] = useState4(() => {
    const saved = localStorage.getItem("app-theme");
    return saved || "light";
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState4(false);
  const [subjects, setSubjects] = useState4(() => {
    const saved = localStorage.getItem("app-subjects");
    return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS;
  });
  const [newSubject, setNewSubject] = useState4("");
  const [toastMessage, setToastMessage] = useState4(null);
  const [isFocusSelectorOpen, setIsFocusSelectorOpen] = useState4(false);
  const [deadlineTime, setDeadlineTime] = useState4("23:59");
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );
  function handleDragEnd(event) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSubjects((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem("app-subjects", JSON.stringify(newItems));
        if (user) {
          setDoc(doc(db, "users", user.uid), { subjects: newItems }, { merge: true });
        }
        return newItems;
      });
    }
  }
  const [activeTimerId, setActiveTimerId] = useState4(null);
  const [timerSeconds, setTimerSeconds] = useState4(0);
  const [isTimerRunning, setIsTimerRunning] = useState4(false);
  const [isTimerPaused, setIsTimerPaused] = useState4(false);
  const [showProgressInput, setShowProgressInput] = useState4(false);
  const [progressInputValue, setProgressInputValue] = useState4("");
  const [timerMode, setTimerMode] = useState4("stopwatch");
  const [pomodoroPhase, setPomodoroPhase] = useState4("work");
  const [pomodoroSessionCount, setPomodoroSessionCount] = useState4(0);
  const [pomodoroDurations, setPomodoroDurations] = useState4({ work: 25 * 60, break: 5 * 60 });
  const [showDigitalTimer, setShowDigitalTimer] = useState4(true);
  const [confirmDialog, setConfirmDialog] = useState4(null);
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3e3);
  };
  const t = translations[language];
  useEffect4(() => {
    const savedVersion = localStorage.getItem("app-version");
    if (savedVersion !== APP_VERSION) {
      setShowUpdateModal(true);
    }
  }, []);
  const closeUpdateModal = () => {
    localStorage.setItem("app-version", APP_VERSION);
    setShowUpdateModal(false);
  };
  useEffect4(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.theme && data.theme !== theme) setTheme(data.theme);
        if (data.language && data.language !== language) setLanguage(data.language);
        if (data.subjects && JSON.stringify(data.subjects) !== JSON.stringify(subjects)) {
          setSubjects(data.subjects);
        }
        if (data.pomodoroDurations && JSON.stringify(data.pomodoroDurations) !== JSON.stringify(pomodoroDurations)) {
          setPomodoroDurations(data.pomodoroDurations);
        }
      } else {
        setDoc(doc(db, "users", user.uid), {
          theme,
          language,
          subjects,
          pomodoroDurations
        }, { merge: true });
      }
    });
    return () => unsub();
  }, [user]);
  const latestSettings = useRef4({ theme, language, subjects, pomodoroDurations });
  useEffect4(() => {
    latestSettings.current = { theme, language, subjects, pomodoroDurations };
  }, [theme, language, subjects, pomodoroDurations]);
  useEffect4(() => {
    if (!user) return;
    const timeout = setTimeout(async () => {
      try {
        await setDoc(doc(db, "users", user.uid), {
          ...latestSettings.current
        }, { merge: true });
      } catch (e) {
        console.warn("Failed to sync settings to cloud", e);
      }
    }, 3e4);
    return () => clearTimeout(timeout);
  }, [theme, language, subjects, pomodoroDurations, user]);
  useEffect4(() => {
    if (!user) return;
    const performSync = () => {
      setDoc(doc(db, "users", user.uid), {
        ...latestSettings.current
      }, { merge: true }).catch(console.warn);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        performSync();
      }
    };
    window.addEventListener("beforeunload", performSync);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", performSync);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);
  useEffect4(() => {
    localStorage.setItem("app-subjects", JSON.stringify(subjects));
  }, [subjects]);
  useEffect4(() => {
    document.body.className = "";
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else if (theme !== "light") {
      document.body.classList.add(`theme-${theme}`);
    }
    localStorage.setItem("app-theme", theme);
  }, [theme]);
  useEffect4(() => {
    localStorage.setItem("app-language", language);
  }, [language]);
  const overallProgress = useMemo4(() => {
    const activeTasks = submissions.filter((s) => !s.isDeleted && s.status !== "completed");
    if (activeTasks.length === 0) {
      const hasCompleted = submissions.some((s) => !s.isDeleted && s.status === "completed");
      return hasCompleted ? 100 : 0;
    }
    const totalProgress = activeTasks.reduce((sum, s) => sum + (s.progress || 0), 0);
    return Math.round(totalProgress / activeTasks.length);
  }, [submissions]);
  const nearestDeadlinesCount = useMemo4(() => {
    return submissions.filter(
      (s) => !s.isDeleted && s.status !== "completed" && differenceInDays(s.deadline, /* @__PURE__ */ new Date()) <= 2
    ).length;
  }, [submissions]);
  const previewProgress = useMemo4(() => {
    if (!activeTimerId || !progressInputValue) return null;
    const submission = submissions.find((s) => s.id === activeTimerId);
    if (!submission) return null;
    const increment = parseInt(progressInputValue) || 0;
    let newProgress = submission.progress;
    if (submission.taskType === "pages") {
      const newCurrentPage = (submission.currentPage || 0) + increment;
      const totalPages = (submission.endPage || 0) - (submission.startPage || 0);
      if (totalPages <= 0) return 100;
      newProgress = Math.min(100, Math.round((newCurrentPage - (submission.startPage || 0)) / totalPages * 100));
    } else {
      newProgress = Math.min(100, submission.progress + increment);
    }
    return newProgress;
  }, [activeTimerId, progressInputValue, submissions]);
  useEffect4(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);
  useEffect4(() => {
    const checkDeadlines = () => {
      const now = /* @__PURE__ */ new Date();
      submissions.forEach((s) => {
        if (s.status === "completed") return;
        const diff = s.deadline.getTime() - now.getTime();
        const oneHour = 1e3 * 60 * 60;
        if (diff > 0 && diff < oneHour) {
          const storageKey = `notified_${s.id}`;
          if (!sessionStorage.getItem(storageKey)) {
            new Notification("\u7DE0\u5207\u9593\u8FD1\u306E\u8AB2\u984C\u304C\u3042\u308A\u307E\u3059", {
              body: `${s.subject}: ${s.title} \u306E\u7DE0\u5207\u307E\u3067\u3042\u30681\u6642\u9593\u4EE5\u5185\u3067\u3059\uFF01`,
              icon: "/Gemini_Generated_Image_pm2flopm2flopm2f.png"
            });
            sessionStorage.setItem(storageKey, "true");
          }
        }
      });
    };
    const interval = setInterval(checkDeadlines, 1e3 * 60 * 5);
    checkDeadlines();
    return () => clearInterval(interval);
  }, [submissions]);
  useEffect4(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);
  useEffect4(() => {
    if (isAuthReady && user) {
      const testConnection = async () => {
        try {
          await getDocFromServer(doc(db, "test", "connection"));
        } catch (error) {
          if (error instanceof Error && error.message.includes("the client is offline")) {
            console.error("Please check your Firebase configuration. The client is offline.");
          }
        }
      };
      testConnection();
    }
  }, [isAuthReady, user]);
  useEffect4(() => {
    if (!user) {
      setSubmissions([]);
      return;
    }
    const q = query(
      collection(db, "submissions"),
      where("uid", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc2) => {
        const docData = doc2.data();
        return {
          ...docData,
          id: doc2.id,
          deadline: docData.deadline.toDate()
        };
      });
      setSubmissions(data);
    }, (error) => {
      handleFirestoreError(error, "get" /* GET */, "submissions");
    });
    return () => unsubscribe();
  }, [user]);
  useEffect4(() => {
    let interval;
    if (isTimerRunning && !isTimerPaused) {
      interval = setInterval(() => {
        if (timerMode === "stopwatch") {
          setTimerSeconds((s) => s + 1);
        } else {
          setTimerSeconds((s) => {
            if (s <= 0) {
              handlePomodoroPhaseComplete();
              return 0;
            }
            return s - 1;
          });
        }
      }, 1e3);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isTimerPaused, timerMode]);
  const handlePomodoroPhaseComplete = () => {
    setIsTimerRunning(false);
    if (pomodoroPhase === "work") {
      setPomodoroPhase("break");
      setTimerSeconds(pomodoroDurations.break);
      setPomodoroSessionCount((c) => c + 1);
      new Notification(t.workPhase + " " + (language === "ja" ? "\u7D42\u4E86\uFF01" : "Finished!"), {
        body: t.breakPhase + (language === "ja" ? "\u3092\u59CB\u3081\u307E\u3057\u3087\u3046\u3002" : " starting now."),
        icon: "/Gemini_Generated_Image_pm2flopm2flopm2f.png"
      });
    } else {
      setPomodoroPhase("work");
      setTimerSeconds(pomodoroDurations.work);
      new Notification(t.breakPhase + " " + (language === "ja" ? "\u7D42\u4E86\uFF01" : "Finished!"), {
        body: t.workPhase + (language === "ja" ? "\u3092\u518D\u958B\u3057\u307E\u3057\u3087\u3046\u3002" : " starting now."),
        icon: "/Gemini_Generated_Image_pm2flopm2flopm2f.png"
      });
    }
    if (Notification.permission === "granted") {
    }
  };
  const startTimer = (id, mode = "stopwatch") => {
    setActiveTimerId(id);
    setTimerMode(mode);
    setPomodoroPhase("work");
    setPomodoroSessionCount(0);
    if (mode === "stopwatch") {
      setTimerSeconds(0);
    } else {
      setTimerSeconds(pomodoroDurations.work);
    }
    setIsTimerRunning(true);
    setIsTimerPaused(false);
    setShowProgressInput(false);
    setProgressInputValue("");
    setSelectedId(null);
  };
  const togglePause = () => {
    setIsTimerPaused(!isTimerPaused);
  };
  const stopTimer = () => {
    setIsTimerRunning(false);
    setIsTimerPaused(false);
    setShowProgressInput(true);
  };
  const saveActivity = async (increment) => {
    if (!activeTimerId) return;
    const submission = submissions.find((s) => s.id === activeTimerId);
    if (!submission) return;
    const isPagesValue = submission.taskType === "pages";
    const maxIncrement = isPagesValue ? 999 : 100;
    const isInteger = /^\d+$/.test(progressInputValue);
    if (!isInteger || increment <= 0 || increment > maxIncrement) {
      showToast(isPagesValue ? language === "ja" ? "\u6B63\u5F53\u306A\u6574\u6570\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" : "Enter a valid positive integer" : t.invalidProgressInput);
      return;
    }
    const currentTimerId = activeTimerId;
    setActiveTimerId(null);
    setShowProgressInput(false);
    setTimerSeconds(0);
    setProgressInputValue("");
    const durationMinutes = Math.round(timerSeconds / 60) || 1;
    const newLog = {
      id: crypto.randomUUID(),
      timestamp: Timestamp.now(),
      durationMinutes,
      progressIncrement: increment,
      type: submission.taskType
    };
    let newProgress = submission.progress;
    let newCurrentPage = submission.currentPage || 0;
    if (submission.taskType === "pages") {
      newCurrentPage += increment;
      const totalPages = (submission.endPage || 0) - (submission.startPage || 0);
      newProgress = Math.min(100, Math.round((newCurrentPage - (submission.startPage || 0)) / totalPages * 100));
    } else {
      newProgress = Math.min(100, submission.progress + increment);
    }
    try {
      let finalStatus = newProgress === 100 ? "completed" : "in-progress";
      let finalProgress = newProgress;
      let finalCompletedAt = newProgress === 100 ? serverTimestamp() : submission.completedAt || null;
      if (newProgress === 100 && submission.status !== "completed") {
        setConfirmDialog({
          title: t.complete,
          message: t.askToComplete,
          onConfirm: async () => {
            await finalizeActivity(currentTimerId, newCurrentPage, 100, "completed", [...submission.activityLogs || [], newLog], serverTimestamp());
            setConfirmDialog(null);
          },
          onCancel: async () => {
            await finalizeActivity(currentTimerId, newCurrentPage, 99, "in-progress", [...submission.activityLogs || [], newLog], null);
            setConfirmDialog(null);
          }
        });
        return;
      }
      await finalizeActivity(currentTimerId, newCurrentPage, finalProgress, finalStatus, [...submission.activityLogs || [], newLog], finalCompletedAt);
    } catch (error) {
      handleFirestoreError(error, "update" /* UPDATE */, `submissions/${activeTimerId}`);
    }
  };
  const finalizeActivity = async (id, currentPage, progress, status, activityLogs, completedAt) => {
    try {
      await updateDoc(doc(db, "submissions", id), {
        progress,
        currentPage,
        status,
        activityLogs,
        completedAt
      });
      if (status === "completed") {
        confetti_module_default({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        showToast(t.taskCompletedMessage);
      }
    } catch (error) {
      handleFirestoreError(error, "update" /* UPDATE */, `submissions/${id}`);
    }
  };
  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };
  const addSubmission = async (e) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title");
    const subject = formData.get("subject");
    const description = formData.get("description");
    const priority = formData.get("priority");
    const taskType = formData.get("taskType");
    const startPageRaw = formData.get("startPage");
    const endPageRaw = formData.get("endPage");
    const startPage = /^\d+$/.test(startPageRaw) ? parseInt(startPageRaw) : 0;
    const endPage = /^\d+$/.test(endPageRaw) ? parseInt(endPageRaw) : 0;
    const dateValue = formData.get("deadlineDate");
    const timeValue = formData.get("deadlineTime") || "23:59";
    if (!title || !subject || !dateValue) return;
    const [hours, minutes] = timeValue.split(":").map(Number);
    const [y, m, d] = dateValue.split("-").map(Number);
    const combinedDate = new Date(y, m - 1, d, hours, minutes, 0, 0);
    try {
      await addDoc(collection(db, "submissions"), {
        uid: user.uid,
        title,
        subject,
        deadline: Timestamp.fromDate(combinedDate),
        description: description || "",
        priority: priority || "medium",
        progress: 0,
        status: "pending",
        createdAt: serverTimestamp(),
        taskType,
        startPage: taskType === "pages" ? startPage : null,
        endPage: taskType === "pages" ? endPage : null,
        currentPage: taskType === "pages" ? startPage : 0,
        activityLogs: []
      });
      setIsAdding(false);
      setSelectedDate(/* @__PURE__ */ new Date());
    } catch (error) {
      handleFirestoreError(error, "create" /* CREATE */, "submissions");
    }
  };
  const updateSubmission = async (e) => {
    e.preventDefault();
    if (!user || !editData || !selectedDate) return;
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title");
    const subject = formData.get("subject");
    const description = formData.get("description");
    const priority = formData.get("priority");
    const progressValue = formData.get("progress");
    const progress = progressValue !== null ? parseInt(progressValue) || 0 : editData.progress;
    const dateValue = formData.get("deadlineDate");
    const timeValue = formData.get("deadlineTime") || "23:59";
    const startPageStr = formData.get("startPage");
    const endPageStr = formData.get("endPage");
    if (!title || !subject || !dateValue) return;
    const startPage = /^\d+$/.test(startPageStr) ? parseInt(startPageStr) : editData.startPage || 0;
    const endPage = /^\d+$/.test(endPageStr) ? parseInt(endPageStr) : editData.endPage || 0;
    const [hours, minutes] = timeValue.split(":").map(Number);
    const [y, m, d] = dateValue.split("-").map(Number);
    const combinedDate = new Date(y, m - 1, d, hours, minutes, 0, 0);
    const updatePayload = {
      title,
      subject,
      description,
      priority,
      progress,
      deadline: Timestamp.fromDate(combinedDate)
    };
    if (editData.taskType === "pages") {
      updatePayload.startPage = startPage;
      updatePayload.endPage = endPage;
    }
    const isCompleting = progress === 100 && editData.status !== "completed";
    if (isCompleting) {
      setConfirmDialog({
        title: t.complete,
        message: t.confirmComplete,
        onConfirm: async () => {
          try {
            await updateDoc(doc(db, "submissions", editData.id), {
              ...updatePayload,
              status: "completed",
              completedAt: editData.completedAt || serverTimestamp()
            });
            confetti_module_default({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            showToast(t.taskCompletedMessage);
            setIsEditing(false);
            setEditData(null);
            setConfirmDialog(null);
          } catch (error) {
            handleFirestoreError(error, "update" /* UPDATE */, `submissions/${editData.id}`);
          }
        },
        onCancel: () => setConfirmDialog(null)
      });
      return;
    }
    try {
      await updateDoc(doc(db, "submissions", editData.id), {
        ...updatePayload,
        status: editData.status === "completed" ? "completed" : progress === 100 ? "completed" : progress > 0 ? "in-progress" : "pending",
        completedAt: progress === 100 || editData.status === "completed" ? editData.completedAt || serverTimestamp() : null
      });
      setIsEditing(false);
      setEditData(null);
    } catch (error) {
      handleFirestoreError(error, "update" /* UPDATE */, `submissions/${editData.id}`);
    }
  };
  const deleteSubmission = async (id, e) => {
    e.stopPropagation();
    const submission = submissions.find((s) => s.id === id);
    if (!submission) return;
    setConfirmDialog({
      title: language === "ja" ? "\u30BF\u30B9\u30AF\u3092\u524A\u9664" : "Delete Task",
      message: language === "ja" ? "\u3053\u306E\u30BF\u30B9\u30AF\u3092\u30B4\u30DF\u7BB1\u306B\u79FB\u52D5\u3057\u307E\u3059\u304B\uFF1F" : "Move this task to trash?",
      onConfirm: async () => {
        try {
          await updateDoc(doc(db, "submissions", submission.id), {
            isDeleted: true,
            deletedAt: serverTimestamp()
          });
          setConfirmDialog(null);
          setSelectedId(null);
          showToast(language === "ja" ? "\u30BF\u30B9\u30AF\u3092\u524A\u9664\u3057\u307E\u3057\u305F" : "Task deleted");
        } catch (error) {
          handleFirestoreError(error, "update" /* UPDATE */, `submissions/${submission.id}`);
        }
      },
      onCancel: () => setConfirmDialog(null)
    });
  };
  const toggleComplete = async (id, e) => {
    e.stopPropagation();
    const submission = submissions.find((s) => s.id === id);
    if (!submission) return;
    const isCompleting = submission.status !== "completed";
    if (isCompleting) {
      setConfirmDialog({
        title: t.complete,
        message: t.confirmComplete,
        onConfirm: async () => {
          await performToggle(id, true);
          setConfirmDialog(null);
        },
        onCancel: () => setConfirmDialog(null)
      });
    } else {
      await performToggle(id, false);
    }
  };
  const performToggle = async (id, isCompleting) => {
    const submission = submissions.find((s) => s.id === id);
    if (!submission) return;
    try {
      await updateDoc(doc(db, "submissions", id), {
        status: isCompleting ? "completed" : "in-progress",
        progress: isCompleting ? 100 : submission.progress,
        completedAt: isCompleting ? serverTimestamp() : null
      });
      if (isCompleting) {
        confetti_module_default({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#364fc7", "#2b8a3e", "#fab005", "#fa5252"]
        });
        showToast(t.taskCompletedMessage);
      }
    } catch (error) {
      handleFirestoreError(error, "update" /* UPDATE */, `submissions/${id}`);
    }
  };
  const urgencyLevel = useMemo4(() => {
    const activeSubmissions = submissions.filter((s) => s.status !== "completed");
    if (activeSubmissions.length === 0) return "safe";
    const daysToNearest = Math.min(...activeSubmissions.map((s) => differenceInDays(s.deadline, /* @__PURE__ */ new Date())));
    if (daysToNearest <= 0) return "danger";
    if (daysToNearest <= 3) return "warning";
    return "safe";
  }, [submissions]);
  const groupedSubmissions = useMemo4(() => {
    const groups = {};
    const filtered = submissions.filter((s) => {
      if (activeTab === "history") {
        const isMatch = s.status === "completed" || s.isDeleted;
        if (!isMatch) return false;
        return subjectFilter ? s.subject === subjectFilter : true;
      }
      const isActive = !s.isDeleted && s.status !== "completed";
      if (!isActive) return false;
      return subjectFilter ? s.subject === subjectFilter : true;
    });
    filtered.forEach((s) => {
      if (!groups[s.subject]) groups[s.subject] = [];
      groups[s.subject].push(s);
    });
    return groups;
  }, [submissions, activeTab, subjectFilter]);
  const selectedSubmission = submissions.find((s) => s.id === selectedId);
  const recentActivities = useMemo4(() => {
    return submissions.flatMap((s) => (s.activityLogs || []).map((log) => ({ ...log, taskTitle: s.title }))).sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()).slice(0, 3);
  }, [submissions]);
  const renderTermsModal = () => /* @__PURE__ */ jsx(AnimatePresence, { children: showTermsModal && /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-[400] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md",
      children: /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { scale: 0.9, opacity: 0, y: 20 },
          animate: { scale: 1, opacity: 1, y: 0 },
          exit: { scale: 0.9, opacity: 0, y: 20 },
          className: "m3-card !bg-white w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden text-slate-900",
          children: [
            /* @__PURE__ */ jsx("div", { className: "p-4 sm:p-5 border-b border-slate-200 shrink-0 bg-slate-50", children: /* @__PURE__ */ jsxs("h2", { className: "text-lg font-black text-slate-900 flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(CheckSquare, { className: "w-5 h-5 text-[var(--m3-primary)]" }),
              language === "ja" ? "\u5229\u7528\u898F\u7D04" : "Terms of Service"
            ] }) }),
            /* @__PURE__ */ jsxs(
              "div",
              {
                onScroll: (e) => {
                  const target = e.currentTarget;
                  if (target.scrollHeight - target.scrollTop <= target.clientHeight + 20) {
                    setHasScrolledToBottom(true);
                  }
                },
                className: "flex-1 overflow-y-auto p-5 sm:p-8 scrollbar-custom space-y-6 text-slate-800",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                    /* @__PURE__ */ jsx("h3", { className: "text-lg font-black text-slate-900", children: TERMS_OF_SERVICE.title }),
                    /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold leading-relaxed whitespace-pre-wrap text-slate-700", children: TERMS_OF_SERVICE.intro })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                    /* @__PURE__ */ jsx("h3", { className: "text-base font-black flex items-center gap-2 text-slate-900", children: TERMS_OF_SERVICE.features.title }),
                    /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: TERMS_OF_SERVICE.features.items.map((item, idx) => /* @__PURE__ */ jsxs("li", { className: "flex gap-3 text-sm font-bold text-slate-700", children: [
                      /* @__PURE__ */ jsx("div", { className: "mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--m3-primary)] shrink-0" }),
                      item
                    ] }, idx)) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-6 pt-6 border-t border-slate-100", children: [
                    /* @__PURE__ */ jsx("h3", { className: "text-lg font-black text-slate-900", children: TERMS_OF_SERVICE.terms.title }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-slate-500 italic", children: TERMS_OF_SERVICE.terms.intro }),
                    TERMS_OF_SERVICE.terms.sections.map((section, idx) => /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                      /* @__PURE__ */ jsx("h4", { className: "text-sm font-black text-[var(--m3-primary)]", children: section.title }),
                      /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold leading-relaxed text-slate-700 whitespace-pre-wrap", children: section.content })
                    ] }, idx))
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "p-4 rounded-2xl bg-slate-50 border border-slate-200", children: /* @__PURE__ */ jsx("p", { className: "text-xs font-black leading-relaxed text-[var(--m3-primary)] text-center", children: TERMS_OF_SERVICE.terms.footer }) })
                ]
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "p-4 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-3 shrink-0", children: user ? /* @__PURE__ */ jsx("div", { className: "flex justify-end gap-3", children: /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  setShowTermsModal(false);
                },
                className: "px-6 py-3 rounded-2xl bg-[var(--m3-primary)] text-white font-bold transform active:scale-95 transition-all shadow-md",
                children: language === "ja" ? "\u9589\u3058\u308B" : "Close"
              }
            ) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    disabled: !hasScrolledToBottom,
                    onClick: () => setTempAccepted(!tempAccepted),
                    className: cn(
                      "flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-300",
                      !hasScrolledToBottom ? "opacity-30 grayscale cursor-not-allowed" : "hover:scale-105 active:scale-95"
                    ),
                    children: [
                      /* @__PURE__ */ jsx("div", { className: cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                        tempAccepted ? "bg-[var(--m3-primary)] border-[var(--m3-primary)]" : "border-slate-300"
                      ), children: tempAccepted && /* @__PURE__ */ jsx(X, { className: "w-4 h-4 text-white" }) }),
                      /* @__PURE__ */ jsx("span", { className: "text-sm font-black uppercase tracking-wider text-slate-700", children: language === "ja" ? "\u898F\u7D04\u306B\u540C\u610F\u3059\u308B" : "I agree to the terms" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex w-full gap-3", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => {
                        setShowTermsModal(false);
                        setTempAccepted(false);
                        setHasScrolledToBottom(false);
                      },
                      className: "flex-1 px-6 py-4 rounded-2xl bg-slate-200 text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-slate-300 transition-all",
                      children: t.cancel || "\u30AD\u30E3\u30F3\u30BB\u30EB"
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      disabled: !tempAccepted,
                      onClick: () => {
                        setIsTermsAccepted(true);
                        localStorage.setItem("app-terms-accepted", "true");
                        setShowTermsModal(false);
                        login();
                      },
                      className: cn(
                        "flex-[2] m3-button-primary !py-4",
                        !tempAccepted && "opacity-30 grayscale cursor-not-allowed"
                      ),
                      children: [
                        /* @__PURE__ */ jsx(LogIn, { className: "w-5 h-5" }),
                        language === "ja" ? "Google\u3067\u30ED\u30B0\u30A4\u30F3" : "Login with Google"
                      ]
                    }
                  )
                ] })
              ] }),
              !hasScrolledToBottom && /* @__PURE__ */ jsx("p", { className: "text-xs font-black text-center text-red-500 uppercase tracking-widest animate-pulse", children: language === "ja" ? "\u6700\u5F8C\u307E\u3067\u30B9\u30AF\u30ED\u30FC\u30EB\u3057\u3066\u540C\u610F\u3057\u3066\u304F\u3060\u3055\u3044" : "Please scroll to the bottom to agree" })
            ] }) })
          ]
        }
      )
    }
  ) });
  if (!isAuthReady) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-slate-50", children: /* @__PURE__ */ jsx(
      motion.div,
      {
        animate: { rotate: 360 },
        transition: { duration: 1, repeat: Infinity, ease: "linear" },
        className: "w-8 h-8 border-4 border-ios-blue border-t-transparent rounded-full"
      }
    ) });
  }
  if (!user) {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[var(--m3-surface)]", children: [
      /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          className: "max-w-md w-full m3-card text-center shadow-2xl overflow-hidden",
          children: /* @__PURE__ */ jsxs("div", { className: "p-10", children: [
            /* @__PURE__ */ jsx("div", { className: "w-20 h-20 bg-[var(--m3-primary-container)] rounded-[24px] flex items-center justify-center mx-auto mb-8 text-[var(--m3-on-primary-container)] rotate-3", children: /* @__PURE__ */ jsx(BookOpen, { className: "w-10 h-10" }) }),
            /* @__PURE__ */ jsx("h1", { className: "text-3xl font-black text-[var(--m3-on-surface)] mb-4 tracking-tight", children: t.appName }),
            /* @__PURE__ */ jsx("p", { className: "text-[var(--m3-on-surface-variant)] mb-10 leading-relaxed font-medium", children: language === "ja" ? /* @__PURE__ */ jsxs(Fragment, { children: [
              "\u63D0\u51FA\u7269\u3092\u7F8E\u3057\u304F\u7BA1\u7406\u3057\u307E\u3057\u3087\u3046\u3002",
              /* @__PURE__ */ jsx("br", {}),
              "Google\u30A2\u30AB\u30A6\u30F3\u30C8\u3067\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u958B\u59CB\u3057\u307E\u3059\u3002"
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              "Manage your assignments beautifully.",
              /* @__PURE__ */ jsx("br", {}),
              "Sign in with Google to get started."
            ] }) }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => {
                  if (isTermsAccepted) {
                    login();
                  } else {
                    setShowTermsModal(true);
                  }
                },
                className: "w-full m3-button-primary py-6",
                children: [
                  /* @__PURE__ */ jsx(LogIn, { className: "w-5 h-5" }),
                  language === "ja" ? "Google\u3067\u30ED\u30B0\u30A4\u30F3" : "Login with Google"
                ]
              }
            )
          ] })
        }
      ),
      renderTermsModal()
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "relative min-h-screen w-full overflow-hidden bg-[var(--m3-surface)] text-[var(--m3-on-surface)]", children: [
    /* @__PURE__ */ jsx(AnimatePresence, { children: showUpdateModal && /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md",
        children: /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { scale: 0.9, opacity: 0, y: 20 },
            animate: { scale: 1, opacity: 1, y: 0 },
            exit: { scale: 0.9, opacity: 0, y: 20 },
            className: "m3-card !bg-[var(--m3-surface-container-high)] w-full max-w-md p-8 shadow-2xl relative overflow-hidden",
            children: [
              /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 p-8 opacity-5", children: /* @__PURE__ */ jsx(Zap, { className: "w-32 h-32 text-[var(--m3-primary)]" }) }),
              /* @__PURE__ */ jsxs("div", { className: "relative space-y-6 text-left", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-2xl bg-[var(--m3-primary)]/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Zap, { className: "w-6 h-6 text-[var(--m3-primary)]" }) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("h2", { className: "text-xl font-black text-[var(--m3-on-surface)]", children: language === "ja" ? "\u30A2\u30C3\u30D7\u30C7\u30FC\u30C8\u306E\u304A\u77E5\u3089\u305B" : "Update Notice" }),
                    /* @__PURE__ */ jsxs("div", { className: "text-xs font-black text-[var(--m3-primary)] uppercase tracking-widest", children: [
                      "Version ",
                      APP_VERSION
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-2", children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-[var(--m3-on-surface-variant)] uppercase tracking-wider px-1", children: language === "ja" ? "\u4E3B\u306A\u5909\u66F4\u70B9" : "Latest Changes" }),
                  /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: [
                    {
                      ja: "12\u30A4\u30F3\u30C1HD\u89E3\u50CF\u5EA6\u30AF\u30ED\u30FC\u30E0\u30D6\u30C3\u30AF\u5411\u3051\u306B\u8868\u793A\u30B5\u30A4\u30BA\u3092\u6700\u9069\u5316",
                      en: "Optimized display scaling for 12-inch HD Chromebooks"
                    },
                    {
                      ja: "\u8996\u8A8D\u6027\u5411\u4E0A\u306E\u305F\u3081\u3001\u5168\u4F53\u7684\u306A\u30D5\u30A9\u30F3\u30C8\u30B5\u30A4\u30BA\u3092\u8ABF\u6574",
                      en: "Adjusted global font sizes for better legibility"
                    },
                    {
                      ja: "\u5229\u7528\u898F\u7D04\u30E2\u30FC\u30C0\u30EB\u306E\u8868\u793A\u9818\u57DF\u3092\u62E1\u5927",
                      en: "Expanded content area in the Terms of Service modal"
                    },
                    {
                      ja: "\u30C9\u30E9\u30C3\u30B0\uFF06\u30C9\u30ED\u30C3\u30D7\u306B\u3088\u308B\u6559\u79D1\u306E\u4E26\u3073\u66FF\u3048\u6A5F\u80FD\u3092\u6539\u5584",
                      en: "Improved subject reordering via drag & drop"
                    }
                  ].map((item, idx) => /* @__PURE__ */ jsxs(
                    motion.li,
                    {
                      initial: { x: -10, opacity: 0 },
                      animate: { x: 0, opacity: 1 },
                      transition: { delay: 0.1 * idx },
                      className: "flex items-start gap-3",
                      children: [
                        /* @__PURE__ */ jsx("div", { className: "mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--m3-primary)] shrink-0" }),
                        /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-[var(--m3-on-surface)] leading-relaxed", children: language === "ja" ? item.ja : item.en })
                      ]
                    },
                    idx
                  )) })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: closeUpdateModal,
                    className: "w-full m3-button-primary mt-4",
                    children: language === "ja" ? "\u78BA\u8A8D\u3057\u307E\u3057\u305F" : "Got it!"
                  }
                )
              ] })
            ]
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-[1440px] mx-auto h-screen flex flex-col p-3 sm:p-5 lg:p-6", children: [
      /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between mb-6 sm:mb-8", children: [
        /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 },
            transition: { duration: 0.4, ease: "easeOut" },
            children: [
              /* @__PURE__ */ jsx("h1", { className: "text-xl sm:text-2xl font-bold tracking-tight", children: t.appName }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--m3-on-surface-variant)] mt-0.5 font-medium", children: format(/* @__PURE__ */ new Date(), language === "ja" ? "M\u6708d\u65E5 (EEEE)" : "MMMM d (EEEE)", { locale: language === "ja" ? ja : void 0 }) })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, x: 20 },
            animate: { opacity: 1, x: 0 },
            transition: { duration: 0.4, ease: "easeOut" },
            className: "flex items-center gap-1 sm:gap-3",
            children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setIsSettingsOpen(true),
                  className: "p-3 rounded-full hover:bg-[var(--m3-surface-container)] text-[var(--m3-on-surface-variant)] transition-all active:scale-95",
                  title: t.settings,
                  children: /* @__PURE__ */ jsx(Settings, { className: "w-5 h-5 sm:w-6 sm:h-6" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: logout,
                  className: "p-3 rounded-full hover:bg-[var(--m3-error-container)]/50 text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-error)] transition-all active:scale-95",
                  title: t.logout,
                  children: /* @__PURE__ */ jsx(LogOut, { className: "w-5 h-5 sm:w-6 sm:h-6" })
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "w-10 h-10 sm:w-12 sm:h-12 rounded-full m3-card p-0 flex items-center justify-center overflow-hidden border-2 border-[var(--m3-primary)]/20 shadow-sm ml-2", children: user.photoURL ? /* @__PURE__ */ jsx("img", { src: user.photoURL, alt: user.displayName || "", className: "w-full h-full object-cover", referrerPolicy: "no-referrer" }) : /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-[var(--m3-primary-container)] flex items-center justify-center", children: /* @__PURE__ */ jsx(BookOpen, { className: "w-4 h-4 text-[var(--m3-on-primary-container)]" }) }) })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col lg:grid lg:grid-cols-[300px_1fr] gap-8 lg:gap-10 overflow-hidden", children: [
        /* @__PURE__ */ jsxs("aside", { className: "flex flex-row lg:flex-col gap-6 lg:gap-8 overflow-x-auto lg:overflow-y-auto pb-6 lg:pb-0 lg:pr-4 lg:border-r border-[var(--m3-outline-variant)]/40", children: [
          /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0, scale: 0.95 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 0.4, ease: "easeOut" },
              className: "segmented-control w-full min-w-[280px] lg:min-w-0",
              children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => {
                      setActiveTab("active");
                      setSubjectFilter(null);
                    },
                    className: cn(
                      "segmented-item",
                      activeTab === "active" ? "segmented-item-active" : "segmented-item-inactive"
                    ),
                    children: [
                      /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
                      t.active
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => {
                      setActiveTab("history");
                      setSubjectFilter(null);
                    },
                    className: cn(
                      "segmented-item",
                      activeTab === "history" ? "segmented-item-active" : "segmented-item-inactive"
                    ),
                    children: [
                      /* @__PURE__ */ jsx(BookOpen, { className: "w-4 h-4" }),
                      t.archive
                    ]
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "hidden lg:block h-px bg-[var(--m3-outline)]/20 my-2" }),
          /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.4, ease: "easeOut" },
              className: "bg-[var(--m3-primary-container)] rounded-[28px] p-6 w-full min-w-[180px] lg:min-w-0 shadow-sm shrink-0",
              children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs text-[var(--m3-on-primary-container)] opacity-70 uppercase tracking-[0.15em] font-black mb-1", children: t.progress }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1 text-[var(--m3-on-primary-container)]", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-4xl font-light tracking-tighter", children: overallProgress }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-bold opacity-70", children: "%" })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "h-2 w-full bg-[var(--m3-on-primary-container)]/10 rounded-full mt-4 overflow-hidden", children: /* @__PURE__ */ jsx(
                  motion.div,
                  {
                    initial: { width: 0 },
                    animate: { width: `${overallProgress}%` },
                    transition: { duration: 1, ease: [0.34, 1.56, 0.64, 1] },
                    className: "h-full bg-[var(--m3-primary)]"
                  }
                ) })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.1, duration: 0.4, ease: "easeOut" },
              className: "bg-[var(--m3-surface-container-high)] rounded-[28px] p-6 w-full min-w-[220px] lg:min-w-0 shadow-sm border border-[var(--m3-outline-variant)]/20 shrink-0",
              children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs text-[var(--m3-on-surface-variant)] uppercase tracking-wider font-black mb-2", children: t.upcoming }),
                /* @__PURE__ */ jsx("div", { className: "text-3xl lg:text-4xl font-light tracking-tighter text-[var(--m3-on-surface)]", children: nearestDeadlinesCount.toString().padStart(2, "0") }),
                /* @__PURE__ */ jsx("div", { className: "text-xs font-bold text-[var(--m3-on-surface-variant)] opacity-60 mt-1", children: language === "ja" ? "\u4ECA\u5F8C48\u6642\u9593\u4EE5\u5185" : "Within 48 hours" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.2, duration: 0.4, ease: "easeOut" },
              className: "m3-card w-full min-w-[220px] lg:min-w-0 shadow-none border border-[var(--m3-outline)]/10 hidden sm:flex flex-col shrink-0 mb-8",
              children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs text-[var(--m3-on-surface-variant)] uppercase tracking-wider font-bold mb-3", children: t.recentActivity }),
                /* @__PURE__ */ jsx("div", { className: "space-y-3", children: recentActivities.length > 0 ? recentActivities.map((log) => /* @__PURE__ */ jsxs("div", { className: "border-l-2 border-[var(--m3-primary)]/30 pl-2.5 py-0.5", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs font-bold text-[var(--m3-on-surface)] line-clamp-1", children: log.taskTitle }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mt-0.5", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-xs text-[var(--m3-on-surface-variant)] font-medium", children: formatDistanceToNow(log.timestamp.toDate(), { addSuffix: true, locale: language === "ja" ? ja : void 0 }) }),
                    /* @__PURE__ */ jsxs("span", { className: "text-xs text-[var(--m3-primary)] font-bold", children: [
                      "+",
                      log.progressIncrement,
                      log.type === "pages" ? "p" : "%"
                    ] })
                  ] })
                ] }, log.id)) : /* @__PURE__ */ jsx("div", { className: "text-xs text-[var(--m3-on-surface-variant)] italic", children: t.noActivity }) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("main", { className: "flex-1 overflow-y-auto pb-24 lg:pb-20 lg:pr-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-4 py-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 px-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setSubjectFilter(null),
                  className: cn(
                    "px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95",
                    subjectFilter === null ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-md" : "bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface-variant)] border border-[var(--m3-outline)]/10 hover:bg-[var(--m3-surface-container-highest)]"
                  ),
                  children: t.allSubjects
                }
              ),
              subjects.filter((subject) => submissions.some(
                (s) => s.subject === subject && (activeTab === "history" ? s.status === "completed" || s.isDeleted : !s.isDeleted && s.status !== "completed")
              )).map((subject) => /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setSubjectFilter(subjectFilter === subject ? null : subject),
                  className: cn(
                    "px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95",
                    subjectFilter === subject ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-md" : "bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface-variant)] border border-[var(--m3-outline)]/10 hover:bg-[var(--m3-surface-container-highest)]"
                  ),
                  children: subject
                },
                subject
              ))
            ] }),
            activeTab === "history" && /* @__PURE__ */ jsx("div", { className: "flex justify-end px-2 mt-2", children: /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setIsSelectionMode(!isSelectionMode),
                className: cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95",
                  isSelectionMode ? "bg-[var(--m3-primary)]/10 text-[var(--m3-primary)] border border-[var(--m3-primary)]/20" : "bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface-variant)] border border-[var(--m3-outline)]/10"
                ),
                children: [
                  isSelectionMode ? /* @__PURE__ */ jsx(X, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsx(Edit3, { className: "w-3.5 h-3.5" }),
                  isSelectionMode ? t.exitSelectionMode : t.selectionMode
                ]
              }
            ) })
          ] }),
          /* @__PURE__ */ jsx(AnimatePresence, { children: activeTab === "history" && isSelectionMode && /* @__PURE__ */ jsx(
            motion.div,
            {
              initial: { opacity: 0, height: 0, marginBottom: 0 },
              animate: { opacity: 1, height: "auto", marginBottom: 24 },
              exit: { opacity: 0, height: 0, marginBottom: 0 },
              className: "px-2",
              children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 shadow-sm", children: [
                /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-[var(--m3-on-surface)]", children: selectedArchiveIds.size > 0 ? `${selectedArchiveIds.size} selected` : language === "ja" ? "\u30BF\u30B9\u30AF\u3092\u9078\u629E" : "Select Tasks" }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => {
                        const visibleIds = Object.values(groupedSubmissions).flat().map((s) => s.id);
                        if (selectedArchiveIds.size === visibleIds.length && visibleIds.length > 0) {
                          setSelectedArchiveIds(/* @__PURE__ */ new Set());
                        } else {
                          setSelectedArchiveIds(new Set(visibleIds));
                        }
                      },
                      className: "m3-button-text h-10 px-4 text-xs",
                      children: (() => {
                        const visibleIds = Object.values(groupedSubmissions).flat().map((s) => s.id);
                        const isAllSelected = selectedArchiveIds.size === visibleIds.length && visibleIds.length > 0;
                        return isAllSelected ? t.deselectAll : t.selectAll;
                      })()
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => {
                        if (selectedArchiveIds.size === 0) return;
                        setConfirmDialog({
                          title: language === "ja" ? "\u4E00\u62EC\u524A\u9664" : "Bulk Delete",
                          message: t.confirmDeleteSelected,
                          onConfirm: async () => {
                            try {
                              const promises = Array.from(selectedArchiveIds).map((id) => deleteDoc(doc(db, "submissions", id)));
                              await Promise.all(promises);
                              setSelectedArchiveIds(/* @__PURE__ */ new Set());
                              setConfirmDialog(null);
                            } catch (error) {
                              console.error("Bulk delete failed", error);
                            }
                          },
                          onCancel: () => setConfirmDialog(null)
                        });
                      },
                      disabled: selectedArchiveIds.size === 0,
                      className: "m3-button-primary h-10 px-4 text-xs bg-[var(--m3-error)] hover:bg-[var(--m3-error)]/90 text-[var(--m3-on-error)] disabled:opacity-50 disabled:cursor-not-allowed",
                      children: [
                        /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5 mr-1" }),
                        t.deleteSelected
                      ]
                    }
                  )
                ] })
              ] })
            }
          ) }),
          /* @__PURE__ */ jsx(LayoutGroup, { children: /* @__PURE__ */ jsxs(
            motion.div,
            {
              layout: true,
              transition: {
                layout: { duration: 0.2, ease: "easeOut" },
                opacity: { duration: 0.2 }
              },
              className: "space-y-8",
              children: [
                /* @__PURE__ */ jsx(AnimatePresence, { mode: "popLayout", initial: false, children: Object.entries(groupedSubmissions).map(([subject, items]) => /* @__PURE__ */ jsxs(
                  motion.div,
                  {
                    layout: true,
                    transition: {
                      layout: { duration: 0.3, type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    },
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, scale: 0.95 },
                    className: "space-y-4",
                    children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-2 border-b border-[var(--m3-outline)]/10 pb-2", children: [
                        /* @__PURE__ */ jsx("div", { className: "w-1 h-4 bg-[var(--m3-primary)] rounded-full" }),
                        /* @__PURE__ */ jsx("h2", { className: "text-xl font-black text-[var(--m3-on-surface)] tracking-tight", children: subject }),
                        /* @__PURE__ */ jsx("span", { className: "text-xs font-black text-[var(--m3-on-surface-variant)] bg-[var(--m3-surface-container-high)] px-2 py-0.5 rounded-md ml-2", children: items.length })
                      ] }),
                      /* @__PURE__ */ jsx(
                        motion.div,
                        {
                          layout: true,
                          transition: { duration: 0.3, ease: "easeOut" },
                          className: cn(
                            "grid gap-4 sm:gap-6",
                            activeTab === "history" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                          ),
                          children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "popLayout", initial: false, children: items.sort((a, b) => {
                            if (activeTab === "history") {
                              const timeA = a.completedAt?.toMillis() || a.deletedAt?.toMillis() || 0;
                              const timeB = b.completedAt?.toMillis() || b.deletedAt?.toMillis() || 0;
                              return timeB - timeA;
                            }
                            return a.deadline.getTime() - b.deadline.getTime();
                          }).map((submission) => /* @__PURE__ */ jsx(
                            SubmissionCard,
                            {
                              submission,
                              isHistoryView: activeTab === "history",
                              language,
                              isSelectionMode,
                              isSelected: selectedArchiveIds.has(submission.id),
                              onToggleSelect: (e) => {
                                e.stopPropagation();
                                const newSet = new Set(selectedArchiveIds);
                                if (newSet.has(submission.id)) {
                                  newSet.delete(submission.id);
                                } else {
                                  newSet.add(submission.id);
                                }
                                setSelectedArchiveIds(newSet);
                              },
                              onClick: () => {
                                if (isSelectionMode) {
                                  const newSet = new Set(selectedArchiveIds);
                                  if (newSet.has(submission.id)) {
                                    newSet.delete(submission.id);
                                  } else {
                                    newSet.add(submission.id);
                                  }
                                  setSelectedArchiveIds(newSet);
                                } else {
                                  setSelectedId(submission.id);
                                }
                              },
                              onToggleComplete: (e) => toggleComplete(submission.id, e),
                              onDelete: (e) => {
                                e.stopPropagation();
                                if (activeTab === "history") {
                                  setConfirmDialog({
                                    title: language === "ja" ? "\u5B8C\u5168\u524A\u9664" : "Permanent Delete",
                                    message: language === "ja" ? "\u3053\u306E\u30BF\u30B9\u30AF\u3092\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u304B\u3089\u5B8C\u5168\u306B\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F" : "Delete this task permanently from the database?",
                                    onConfirm: async () => {
                                      try {
                                        await deleteDoc(doc(db, "submissions", submission.id));
                                        setConfirmDialog(null);
                                      } catch (error) {
                                        handleFirestoreError(error, "delete" /* DELETE */, `submissions/${submission.id}`);
                                      }
                                    },
                                    onCancel: () => setConfirmDialog(null)
                                  });
                                } else {
                                  setConfirmDialog({
                                    title: language === "ja" ? "\u30BF\u30B9\u30AF\u306E\u524A\u9664" : "Delete Task",
                                    message: language === "ja" ? "\u3053\u306E\u30BF\u30B9\u30AF\u3092\u975E\u8868\u793A\u306B\u3057\u307E\u3059\u304B\uFF1F(\u5C65\u6B74\u306B\u306F\u6B8B\u308A\u307E\u3059)" : "Hide this task? (It will remain in history)",
                                    onConfirm: async () => {
                                      try {
                                        await updateDoc(doc(db, "submissions", submission.id), {
                                          isDeleted: true,
                                          deletedAt: serverTimestamp()
                                        });
                                        setConfirmDialog(null);
                                      } catch (error) {
                                        handleFirestoreError(error, "update" /* UPDATE */, `submissions/${submission.id}`);
                                      }
                                    },
                                    onCancel: () => setConfirmDialog(null)
                                  });
                                }
                              }
                            },
                            submission.id
                          )) })
                        }
                      )
                    ]
                  },
                  subject
                )) }),
                submissions.length === 0 && /* @__PURE__ */ jsxs(
                  motion.div,
                  {
                    layout: true,
                    transition: { duration: 0.3, ease: "easeOut" },
                    initial: { opacity: 0 },
                    animate: { opacity: 0.4 },
                    className: "h-full flex flex-col items-center justify-center text-center py-20",
                    children: [
                      /* @__PURE__ */ jsx(BookOpen, { className: "w-16 h-16 mb-4" }),
                      /* @__PURE__ */ jsx("p", { className: "font-bold", children: t.noTasks })
                    ]
                  }
                )
              ]
            }
          ) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: isSettingsOpen && /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2, ease: "easeOut" },
        className: "fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm",
        children: /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0, scale: 0.9, y: 20 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.9, y: 20 },
            transition: { duration: 0.25, ease: "easeOut" },
            className: "m3-card relative w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col",
            children: /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-8 scrollbar-custom", children: [
              /* @__PURE__ */ jsx("button", { onClick: () => setIsSettingsOpen(false), className: "absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--m3-surface-container)] z-10", children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5 text-[var(--m3-on-surface-variant)]" }) }),
              /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-8", children: t.settings }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.2em] px-1", children: t.language }),
                  /* @__PURE__ */ jsxs("div", { className: "segmented-control", children: [
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => setLanguage("ja"),
                        className: cn("segmented-item", language === "ja" ? "segmented-item-active" : "segmented-item-inactive"),
                        children: "\u65E5\u672C\u8A9E"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => setLanguage("en"),
                        className: cn("segmented-item", language === "en" ? "segmented-item-active" : "segmented-item-inactive"),
                        children: "English"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.2em] px-1", children: t.theme }),
                  /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: [
                    /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: () => setTheme("light"),
                        className: cn("px-4 py-3 rounded-2xl flex items-center gap-3 font-bold text-sm transition-all border", theme === "light" ? "bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] border-[var(--m3-primary)]/20" : "bg-[var(--m3-surface-container)] text-[var(--m3-on-surface)] border-[var(--m3-outline)]/10 hover:bg-[var(--m3-surface-container-high)]"),
                        children: [
                          /* @__PURE__ */ jsx(Sun, { className: "w-4 h-4" }),
                          t.light
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: () => setTheme("dark"),
                        className: cn("px-4 py-3 rounded-2xl flex items-center gap-3 font-bold text-sm transition-all border", theme === "dark" ? "bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] border-[var(--m3-primary)]/20" : "bg-[var(--m3-surface-container)] text-[var(--m3-on-surface)] border-[var(--m3-outline)]/10 hover:bg-[var(--m3-surface-container-high)]"),
                        children: [
                          /* @__PURE__ */ jsx(Moon, { className: "w-4 h-4" }),
                          t.navy
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => setTheme("dog"),
                        className: cn("px-4 py-3 rounded-2xl flex items-center gap-3 font-bold text-sm transition-all border", theme === "dog" ? "bg-[#ebdabd] text-[#422810] border-[#8b5a2b]/30" : "bg-[var(--m3-surface-container)] text-[var(--m3-on-surface)] border-[var(--m3-outline)]/10 hover:bg-[var(--m3-surface-container-high)]"),
                        children: "\u{1F436} Dog"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => setTheme("cat"),
                        className: cn("px-4 py-3 rounded-2xl flex items-center gap-3 font-bold text-sm transition-all border", theme === "cat" ? "bg-[#ffd8df] text-[#3d0012] border-[#c26978]/30" : "bg-[var(--m3-surface-container)] text-[var(--m3-on-surface)] border-[var(--m3-outline)]/10 hover:bg-[var(--m3-surface-container-high)]"),
                        children: "\u{1F431} Cat"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => setTheme("animal"),
                        className: cn("px-4 py-3 rounded-2xl flex items-center gap-3 font-bold text-sm transition-all border", theme === "animal" ? "bg-[#ffdcbe] text-[#2b1400] border-[#b16300]/30" : "bg-[var(--m3-surface-container)] text-[var(--m3-on-surface)] border-[var(--m3-outline)]/10 hover:bg-[var(--m3-surface-container-high)]"),
                        children: "\u{1F981} Safari"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => setTheme("nature"),
                        className: cn("px-4 py-3 rounded-2xl flex items-center gap-3 font-bold text-sm transition-all border", theme === "nature" ? "bg-[#b8f29d] text-[#072100] border-[#386a24]/30" : "bg-[var(--m3-surface-container)] text-[var(--m3-on-surface)] border-[var(--m3-outline)]/10 hover:bg-[var(--m3-surface-container-high)]"),
                        children: "\u{1F33F} Nature"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-4 border-t border-[var(--m3-outline)]/10", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.2em] px-1", children: t.pomodoro }),
                  /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                    /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                      /* @__PURE__ */ jsxs("label", { className: "text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-widest", children: [
                        t.focusTime,
                        " (m)"
                      ] }),
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "number",
                          min: "1",
                          step: "1",
                          value: pomodoroDurations.work / 60,
                          onChange: (e) => {
                            const val = e.target.value;
                            if (/^\d+$/.test(val)) {
                              setPomodoroDurations((prev) => ({ ...prev, work: parseInt(val) * 60 }));
                            } else if (val === "") {
                              setPomodoroDurations((prev) => ({ ...prev, work: 0 }));
                            }
                          },
                          className: "w-full px-4 py-2 rounded-xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 text-sm font-bold text-[var(--m3-on-surface)] transition-all"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                      /* @__PURE__ */ jsxs("label", { className: "text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-widest", children: [
                        t.breakTime,
                        " (m)"
                      ] }),
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "number",
                          min: "1",
                          step: "1",
                          value: pomodoroDurations.break / 60,
                          onChange: (e) => {
                            const val = e.target.value;
                            if (/^\d+$/.test(val)) {
                              setPomodoroDurations((prev) => ({ ...prev, break: parseInt(val) * 60 }));
                            } else if (val === "") {
                              setPomodoroDurations((prev) => ({ ...prev, break: 0 }));
                            }
                          },
                          className: "w-full px-4 py-2 rounded-xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 text-sm font-bold text-[var(--m3-on-surface)] transition-all"
                        }
                      )
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-4 pt-4 border-t border-[var(--m3-outline)]/10", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-wider", children: t.editSubjects }),
                    /* @__PURE__ */ jsx("p", { className: "text-[10px] text-[var(--m3-on-surface-variant)] opacity-50 px-1", children: t.reorderInfo })
                  ] }),
                  /* @__PURE__ */ jsx(
                    DndContext,
                    {
                      sensors,
                      collisionDetection: closestCenter,
                      onDragEnd: handleDragEnd,
                      children: /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: /* @__PURE__ */ jsx(
                        SortableContext,
                        {
                          items: subjects,
                          strategy: verticalListSortingStrategy,
                          children: subjects.map((subject) => /* @__PURE__ */ jsx(
                            SortableSubjectItem,
                            {
                              subject,
                              t,
                              language,
                              onDelete: () => {
                                const msg = language === "ja" ? `${subject}${t.confirmDeleteSubject}` : `${t.confirmDeleteSubject}${subject}?`;
                                setConfirmDialog({
                                  title: t.editSubjects,
                                  message: msg,
                                  onConfirm: () => {
                                    setSubjects(subjects.filter((s) => s !== subject));
                                    setConfirmDialog(null);
                                  },
                                  onCancel: () => setConfirmDialog(null)
                                });
                              }
                            },
                            subject
                          ))
                        }
                      ) })
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        value: newSubject,
                        onChange: (e) => setNewSubject(e.target.value),
                        placeholder: t.newSubjectPlaceholder,
                        className: "flex-1 px-4 py-3 rounded-xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 text-sm font-medium text-[var(--m3-on-surface)] transition-all",
                        onKeyDown: (e) => {
                          if (e.key === "Enter" && newSubject.trim()) {
                            if (!subjects.includes(newSubject.trim())) {
                              setSubjects([...subjects, newSubject.trim()]);
                              setNewSubject("");
                            } else {
                              showToast(language === "ja" ? "\u305D\u306E\u6559\u79D1\u306F\u65E2\u306B\u5B58\u5728\u3057\u307E\u3059" : "Subject already exists");
                            }
                          }
                        }
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => {
                          if (newSubject.trim()) {
                            if (!subjects.includes(newSubject.trim())) {
                              setSubjects([...subjects, newSubject.trim()]);
                              setNewSubject("");
                            } else {
                              showToast(language === "ja" ? "\u305D\u306E\u6559\u79D1\u306F\u65E2\u306B\u5B58\u5728\u3057\u307E\u3059" : "Subject already exists");
                            }
                          }
                        },
                        className: "px-4 py-3 rounded-xl bg-[var(--m3-primary)] text-[var(--m3-on-primary)] font-bold text-xs",
                        children: t.addSubject
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "pt-6 border-t border-[var(--m3-outline)]/10 text-center", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.2em] mb-2", children: t.feedback }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--m3-on-surface-variant)]/60 font-medium mb-4", children: t.feedback_desc }),
                  /* @__PURE__ */ jsxs(
                    "a",
                    {
                      href: "https://docs.google.com/forms/d/e/1FAIpQLSdEbdto4RIERpgNP0MUlLceT1nSEL907bOIo3CNt2XMiLi51w/viewform?usp=publish-editor",
                      target: "_blank",
                      rel: "noopener noreferrer",
                      className: "inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md group",
                      children: [
                        /* @__PURE__ */ jsx(Zap, { className: "w-3 h-3 text-[var(--m3-primary)] group-hover:rotate-12 transition-transform" }),
                        t.send_feedback
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "pt-6 border-t border-[var(--m3-outline)]/10 text-center", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.2em] mb-2", children: t.license }),
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-[var(--m3-on-surface-variant)]/60 font-medium leading-relaxed", children: [
                    t.license_desc,
                    /* @__PURE__ */ jsx("br", {}),
                    "\xA9 2026 Lumina Project"
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => {
                        setIsSettingsOpen(false);
                        setShowTermsModal(true);
                      },
                      className: "mt-3 text-xs font-bold text-[var(--m3-primary)] hover:underline",
                      children: t.termsOfService
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "mt-4 text-[11px] font-mono text-[var(--m3-on-surface-variant)]/30", children: [
                    t.version,
                    " ",
                    APP_VERSION
                  ] })
                ] })
              ] })
            ] })
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: selectedId && selectedSubmission && /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2, ease: "easeOut" },
        className: "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6",
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              onClick: () => setSelectedId(null),
              className: "absolute inset-0 bg-black/20 backdrop-blur-md"
            }
          ),
          /* @__PURE__ */ jsx(
            motion.div,
            {
              layoutId: selectedId,
              transition: { layout: { duration: 0.3, type: "spring", stiffness: 300, damping: 30 } },
              className: "relative w-full max-w-lg m3-card !p-0 shadow-2xl border border-[var(--m3-outline)]/10 bg-[var(--m3-surface-container-high)] max-h-[90vh] overflow-hidden flex flex-col",
              children: /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-6 sm:p-10 scrollbar-custom", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx(motion.div, { layoutId: `subject-${selectedId}`, className: "text-sm font-bold uppercase tracking-widest text-[var(--m3-primary)]", children: selectedSubmission.subject }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: (e) => deleteSubmission(selectedSubmission.id, e),
                        className: "p-2 rounded-full hover:bg-[var(--m3-error)]/10 text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-error)] transition-colors",
                        title: t.delete,
                        children: /* @__PURE__ */ jsx(Trash2, { className: "w-5 h-5" })
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => setSelectedId(null),
                        className: "p-2 rounded-full hover:bg-[var(--m3-surface-container)] transition-colors",
                        children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5 text-[var(--m3-on-surface-variant)]" })
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsx(motion.h2, { layoutId: `title-${selectedId}`, className: "text-2xl font-bold text-[var(--m3-on-surface)] mb-6 leading-tight", children: selectedSubmission.title }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6 text-[var(--m3-on-surface-variant)]", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4" }),
                      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: format(selectedSubmission.deadline, language === "ja" ? "M/d HH:mm" : "MMM d, HH:mm") })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
                      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: isPast(selectedSubmission.deadline) ? t.overdue : t.daysLeft + ` ${differenceInDays(selectedSubmission.deadline, /* @__PURE__ */ new Date())}${t.days}` })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end mb-1 text-sm", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-[var(--m3-on-surface-variant)] font-black uppercase tracking-tighter opacity-70", children: t.progress }),
                      /* @__PURE__ */ jsxs("span", { className: "text-[var(--m3-on-surface)] font-light tracking-tighter", children: [
                        /* @__PURE__ */ jsx("span", { className: "text-2xl", children: selectedSubmission.taskType === "pages" ? selectedSubmission.currentPage : selectedSubmission.progress }),
                        /* @__PURE__ */ jsx("span", { className: "opacity-50 text-xs font-bold ml-0.5", children: selectedSubmission.taskType === "pages" ? `/ ${selectedSubmission.endPage}p` : `%` })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "h-2 w-full bg-[var(--m3-surface-variant)] rounded-full overflow-hidden shadow-inner", children: /* @__PURE__ */ jsx(
                      motion.div,
                      {
                        initial: { width: 0 },
                        animate: { width: `${selectedSubmission.progress}%` },
                        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                        className: "h-full bg-[var(--m3-primary)] shadow-sm"
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                    /* @__PURE__ */ jsx("h3", { className: "text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.2em]", children: t.recentActivity }),
                    /* @__PURE__ */ jsx("div", { className: "space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar", children: selectedSubmission.activityLogs.slice().reverse().map((log) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 bg-[var(--m3-surface-container-low)] p-3 rounded-2xl border border-[var(--m3-outline-variant)]/10", children: [
                      /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-[var(--m3-primary-container)] flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(Zap, { className: "w-3.5 h-3.5 text-[var(--m3-on-primary-container)]" }) }),
                      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                        /* @__PURE__ */ jsx("div", { className: "text-xs font-bold text-[var(--m3-on-surface-variant)] opacity-60", children: format(log.timestamp.toDate(), "M/d HH:mm") }),
                        /* @__PURE__ */ jsxs("div", { className: "text-sm font-black text-[var(--m3-on-surface)]", children: [
                          log.durationMinutes,
                          language === "ja" ? "\u5206\u9593\u306E\u30BB\u30C3\u30B7\u30E7\u30F3" : " min session"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxs("div", { className: "text-sm font-black text-[var(--m3-primary)]", children: [
                        "+",
                        log.progressIncrement,
                        log.type === "pages" ? "p" : "%"
                      ] }) })
                    ] }, log.id)) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                    /* @__PURE__ */ jsx("h3", { className: "text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-wider", children: t.details }),
                    /* @__PURE__ */ jsx("p", { className: "text-[var(--m3-on-surface-variant)] leading-relaxed text-sm font-medium whitespace-pre-wrap", children: selectedSubmission.description || (language === "ja" ? "\u8A73\u7D30\u60C5\u5831\u306F\u3042\u308A\u307E\u305B\u3093\u3002" : "No description provided.") })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2.5", children: [
                    selectedSubmission.status !== "completed" && !selectedSubmission.isDeleted && /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsxs(
                        "button",
                        {
                          onClick: () => setIsFocusSelectorOpen(true),
                          className: "w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-bold transition-all active:scale-[0.98] bg-transparent border border-[var(--m3-primary)]/20 text-[var(--m3-primary)] hover:bg-[var(--m3-primary)]/5",
                          children: [
                            /* @__PURE__ */ jsx(Zap, { className: "w-5 h-5" }),
                            t.startTimer
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxs(
                        "button",
                        {
                          onClick: () => {
                            setActiveTimerId(selectedSubmission.id);
                            setTimerSeconds(0);
                            setIsTimerRunning(false);
                            setIsTimerPaused(false);
                            setShowProgressInput(true);
                            setProgressInputValue("");
                            setSelectedId(null);
                          },
                          className: "w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-bold transition-all active:scale-[0.98] border-none bg-[var(--m3-primary)]/15 text-[var(--m3-primary)] hover:bg-[var(--m3-primary)]/25",
                          children: [
                            /* @__PURE__ */ jsx(CheckSquare, { className: "w-5 h-5" }),
                            t.progressUpdate
                          ]
                        }
                      )
                    ] }),
                    !selectedSubmission.isDeleted && /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: () => {
                          setEditData(selectedSubmission);
                          setModalPriority(selectedSubmission.priority);
                          setSelectedDate(selectedSubmission.deadline);
                          setIsCalendarOpen(false);
                          setIsEditing(true);
                          setSelectedId(null);
                        },
                        className: "w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-bold transition-all active:scale-[0.98] border-none bg-[var(--m3-primary)]/60 text-white hover:bg-[var(--m3-primary)]/70",
                        children: [
                          /* @__PURE__ */ jsx(Edit3, { className: "w-5 h-5" }),
                          t.editTask
                        ]
                      }
                    ),
                    selectedSubmission.status !== "completed" && !selectedSubmission.isDeleted && /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: (e) => {
                          toggleComplete(selectedSubmission.id, e);
                          setSelectedId(null);
                        },
                        className: "w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-bold transition-all active:scale-[0.98] border-none bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-md shadow-[var(--m3-primary)]/20 hover:shadow-lg hover:brightness-110",
                        children: [
                          /* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5" }),
                          t.complete
                        ]
                      }
                    )
                  ] })
                ] })
              ] })
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(
      motion.button,
      {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 },
        transition: { duration: 0.2, ease: "easeOut" },
        onClick: () => {
          setModalPriority("medium");
          setAddTaskType("percentage");
          setIsAdding(true);
        },
        className: "fixed bottom-6 right-6 sm:bottom-10 sm:right-10 w-14 h-14 sm:w-20 sm:h-20 bg-[#cdddf7] text-[#005696] rounded-full shadow-lg shadow-[#cdddf7]/50 flex items-center justify-center z-40 group hover:opacity-90 transition-all active:scale-95",
        children: /* @__PURE__ */ jsx(Plus, { className: "w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:rotate-90" })
      }
    ),
    /* @__PURE__ */ jsx(AnimatePresence, { children: isAdding && /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2, ease: "easeOut" },
        className: "fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6",
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              onClick: () => setIsAdding(false),
              className: "absolute inset-0 bg-black/10 backdrop-blur-sm"
            }
          ),
          /* @__PURE__ */ jsx(
            motion.div,
            {
              initial: { y: "100%", opacity: 0 },
              animate: { y: 0, opacity: 1 },
              exit: { y: "100%", opacity: 0 },
              transition: { duration: 0.2, ease: "easeOut" },
              className: "relative w-full max-w-lg m3-card rounded-t-[28px] sm:rounded-[28px] p-0 shadow-2xl border border-[var(--m3-outline)]/10 max-h-[90vh] overflow-hidden flex flex-col",
              children: /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-6 sm:p-10 scrollbar-custom", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-8 shrink-0", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-[var(--m3-on-surface)]", children: t.addNew }),
                  /* @__PURE__ */ jsx("button", { onClick: () => setIsAdding(false), className: "p-2 rounded-full hover:bg-[var(--m3-surface-container)]", children: /* @__PURE__ */ jsx(X, { className: "w-6 h-6 text-[var(--m3-on-surface-variant)]" }) })
                ] }),
                /* @__PURE__ */ jsxs("form", { onSubmit: addSubmission, className: "space-y-6", children: [
                  /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
                    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                      /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-widest px-1", children: t.title }),
                      /* @__PURE__ */ jsx("input", { name: "title", required: true, type: "text", placeholder: t.titlePlaceholder, className: "w-full px-5 py-4 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-bold text-[var(--m3-on-surface)] transition-all placeholder:font-medium" })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                      /* @__PURE__ */ jsx("label", { className: "text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-widest px-1", children: t.subject }),
                      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                        /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
                          /* @__PURE__ */ jsx(
                            "input",
                            {
                              name: "subject",
                              required: true,
                              type: "text",
                              value: modalSubject,
                              onChange: (e) => {
                                setModalSubject(e.target.value);
                                setIsSubjectDropdownOpen(true);
                              },
                              onFocus: () => setIsSubjectDropdownOpen(true),
                              onBlur: () => setTimeout(() => setIsSubjectDropdownOpen(false), 200),
                              placeholder: t.subjectPlaceholder,
                              className: "w-full px-5 py-4 pr-12 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-bold text-[var(--m3-on-surface)] transition-all placeholder:font-medium"
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            "button",
                            {
                              type: "button",
                              onClick: () => setIsSubjectDropdownOpen(!isSubjectDropdownOpen),
                              className: "absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--m3-surface-container-highest)] transition-colors",
                              children: /* @__PURE__ */ jsx(ChevronDown, { className: cn("w-5 h-5 text-[var(--m3-on-surface-variant)] transition-transform duration-200", isSubjectDropdownOpen && "rotate-180") })
                            }
                          ),
                          /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[var(--m3-primary)] group-focus-within:w-[80%] transition-all duration-300 rounded-full" })
                        ] }),
                        /* @__PURE__ */ jsx(AnimatePresence, { children: isSubjectDropdownOpen && /* @__PURE__ */ jsx(
                          motion.div,
                          {
                            initial: { opacity: 0, y: -10, scale: 0.95 },
                            animate: { opacity: 1, y: 4, scale: 1 },
                            exit: { opacity: 0, y: -10, scale: 0.95 },
                            className: "absolute z-50 left-0 right-0 top-full bg-[var(--m3-surface-container-high)] border border-[var(--m3-outline)]/10 rounded-2xl shadow-xl max-h-[60vh] sm:max-h-[400px] overflow-y-auto scrollbar-custom py-2",
                            children: subjects.map((s) => /* @__PURE__ */ jsx(
                              "button",
                              {
                                type: "button",
                                onClick: () => {
                                  setModalSubject(s);
                                  setIsSubjectDropdownOpen(false);
                                },
                                className: cn(
                                  "w-full text-left px-5 py-3 text-sm font-bold transition-colors hover:bg-[var(--m3-primary)]/10",
                                  modalSubject === s ? "text-[var(--m3-primary)] bg-[var(--m3-primary)]/5" : "text-[var(--m3-on-surface)]"
                                ),
                                children: s
                              },
                              s
                            ))
                          }
                        ) })
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-4 px-1", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.2em]", children: t.taskType }),
                    /* @__PURE__ */ jsxs("div", { className: "segmented-control", children: [
                      /* @__PURE__ */ jsxs(
                        "button",
                        {
                          type: "button",
                          onClick: () => setAddTaskType("percentage"),
                          className: cn(
                            "segmented-item",
                            addTaskType === "percentage" ? "segmented-item-active" : "segmented-item-inactive"
                          ),
                          children: [
                            /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
                            language === "ja" ? "\u901A\u5E38" : "Standard"
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxs(
                        "button",
                        {
                          type: "button",
                          onClick: () => setAddTaskType("pages"),
                          className: cn(
                            "segmented-item",
                            addTaskType === "pages" ? "segmented-item-active" : "segmented-item-inactive"
                          ),
                          children: [
                            /* @__PURE__ */ jsx(BookOpen, { className: "w-4 h-4" }),
                            language === "ja" ? "\u30DA\u30FC\u30B8\u6570" : "Pages"
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsx("input", { type: "hidden", name: "taskType", value: addTaskType })
                  ] }),
                  addTaskType === "pages" && /* @__PURE__ */ jsxs(
                    motion.div,
                    {
                      initial: { opacity: 0, height: 0 },
                      animate: { opacity: 1, height: "auto" },
                      transition: { duration: 0.3, ease: "easeOut" },
                      className: "grid grid-cols-2 gap-4 pt-2",
                      children: [
                        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase", children: t.startPage }),
                          /* @__PURE__ */ jsx("input", { name: "startPage", type: "number", min: "0", step: "1", placeholder: "0", className: "w-full px-4 py-3 rounded-xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 transition-all placeholder:font-medium" })
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase", children: t.endPage }),
                          /* @__PURE__ */ jsx("input", { name: "endPage", type: "number", min: "1", step: "1", placeholder: "100", className: "w-full px-4 py-3 rounded-xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 transition-all placeholder:font-medium" })
                        ] })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
                    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                      /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-widest px-1", children: t.deadline }),
                      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            name: "deadlineDate",
                            type: "date",
                            required: true,
                            defaultValue: selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"),
                            onChange: (e) => {
                              const val = e.target.value;
                              if (!val || val.length !== 10) return;
                              const [y, m, d] = val.split("-").map(Number);
                              if (isNaN(y) || isNaN(m) || isNaN(d) || y < 1e3 || y > 9999) return;
                              const date = new Date(selectedDate || /* @__PURE__ */ new Date());
                              date.setFullYear(y, m - 1, d);
                              if (!isNaN(date.getTime())) {
                                setSelectedDate(date);
                              }
                            },
                            className: "flex-1 px-5 py-4 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-bold text-[var(--m3-on-surface)] transition-all"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            name: "deadlineTime",
                            type: "time",
                            required: true,
                            defaultValue: "23:59",
                            className: "w-full sm:w-32 px-5 py-4 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-bold text-[var(--m3-on-surface)] transition-all"
                          }
                        )
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                      /* @__PURE__ */ jsx("label", { className: "text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-widest px-1", children: t.priority }),
                      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: ["low", "medium", "high"].map((p) => /* @__PURE__ */ jsxs(
                        "button",
                        {
                          type: "button",
                          onClick: () => setModalPriority(p),
                          className: cn(
                            "m3-chip flex-1 sm:flex-none justify-center py-4 sm:py-2",
                            modalPriority === p ? "m3-chip-selected" : "m3-chip-unselected"
                          ),
                          children: [
                            /* @__PURE__ */ jsx("div", { className: cn(
                              "w-2 h-2 rounded-full",
                              p === "high" ? "bg-red-500" : p === "medium" ? "bg-orange-500" : "bg-blue-500"
                            ) }),
                            /* @__PURE__ */ jsx("span", { className: "font-bold", children: t[p] })
                          ]
                        },
                        p
                      )) }),
                      /* @__PURE__ */ jsx("input", { type: "hidden", name: "priority", value: modalPriority })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.1em] px-1", children: t.details }),
                    /* @__PURE__ */ jsx("textarea", { name: "description", placeholder: t.descriptionPlaceholder, rows: 3, className: "w-full px-5 py-4 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-medium resize-none text-[var(--m3-on-surface)] transition-all" })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "submit",
                      className: "w-full m3-button-primary",
                      children: t.record
                    }
                  )
                ] })
              ] })
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: activeTimerId && /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3, ease: "easeOut" },
        className: "fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xl",
        children: /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { scale: 0.8, opacity: 0, y: 40 },
            animate: { scale: 1, opacity: 1, y: 0 },
            exit: { scale: 0.8, opacity: 0, y: 40 },
            transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
            className: "m3-card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-12 text-center space-y-8 sm:space-y-12 shadow-2xl relative",
            children: [
              /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 w-full h-1 bg-[var(--m3-primary)]/10", children: /* @__PURE__ */ jsx(
                motion.div,
                {
                  className: "h-full bg-[var(--m3-primary)]",
                  animate: {
                    width: timerMode === "stopwatch" ? `${timerSeconds % 60 * (100 / 60)}%` : `${timerSeconds / (pomodoroPhase === "work" ? pomodoroDurations.work : pomodoroDurations.break) * 100}%`
                  },
                  transition: { duration: 1, ease: "linear" }
                }
              ) }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2 sm:space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2", children: [
                  timerMode === "pomodoro" && /* @__PURE__ */ jsxs(
                    motion.div,
                    {
                      layoutId: "pomodoro-badge",
                      className: cn(
                        "px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5",
                        pomodoroPhase === "work" ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)]" : "bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)]"
                      ),
                      children: [
                        pomodoroPhase === "work" ? /* @__PURE__ */ jsx(Brain, { className: "w-3 h-3" }) : /* @__PURE__ */ jsx(Coffee, { className: "w-3 h-3" }),
                        pomodoroPhase === "work" ? t.workPhase : t.breakPhase
                      ]
                    }
                  ),
                  pomodoroSessionCount > 0 && /* @__PURE__ */ jsxs("div", { className: "px-3 py-1 rounded-full bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface-variant)] text-xs font-black uppercase tracking-widest", children: [
                    t.sessions,
                    ": ",
                    pomodoroSessionCount
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-0.5 sm:space-y-1", children: [
                  /* @__PURE__ */ jsx(
                    motion.h2,
                    {
                      initial: { opacity: 0 },
                      animate: { opacity: 1 },
                      className: "text-lg sm:text-2xl font-black text-[var(--m3-on-surface)] tracking-tight line-clamp-2",
                      children: submissions.find((s) => s.id === activeTimerId)?.title
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "text-xs font-black text-[var(--m3-primary)] uppercase tracking-[0.2em]", children: submissions.find((s) => s.id === activeTimerId)?.subject })
                ] })
              ] }),
              !showProgressInput ? /* @__PURE__ */ jsxs("div", { className: "space-y-12", children: [
                /* @__PURE__ */ jsxs("div", { className: "relative w-48 h-48 sm:w-64 sm:h-64 mx-auto scale-90 sm:scale-100", children: [
                  /* @__PURE__ */ jsx("div", { className: "absolute inset-0 rounded-full border-[6px] border-[var(--m3-outline-variant)]/20 shadow-inner" }),
                  [...Array(60)].map((_, i) => /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: cn(
                        "absolute top-0 left-1/2 -translate-x-1/2 h-full w-0.5 origin-bottom",
                        i % 5 === 0 ? "h-4 w-1 bg-[var(--m3-on-surface-variant)]" : "h-2 w-0.5 bg-[var(--m3-outline-variant)]"
                      ),
                      style: { transform: `rotate(${i * 6}deg) translateY(6px)` }
                    },
                    i
                  )),
                  [0, 15, 30, 45].map((val) => /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "absolute w-8 h-8 flex items-center justify-center text-xs font-black text-[var(--m3-on-surface-variant)] opacity-40",
                      style: {
                        top: val === 0 ? "25px" : val === 30 ? "auto" : "50%",
                        bottom: val === 30 ? "25px" : "auto",
                        left: val === 45 ? "25px" : val === 15 ? "auto" : "50%",
                        right: val === 15 ? "25px" : "auto",
                        transform: val === 15 || val === 45 ? "translateY(-50%)" : "translateX(-50%)"
                      },
                      children: val === 0 ? "60" : val
                    },
                    val
                  )),
                  /* @__PURE__ */ jsx(
                    motion.div,
                    {
                      className: "absolute top-12 bottom-1/2 left-1/2 w-1.5 -translate-x-1/2 bg-[var(--m3-on-surface-variant)]/30 rounded-full origin-bottom",
                      animate: { rotate: timerSeconds / 60 % 60 * 6 },
                      transition: { duration: 0.5, ease: "circOut" }
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    motion.div,
                    {
                      className: "absolute top-6 bottom-1/2 left-1/2 w-1 -translate-x-1/2 bg-[var(--m3-primary)] rounded-full origin-bottom shadow-sm",
                      animate: {
                        rotate: timerMode === "stopwatch" ? timerSeconds % 60 * 6 : (() => {
                          const totalPhaseSeconds = pomodoroPhase === "work" ? pomodoroDurations.work : pomodoroDurations.break;
                          const elapsed = totalPhaseSeconds - timerSeconds;
                          return elapsed % 60 * 6;
                        })()
                      },
                      transition: { duration: 0.1, ease: "linear" },
                      children: /* @__PURE__ */ jsx("div", { className: "absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--m3-primary)]" })
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-[var(--m3-surface-container-high)] rounded-full border-4 border-[var(--m3-primary)] shadow-md z-10" }),
                  showDigitalTimer && /* @__PURE__ */ jsxs("div", { className: "absolute top-[65%] left-1/2 -translate-x-1/2 flex flex-col items-center", children: [
                    /* @__PURE__ */ jsxs("div", { className: "text-3xl sm:text-4xl font-black font-mono tracking-tighter text-[var(--m3-on-surface)]", children: [
                      Math.floor(timerSeconds / 60).toString().padStart(2, "0"),
                      ":",
                      (timerSeconds % 60).toString().padStart(2, "0")
                    ] }),
                    (isTimerPaused || !isTimerRunning) && /* @__PURE__ */ jsx("div", { className: "text-xs font-black text-[var(--m3-error)] uppercase tracking-widest mt-1 animate-pulse", children: !isTimerRunning ? language === "ja" ? "\u7D42\u4E86/\u5F85\u6A5F\u4E2D" : "IDLE/BREAK" : t.pause })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4", children: [
                  timerMode === "pomodoro" && /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => setShowDigitalTimer(!showDigitalTimer),
                      className: "text-xs font-black uppercase tracking-widest text-[var(--m3-primary)] hover:opacity-80 transition-opacity flex items-center gap-2 mb-2",
                      children: [
                        showDigitalTimer ? /* @__PURE__ */ jsx(EyeOff, { className: "w-3 h-3" }) : /* @__PURE__ */ jsx(Eye, { className: "w-3 h-3" }),
                        t.toggleDigitalTimer
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-10", children: [
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => {
                          if (!isTimerRunning) {
                            setIsTimerRunning(true);
                            setIsTimerPaused(false);
                          } else {
                            togglePause();
                          }
                        },
                        className: cn(
                          "w-14 h-14 sm:w-16 sm:h-16 rounded-3xl flex items-center justify-center shadow-lg active:scale-95 transition-all duration-300",
                          !isTimerRunning || isTimerPaused ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)]" : "bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface)]"
                        ),
                        children: !isTimerRunning || isTimerPaused ? /* @__PURE__ */ jsx(Play, { className: "w-7 h-7 sm:w-8 sm:h-8 fill-current" }) : /* @__PURE__ */ jsx(Pause, { className: "w-7 h-7 sm:w-8 sm:h-8 fill-current" })
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: stopTimer,
                        className: "w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[var(--m3-error-container)] text-[var(--m3-on-error-container)] flex items-center justify-center shadow-xl active:scale-90 hover:bg-[var(--m3-error)] hover:text-[var(--m3-on-error)] transition-all duration-300 group",
                        children: /* @__PURE__ */ jsx(Square, { className: "w-7 h-7 sm:w-8 sm:h-8 fill-current group-hover:scale-110 transition-transform" })
                      }
                    )
                  ] })
                ] }),
                timerMode === "pomodoro" && /* @__PURE__ */ jsxs(
                  motion.button,
                  {
                    initial: { opacity: 0, y: 10 },
                    animate: { opacity: 1, y: 0 },
                    onClick: handlePomodoroPhaseComplete,
                    className: "w-full m3-button-outline",
                    children: [
                      /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5" }),
                      language === "ja" ? "\u6B21\u306E\u30D5\u30A7\u30FC\u30BA\u3078" : "Skip Phase"
                    ]
                  }
                )
              ] }) : /* @__PURE__ */ jsxs(
                motion.div,
                {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.4, ease: "easeOut" },
                  className: "space-y-6",
                  children: [
                    /* @__PURE__ */ jsx("h3", { className: "font-bold text-[var(--m3-on-surface)]", children: submissions.find((s) => s.id === activeTimerId)?.taskType === "pages" ? language === "ja" ? "\u4F55\u30DA\u30FC\u30B8\u9032\u307F\u307E\u3057\u305F\u304B\uFF1F" : "How many pages completed?" : language === "ja" ? "\u4F55\uFF05\u9032\u307F\u307E\u3057\u305F\u304B\uFF1F" : "What percentage achieved?" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "number",
                        autoFocus: true,
                        min: "1",
                        step: "1",
                        max: submissions.find((s) => s.id === activeTimerId)?.taskType === "pages" ? "999" : "100",
                        value: progressInputValue,
                        onChange: (e) => setProgressInputValue(e.target.value),
                        placeholder: "0",
                        className: "w-full text-4xl sm:text-6xl font-black text-center border-none rounded-2xl bg-[var(--m3-surface-container)] py-8 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 text-[var(--m3-on-surface)] transition-all placeholder-[var(--m3-on-surface-variant)]/30",
                        onKeyDown: (e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveActivity(parseInt(progressInputValue) || 0);
                          }
                        }
                      }
                    ),
                    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase", children: [
                        /* @__PURE__ */ jsxs("span", { children: [
                          t.currentProgress,
                          ": ",
                          submissions.find((s) => s.id === activeTimerId)?.progress,
                          "%"
                        ] }),
                        previewProgress !== null && /* @__PURE__ */ jsxs("span", { className: "text-[var(--m3-primary)]", children: [
                          t.afterUpdate,
                          ": ",
                          previewProgress,
                          "%"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "h-2 w-full bg-[var(--m3-surface-variant)] rounded-full overflow-hidden relative", children: [
                        /* @__PURE__ */ jsx(
                          "div",
                          {
                            className: "absolute inset-0 bg-[var(--m3-primary)]/20",
                            style: { width: `${submissions.find((s) => s.id === activeTimerId)?.progress}%` }
                          }
                        ),
                        previewProgress !== null && /* @__PURE__ */ jsx(
                          motion.div,
                          {
                            initial: { width: `${submissions.find((s) => s.id === activeTimerId)?.progress}%` },
                            animate: { width: `${previewProgress}%` },
                            transition: { duration: 0.5, ease: "easeOut" },
                            className: "absolute inset-0 bg-[var(--m3-primary)]"
                          }
                        )
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: () => {
                            setActiveTimerId(null);
                            setShowProgressInput(false);
                          },
                          className: "flex-1 m3-button-outline",
                          children: language === "ja" ? "\u7834\u68C4" : "Discard"
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: () => saveActivity(parseInt(progressInputValue) || 0),
                          className: "flex-[2] m3-button-primary",
                          children: t.record
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--m3-on-surface-variant)]", children: language === "ja" ? "\u6570\u5024\u3092\u5165\u529B\u3057\u3066Enter\u30AD\u30FC\u307E\u305F\u306F\u30DC\u30BF\u30F3\u3067\u4FDD\u5B58" : "Enter number and hit Record or Enter" })
                  ]
                }
              )
            ]
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: isEditing && editData && /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2, ease: "easeOut" },
        className: "fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6",
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              onClick: () => {
                setIsEditing(false);
                setEditData(null);
              },
              className: "absolute inset-0 bg-black/10 backdrop-blur-sm"
            }
          ),
          /* @__PURE__ */ jsx(
            motion.div,
            {
              initial: { y: "100%", opacity: 0 },
              animate: { y: 0, opacity: 1 },
              exit: { y: "100%", opacity: 0 },
              transition: { duration: 0.2, ease: "easeOut" },
              className: "relative w-full max-w-lg m3-card rounded-t-[28px] sm:rounded-[28px] p-0 shadow-2xl border border-[var(--m3-outline)]/10 max-h-[90vh] overflow-hidden flex flex-col",
              children: /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-6 sm:p-10 scrollbar-custom", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-8 shrink-0", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-[var(--m3-on-surface)]", children: t.editTask }),
                  /* @__PURE__ */ jsx("button", { onClick: () => {
                    setIsEditing(false);
                    setEditData(null);
                  }, className: "p-2 rounded-full hover:bg-[var(--m3-surface-container)] text-[var(--m3-on-surface-variant)]", children: /* @__PURE__ */ jsx(X, { className: "w-6 h-6" }) })
                ] }),
                /* @__PURE__ */ jsxs("form", { onSubmit: updateSubmission, className: "space-y-6", children: [
                  /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
                    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                      /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-widest px-1", children: t.title }),
                      /* @__PURE__ */ jsx("input", { name: "title", defaultValue: editData.title, required: true, type: "text", className: "w-full px-5 py-4 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-bold text-[var(--m3-on-surface)] transition-all placeholder:font-medium" })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                      /* @__PURE__ */ jsx("label", { className: "text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-widest px-1", children: t.subject }),
                      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                        /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
                          /* @__PURE__ */ jsx(
                            "input",
                            {
                              name: "subject",
                              value: modalSubject,
                              onChange: (e) => {
                                setModalSubject(e.target.value);
                                setIsSubjectDropdownOpen(true);
                              },
                              onFocus: () => setIsSubjectDropdownOpen(true),
                              onBlur: () => setTimeout(() => setIsSubjectDropdownOpen(false), 200),
                              required: true,
                              type: "text",
                              className: "w-full px-5 py-4 pr-12 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-bold text-[var(--m3-on-surface)] transition-all placeholder:font-medium"
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            "button",
                            {
                              type: "button",
                              onClick: () => setIsSubjectDropdownOpen(!isSubjectDropdownOpen),
                              className: "absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--m3-surface-container-highest)] transition-colors",
                              children: /* @__PURE__ */ jsx(ChevronDown, { className: cn("w-5 h-5 text-[var(--m3-on-surface-variant)] transition-transform duration-200", isSubjectDropdownOpen && "rotate-180") })
                            }
                          ),
                          /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[var(--m3-primary)] group-focus-within:w-[80%] transition-all duration-300 rounded-full" })
                        ] }),
                        /* @__PURE__ */ jsx(AnimatePresence, { children: isSubjectDropdownOpen && /* @__PURE__ */ jsx(
                          motion.div,
                          {
                            initial: { opacity: 0, y: -10, scale: 0.95 },
                            animate: { opacity: 1, y: 4, scale: 1 },
                            exit: { opacity: 0, y: -10, scale: 0.95 },
                            className: "absolute z-50 left-0 right-0 top-full bg-[var(--m3-surface-container-high)] border border-[var(--m3-outline)]/10 rounded-2xl shadow-xl max-h-[60vh] sm:max-h-[400px] overflow-y-auto scrollbar-custom py-2",
                            children: subjects.map((s) => /* @__PURE__ */ jsx(
                              "button",
                              {
                                type: "button",
                                onClick: () => {
                                  setModalSubject(s);
                                  setIsSubjectDropdownOpen(false);
                                },
                                className: cn(
                                  "w-full text-left px-5 py-3 text-sm font-bold transition-colors hover:bg-[var(--m3-primary)]/10",
                                  modalSubject === s ? "text-[var(--m3-primary)] bg-[var(--m3-primary)]/5" : "text-[var(--m3-on-surface)]"
                                ),
                                children: s
                              },
                              s
                            ))
                          }
                        ) })
                      ] })
                    ] })
                  ] }),
                  editData?.taskType === "pages" && /* @__PURE__ */ jsxs(
                    motion.div,
                    {
                      initial: { opacity: 0, height: 0 },
                      animate: { opacity: 1, height: "auto" },
                      transition: { duration: 0.3, ease: "easeOut" },
                      className: "grid grid-cols-2 gap-4 pb-2",
                      children: [
                        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase", children: t.startPage }),
                          /* @__PURE__ */ jsx("input", { name: "startPage", type: "number", min: "0", step: "1", defaultValue: editData.startPage, placeholder: "0", className: "w-full px-4 py-3 rounded-xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 transition-all placeholder:font-medium" })
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase", children: t.endPage }),
                          /* @__PURE__ */ jsx("input", { name: "endPage", type: "number", min: "1", step: "1", defaultValue: editData.endPage, placeholder: "100", className: "w-full px-4 py-3 rounded-xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 transition-all placeholder:font-medium" })
                        ] })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
                    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                      /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-widest px-1", children: t.deadline }),
                      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            name: "deadlineDate",
                            type: "date",
                            required: true,
                            defaultValue: selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"),
                            onChange: (e) => {
                              const val = e.target.value;
                              if (!val || val.length !== 10) return;
                              const [y, m, d] = val.split("-").map(Number);
                              if (isNaN(y) || isNaN(m) || isNaN(d) || y < 1e3 || y > 9999) return;
                              const date = new Date(selectedDate || /* @__PURE__ */ new Date());
                              date.setFullYear(y, m - 1, d);
                              if (!isNaN(date.getTime())) {
                                setSelectedDate(date);
                              }
                            },
                            className: "flex-1 px-5 py-4 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-bold text-[var(--m3-on-surface)] transition-all"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            name: "deadlineTime",
                            type: "time",
                            required: true,
                            defaultValue: editData.deadline ? format(editData.deadline, "HH:mm") : "23:59",
                            className: "w-full sm:w-32 px-5 py-4 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-bold text-[var(--m3-on-surface)] transition-all"
                          }
                        )
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                      /* @__PURE__ */ jsx("label", { className: "text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-widest px-1", children: t.priority }),
                      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: ["low", "medium", "high"].map((p) => /* @__PURE__ */ jsxs(
                        "button",
                        {
                          type: "button",
                          onClick: () => setModalPriority(p),
                          className: cn(
                            "m3-chip flex-1 sm:flex-none justify-center py-4 sm:py-2",
                            modalPriority === p ? "m3-chip-selected" : "m3-chip-unselected"
                          ),
                          children: [
                            /* @__PURE__ */ jsx("div", { className: cn(
                              "w-2 h-2 rounded-full",
                              p === "high" ? "bg-red-500" : p === "medium" ? "bg-orange-500" : "bg-blue-500"
                            ) }),
                            /* @__PURE__ */ jsx("span", { className: "font-bold", children: t[p] })
                          ]
                        },
                        p
                      )) }),
                      /* @__PURE__ */ jsx("input", { type: "hidden", name: "priority", value: modalPriority })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.1em] px-1", children: t.details }),
                    /* @__PURE__ */ jsx("textarea", { name: "description", defaultValue: editData.description, rows: 3, className: "w-full px-5 py-4 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-medium resize-none text-[var(--m3-on-surface)] transition-all" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => {
                          setConfirmDialog({
                            title: language === "ja" ? "\u6C38\u4E45\u524A\u9664" : "Permanent Delete",
                            message: t.confirmPermanentDelete,
                            onConfirm: async () => {
                              try {
                                await deleteDoc(doc(db, "submissions", editData.id));
                                setIsEditing(false);
                                setEditData(null);
                                setConfirmDialog(null);
                                showToast(language === "ja" ? "\u524A\u9664\u3055\u308C\u307E\u3057\u305F" : "Task deleted");
                              } catch (error) {
                                handleFirestoreError(error, "delete" /* DELETE */, `submissions/${editData.id}`);
                              }
                            },
                            onCancel: () => setConfirmDialog(null)
                          });
                        },
                        className: "flex-1 m3-button-error",
                        children: t.delete
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "submit",
                        className: "flex-[2] m3-button-primary",
                        children: t.save
                      }
                    )
                  ] })
                ] })
              ] })
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: toastMessage && /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 50, scale: 0.9 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 20, scale: 0.9 },
        className: "fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] pointer-events-none",
        children: /* @__PURE__ */ jsxs("div", { className: "bg-[var(--m3-primary)] text-[var(--m3-on-primary)] px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 font-black text-sm tracking-widest uppercase", children: [
          /* @__PURE__ */ jsx(CheckCircle2, { className: "w-6 h-6" }),
          toastMessage
        ] })
      }
    ) }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: isFocusSelectorOpen && selectedSubmission && /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm",
        children: /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { y: 20, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            exit: { y: 20, opacity: 0 },
            className: "m3-card max-w-sm w-full p-6 space-y-6",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-lg font-black tracking-tight", children: t.focusMode }),
                /* @__PURE__ */ jsx("button", { onClick: () => setIsFocusSelectorOpen(false), className: "p-2 rounded-full hover:bg-[var(--m3-surface-container)]", children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3", children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => {
                      startTimer(selectedSubmission.id, "stopwatch");
                      setIsFocusSelectorOpen(false);
                    },
                    className: "w-full p-6 rounded-3xl bg-[var(--m3-surface-container-high)] border border-[var(--m3-outline)]/10 hover:border-[var(--m3-primary)] transition-all text-left flex items-center gap-4 group",
                    children: [
                      /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-2xl bg-[var(--m3-primary)]/10 flex items-center justify-center text-[var(--m3-primary)] group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsx(Clock, { className: "w-6 h-6" }) }),
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("div", { className: "font-bold text-[var(--m3-on-surface)]", children: t.focusModeStopwatch }),
                        /* @__PURE__ */ jsx("div", { className: "text-xs text-[var(--m3-on-surface-variant)]", children: t.focusModeDescStopwatch })
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => {
                      startTimer(selectedSubmission.id, "pomodoro");
                      setIsFocusSelectorOpen(false);
                    },
                    className: "w-full p-6 rounded-3xl bg-[var(--m3-surface-container-high)] border border-[var(--m3-outline)]/10 hover:border-[var(--m3-primary)] transition-all text-left flex items-center gap-4 group",
                    children: [
                      /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-2xl bg-[var(--m3-secondary-container)] flex items-center justify-center text-[var(--m3-on-secondary-container)] group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsx(Zap, { className: "w-6 h-6" }) }),
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("div", { className: "font-bold text-[var(--m3-on-surface)]", children: t.focusModePomodoro }),
                        /* @__PURE__ */ jsx("div", { className: "text-xs text-[var(--m3-on-surface-variant)]", children: t.focusModeDescPomodoro })
                      ] })
                    ]
                  }
                )
              ] })
            ]
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: confirmDialog && /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm",
        children: /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { scale: 0.9, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            exit: { scale: 0.9, opacity: 0 },
            className: "m3-card max-w-sm w-full p-8 space-y-6",
            children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold", children: confirmDialog.title }),
              /* @__PURE__ */ jsx("p", { className: "text-[var(--m3-on-surface-variant)] leading-relaxed", children: confirmDialog.message }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => {
                      confirmDialog.onCancel?.();
                      setConfirmDialog(null);
                    },
                    className: "m3-button-text",
                    children: confirmDialog.cancelLabel || t.cancel
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => {
                      confirmDialog.onConfirm();
                    },
                    className: "m3-button-primary",
                    children: confirmDialog.confirmLabel || (language === "ja" ? "\u306F\u3044" : "Confirm")
                  }
                )
              ] })
            ]
          }
        )
      }
    ) }),
    renderTermsModal(),
    /* @__PURE__ */ jsx(AnimatePresence, { children: showUpdateNotice && /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md",
        children: /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { scale: 0.9, opacity: 0, y: 20 },
            animate: { scale: 1, opacity: 1, y: 0 },
            exit: { scale: 0.9, opacity: 0, y: 20 },
            className: "m3-card !bg-white w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden text-slate-900",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-5 border-b border-slate-200 shrink-0 bg-slate-50 flex justify-between items-center", children: [
                /* @__PURE__ */ jsxs("h2", { className: "text-lg font-black text-slate-900 flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx(Zap, { className: "w-5 h-5 text-[var(--m3-primary)]" }),
                  RELEASE_NOTES.title
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs font-bold bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md", children: [
                  "v",
                  RELEASE_NOTES.version
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto p-5 sm:p-8 scrollbar-custom space-y-6 text-slate-800", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-base font-black flex items-center gap-2 text-slate-900", children: RELEASE_NOTES.features.title }),
                /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: RELEASE_NOTES.features.items.map((item, index) => /* @__PURE__ */ jsxs("li", { className: "flex gap-3 text-sm font-bold text-slate-700", children: [
                  /* @__PURE__ */ jsx("div", { className: "mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--m3-primary)] shrink-0" }),
                  item
                ] }, index)) })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "p-4 sm:p-5 border-t border-slate-200 flex justify-end gap-3 bg-slate-50", children: /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => {
                    localStorage.setItem("app-last-version", APP_VERSION);
                    setShowUpdateNotice(false);
                  },
                  className: "px-6 py-2.5 rounded-xl bg-[var(--m3-primary)] text-white font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[var(--m3-primary)]/20",
                  children: "\u78BA\u8A8D\u3057\u307E\u3057\u305F"
                }
              ) })
            ]
          }
        )
      }
    ) })
  ] });
}
function SubmissionCard({
  submission,
  onClick,
  onToggleComplete,
  onDelete,
  isHistoryView,
  language = "ja",
  isSelectionMode,
  isSelected,
  onToggleSelect
}) {
  const t = translations[language];
  const daysLeft = differenceInDays(submission.deadline, /* @__PURE__ */ new Date());
  const isOverdue = isPast(submission.deadline) && submission.status !== "completed";
  const showCompact = isHistoryView || submission.isDeleted;
  const urgencyStyles = useMemo4(() => {
    if (submission.isDeleted) return { tag: "bg-[var(--m3-surface-variant)] text-[var(--m3-on-surface-variant)]", label: t.urgency_archive };
    if (submission.status === "completed") return { tag: "bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)]", label: t.urgency_completed };
    if (daysLeft <= 0) return { tag: "bg-[var(--m3-error-container)] text-[var(--m3-on-error-container)]", label: t.urgency_urgent };
    if (daysLeft <= 3) return { tag: "bg-[var(--m3-tertiary-container)] text-[var(--m3-on-tertiary-container)]", label: language === "ja" ? "\u9593\u8FD1" : "Soon" };
    return { tag: "bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)]", label: t.urgency_normal };
  }, [daysLeft, submission.status, submission.priority, submission.isDeleted, t]);
  if (showCompact) {
    return /* @__PURE__ */ jsxs(
      motion.div,
      {
        layout: true,
        layoutId: submission.id,
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
        transition: {
          layout: { duration: 0.2, ease: "easeOut" },
          opacity: { duration: 0.2 },
          scale: { duration: 0.2 }
        },
        onClick,
        whileTap: { scale: 0.99 },
        className: cn(
          "group relative bg-[var(--m3-surface-container)] rounded-[20px] p-5 flex items-center gap-4 border cursor-pointer transition-colors",
          isSelected ? "border-[var(--m3-primary)] bg-[var(--m3-primary-container)]/10" : "border-[var(--m3-outline)]/10 hover:border-[var(--m3-primary)]/30"
        ),
        children: [
          isHistoryView && isSelectionMode && onToggleSelect && /* @__PURE__ */ jsx(
            "div",
            {
              onClick: onToggleSelect,
              className: cn(
                "w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-colors",
                isSelected ? "bg-[var(--m3-primary)] border-[var(--m3-primary)] text-[var(--m3-on-primary)]" : "border-[var(--m3-outline)]/30 hover:border-[var(--m3-primary)]/50 bg-[var(--m3-surface)]"
              ),
              children: isSelected && /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-[var(--m3-surface-variant)] flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(BookOpen, { className: "w-5 h-5 text-[var(--m3-on-surface-variant)]" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-0.5", children: [
              /* @__PURE__ */ jsx(
                motion.span,
                {
                  layoutId: `subject-${submission.id}`,
                  transition: { duration: 0.25, ease: "easeOut" },
                  className: "text-xs font-black text-[var(--m3-primary)] uppercase tracking-[0.15em]",
                  children: submission.subject
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-[var(--m3-outline)]", children: "\u2022" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-[var(--m3-on-surface-variant)]", children: format((submission.deletedAt || submission.completedAt)?.toDate() || /* @__PURE__ */ new Date(), "yyyy/MM/dd HH:mm") })
            ] }),
            /* @__PURE__ */ jsx(
              motion.h3,
              {
                layoutId: `title-${submission.id}`,
                transition: { duration: 0.25, ease: "easeOut" },
                className: "text-sm font-bold text-[var(--m3-on-surface)] truncate",
                children: submission.title
              }
            )
          ] })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      layout: true,
      layoutId: submission.id,
      initial: { opacity: 0, scale: 0.95, y: 10 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.95, y: -10 },
      transition: {
        layout: { duration: 0.3, type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 }
      },
      onClick,
      whileTap: { scale: 0.98 },
      whileHover: { y: -4 },
      className: cn(
        "group relative cursor-pointer bg-[var(--m3-surface-container)] flex flex-col justify-between overflow-hidden transition-[box-shadow,border-color,background-color] duration-300",
        "aspect-auto sm:aspect-[1.414/1] min-h-min rounded-[24px] p-4 sm:p-5",
        "border border-white/10 dark:border-white/5 hover:border-[var(--m3-primary)]/40 hover:shadow-xl hover:shadow-[var(--m3-primary)]/10",
        submission.priority === "high" && submission.status !== "completed" && "border-red-500/30 ring-1 ring-red-500/20 bg-gradient-to-br from-[var(--m3-surface-container)] to-red-500/10"
      ),
      children: [
        submission.priority === "high" && submission.status !== "completed" && /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5 min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-1 mb-1", children: [
            /* @__PURE__ */ jsx(
              motion.span,
              {
                layoutId: `subject-${submission.id}`,
                className: "text-[10px] font-black uppercase tracking-[0.15em] text-[var(--m3-primary)]/80",
                children: submission.subject
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm",
              submission.priority === "high" ? "bg-red-500 text-white" : submission.priority === "medium" ? "bg-orange-500 text-white" : "bg-blue-500 text-white"
            ), children: [
              submission.priority === "high" && /* @__PURE__ */ jsx(AlertCircle, { className: "w-2.5 h-2.5" }),
              t[submission.priority]
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            motion.h3,
            {
              layoutId: `title-${submission.id}`,
              className: cn(
                "text-base sm:text-lg font-bold text-[var(--m3-on-surface)] leading-snug tracking-tight line-clamp-2",
                submission.priority === "high" && submission.status !== "completed" && "text-red-700 dark:text-red-400"
              ),
              children: submission.title
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5 mt-auto wrap-content", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-1.5 sm:gap-2", children: [
            /* @__PURE__ */ jsxs("div", { className: cn(
              "inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl transition-colors",
              isOverdue ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : "bg-[var(--m3-surface-variant)]/50 text-[var(--m3-on-surface-variant)]"
            ), children: [
              /* @__PURE__ */ jsx(Calendar, { className: "w-3 h-3 sm:w-3.5 sm:h-3.5" }),
              /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: format(submission.deadline, "MM/dd" + (submission.deadline.getHours() === 23 && submission.deadline.getMinutes() === 59 ? "" : " HH:mm")) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: cn(
              "text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg uppercase tracking-wider shrink-0",
              urgencyStyles.tag
            ), children: urgencyStyles.label }),
            submission.taskType === "pages" && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-bold text-[var(--m3-on-surface-variant)] opacity-70 shrink-0", children: [
              /* @__PURE__ */ jsx(BookOpen, { className: "w-3 h-3 sm:w-3.5 sm:h-3.5" }),
              /* @__PURE__ */ jsxs("span", { className: "tabular-nums", children: [
                submission.currentPage,
                " / ",
                submission.endPage,
                "p"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 shrink-0 py-0.5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end w-full px-0.5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-[var(--m3-on-surface-variant)] opacity-50", children: t.progress }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs sm:text-sm font-black tabular-nums text-[var(--m3-primary)]", children: [
                submission.progress,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-1.5 sm:h-2 w-full bg-[var(--m3-surface-variant)]/60 rounded-full overflow-hidden shadow-inner", children: /* @__PURE__ */ jsx(
              motion.div,
              {
                initial: { width: 0 },
                animate: { width: `${submission.progress}%` },
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                className: cn(
                  "h-full rounded-full transition-all duration-500",
                  daysLeft <= 0 ? "bg-red-500" : "bg-[var(--m3-primary)]"
                )
              }
            ) })
          ] })
        ] })
      ]
    }
  );
}
function SortableSubjectItem({ subject, onDelete, language, t }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: subject });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : void 0
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: setNodeRef,
      style,
      ...attributes,
      className: cn(
        "px-3 py-1.5 rounded-full bg-[var(--m3-surface-variant)] text-[var(--m3-on-surface-variant)] text-xs font-bold flex items-center gap-2 transition-all cursor-grab active:cursor-grabbing hover:bg-[var(--m3-surface-container-high)] border border-transparent",
        isDragging && "opacity-50 border-[var(--m3-primary)] scale-105 shadow-lg bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)]"
      ),
      children: [
        /* @__PURE__ */ jsxs("div", { ...listeners, className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5 opacity-30", children: [
            /* @__PURE__ */ jsx("div", { className: "w-1 h-0.5 bg-current rounded-full" }),
            /* @__PURE__ */ jsx("div", { className: "w-1 h-0.5 bg-current rounded-full" }),
            /* @__PURE__ */ jsx("div", { className: "w-1 h-0.5 bg-current rounded-full" })
          ] }),
          subject
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              onDelete();
            },
            className: "p-0.5 hover:bg-black/5 rounded-full transition-colors",
            children: /* @__PURE__ */ jsx(X, { className: "w-3 h-3" })
          }
        )
      ]
    }
  );
}
export {
  App as default
};
