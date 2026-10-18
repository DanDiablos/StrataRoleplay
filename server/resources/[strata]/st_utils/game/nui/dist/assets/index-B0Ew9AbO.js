/**
 * strata-capture NUI — WebGL screen capture with HTTPS-safe NUI callbacks.
 * Replaces the original compiled JS that used http:// URLs (blocked by CEF mixed content).
 */
(function () {
  const VERT = `
    attribute vec2 a_position;
    attribute vec2 a_texcoord;
    varying vec2 textureCoordinate;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      textureCoordinate = a_texcoord;
    }
  `;
  const FRAG = `
    varying highp vec2 textureCoordinate;
    uniform sampler2D external_texture;
    void main() {
      gl_FragColor = texture2D(external_texture, textureCoordinate);
    }
  `;

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  function initWebGL(canvas) {
    const gl = canvas.getContext("webgl", {
      antialias: false, depth: false, stencil: false,
      alpha: false, desynchronized: true,
      failIfMajorPerformanceCaveat: false,
    });

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const vs = createShader(gl, gl.VERTEX_SHADER, VERT);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const vloc = gl.getAttribLocation(prog, "a_position");
    const tloc = gl.getAttribLocation(prog, "a_texcoord");

    const vbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vloc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vloc);

    const tbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tbuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(tloc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(tloc);

    gl.uniform1i(gl.getUniformLocation(prog, "external_texture"), 0);
    gl.viewport(0, 0, canvas.width, canvas.height);

    let disposed = false;
    let raf;

    function draw() {
      if (disposed) return;
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.finish();
      raf = requestAnimationFrame(draw);
    }
    draw();

    return {
      resize(w, h) { if (!disposed) { gl.viewport(0, 0, w, h); canvas.width = w; canvas.height = h; } },
      dispose() {
        if (disposed) return;
        disposed = true;
        if (raf) cancelAnimationFrame(raf);
        const ext = gl.getExtension("WEBGL_lose_context");
        if (ext) ext.loseContext();
      },
    };
  }

  // ── Capture manager ─────────────────────────────────────────────────────────

  const MAX_WIDTH = 1920;
  const MAX_HEIGHT = 1080;
  let renderer = null;

  function calcDimensions(opts) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const mw = opts.maxWidth || MAX_WIDTH;
    const mh = opts.maxHeight || MAX_HEIGHT;
    if (w <= mw && h <= mh) return { width: w, height: h };
    const scale = Math.min(mw / w, mh / h);
    return { width: Math.floor(w * scale), height: Math.floor(h * scale) };
  }

  async function captureScreen(msg) {
    const canvas = document.createElement("canvas");
    const { width, height } = calcDimensions(msg);
    canvas.width = width;
    canvas.height = height;

    renderer = initWebGL(canvas);
    renderer.resize(width, height);

    const encoding = msg.encoding || "webp";

    // For callback (client requestScreenshot) — return data URI
    if (msg.callbackUrl) {
      const dataUrl = canvas.toDataURL("image/" + encoding, msg.quality || 0.7);

      // Use HTTPS NUI callback URL instead of http://
      const nuiCallbackUrl = "https://cfx-nui-strata-capture/screenshot_created";
      try {
        await fetch(nuiCallbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: dataUrl, id: msg.correlationId }),
        });
      } catch (err) {
        console.error("NUI callback failed:", err);
      }
    }
    // For server capture — upload blob to server endpoint
    else if (msg.serverEndpoint) {
      const pixels = width * height;
      let quality = msg.quality || 0.7;
      if (pixels > 2073600) quality = 0.5;
      else if (pixels > 144e4) quality = 0.6;

      try {
        const blob = await new Promise((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject("No blob")),
            "image/" + encoding,
            quality
          );
        });
        const form = new FormData();
        form.append("file", blob);

        // Try HTTPS first (cfx-nui endpoint), fallback to provided serverEndpoint
        const httpsEndpoint = msg.serverEndpoint.replace(/^http:\/\//, "https://");
        await fetch(httpsEndpoint, {
          method: "POST",
          mode: "cors",
          headers: { "X-ScreenCapture-Token": msg.uploadToken },
          body: form,
        });
      } catch (err) {
        console.error("Server upload failed:", err);
      }
    }

    renderer.dispose();
    renderer = null;
    canvas.remove();
  }

  // ── Event listener ──────────────────────────────────────────────────────────

  window.addEventListener("message", function (e) {
    if (e.data && e.data.action === "capture") {
      captureScreen(e.data);
    }
  });

  window.addEventListener("resize", function () {
    if (renderer) {
      renderer.resize(window.innerWidth, window.innerHeight);
    }
  });
})();
