(function () {
  const WORKS = [
    { id: "carte", title: "Variation sur l'empêchement", line: "A map that refuses the shortcut. Saint-Marcel, la Valentine, the canal as a body approached by obstacle.", with: "with Julien Rodriguez", src: "https://cdn.jsdelivr.net/gh/sophiamaybea/la-plaque@main/media/carte.jpg", shape: "wide" },
    { id: "plaque", title: "Plaque", line: "Lavis and membrane. A nucleus holding while the wash decides the edge.", src: "https://cdn.jsdelivr.net/gh/sophiamaybea/la-plaque@main/media/plaque.jpg", shape: "tall" },
    { id: "fil", title: "Fil rose", line: "Thread on a stained ground. The drawing is sewn, not laid down.", src: "https://cdn.jsdelivr.net/gh/sophiamaybea/la-plaque@main/media/fil.jpg", shape: "tall" },
    { id: "perle", title: "Perle et volute", line: "Ink, pastel, a glass bead caught in the spiral.", src: "https://cdn.jsdelivr.net/gh/sophiamaybea/la-plaque@main/media/perle.jpg", shape: "cell" },
    { id: "geode", title: "Coupes", line: "Graphite rinds, fluorescent interiors. The rock opened like a cell.", src: "https://cdn.jsdelivr.net/gh/sophiamaybea/la-plaque@main/media/geode.jpg", shape: "squat" },
    { id: "textile", title: "Textile concentrique", line: "Lace, floss, a rust ring. Cloth thinking in sections.", src: "https://cdn.jsdelivr.net/gh/sophiamaybea/la-plaque@main/media/textile.jpg", shape: "wide" },
    { id: "semences", title: "Semences", line: "Denim as agar. Each seed a different stitch density.", src: "https://cdn.jsdelivr.net/gh/sophiamaybea/la-plaque@main/media/semences.jpg", shape: "tall" },
    { id: "bleu", title: "Bleu et or", line: "Arcs, lattices, a gold rule. Architecture after the wash.", src: "https://cdn.jsdelivr.net/gh/sophiamaybea/la-plaque@main/media/bleu.jpg", shape: "tall" },
    { id: "grille", title: "Grille de membranes", line: "The row as a method. Each oval a separate weather.", src: "https://cdn.jsdelivr.net/gh/sophiamaybea/la-plaque@main/media/grille.jpg", shape: "squat" },
    { id: "bloom", title: "Bloom", line: "Pigment dropped and left to decide its own edge.", src: "https://cdn.jsdelivr.net/gh/sophiamaybea/la-plaque@main/media/bloom.jpg", shape: "cell" },
    { id: "chambre", title: "Chambre", line: "A second grid, hotter. The plate repeating itself with a different hand.", src: "https://cdn.jsdelivr.net/gh/sophiamaybea/la-plaque@main/media/chambre.jpg", shape: "squat" },
    { id: "figures", title: "Figures rencontrées", line: "Bodies at the edge of the plate. The canal has a public.", src: "https://cdn.jsdelivr.net/gh/sophiamaybea/la-plaque@main/media/figures.jpg", shape: "tall" },
    { id: "humide", title: "Chambre humide", line: "Plastic, wet light, a face kept under film. The glass state, studied from the wrong side.", src: "https://cdn.jsdelivr.net/gh/sophiamaybea/la-plaque@main/media/chambre-humide.jpg", shape: "tall" }
  ];

  const MEDIA = [
    { id: "wash", name: "wash" },
    { id: "mesh", name: "mesh" },
    { id: "cell", name: "cell" },
    { id: "stitch", name: "stitch" },
    { id: "glass", name: "glass" },
    { id: "metal", name: "metal" },
    { id: "glitter", name: "glitter" }
  ];

  const BLOBS = [
    "52% 48% 46% 54% / 58% 42% 60% 40%",
    "40% 60% 55% 45% / 48% 62% 38% 52%",
    "61% 39% 48% 52% / 42% 55% 45% 58%",
    "47% 53% 62% 38% / 55% 40% 60% 45%",
    "58% 42% 36% 64% / 46% 60% 40% 54%"
  ];

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const plate = document.getElementById("plate");
  const threads = document.getElementById("threads");
  const ledger = document.getElementById("ledger");
  const dial = document.getElementById("dial");
  const liveText = document.getElementById("live-text");
  const genEl = document.getElementById("gen");
  const countEl = document.getElementById("count");

  const state = {
    medium: 0,
    locked: false,
    generation: 0,
    cells: 0,
    selected: 0,
    pointer: { x: 0.62, y: 0.42 },
    born: 0
  };

  MEDIA.forEach(function (m, i) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = m.name;
    b.dataset.i = String(i);
    b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
    if (i === 0) b.classList.add("on");
    b.addEventListener("click", function () {
      state.locked = true;
      setMedium(i);
    });
    dial.appendChild(b);
  });

  function setMedium(i) {
    state.medium = i;
    document.body.dataset.medium = MEDIA[i].id;
    dial.querySelectorAll("button").forEach(function (b, n) {
      b.classList.toggle("on", n === i);
      b.setAttribute("aria-pressed", n === i ? "true" : "false");
    });
    paintLive();
    if (window.__chamber) window.__chamber.medium = i;
  }

  function paintLive() {
    const g = String(state.generation).padStart(2, "0");
    liveText.textContent = MEDIA[state.medium].name + (state.locked ? " · locked" : " · shifting");
    genEl.textContent = g;
    countEl.textContent = state.cells + (state.cells === 1 ? " cell" : " cells");
  }

  function openLedger(work, index) {
    document.getElementById("ledger-kicker").textContent = "specimen " + String(index + 1).padStart(2, "0") + " · " + MEDIA[state.medium].name;
    document.getElementById("ledger-title").textContent = work.title;
    document.getElementById("ledger-line").textContent = work.line;
    document.getElementById("ledger-with").textContent = work.with || "";
    ledger.classList.add("on");
    document.querySelectorAll(".cell").forEach(function (el) {
      el.classList.toggle("is-on", el.dataset.work === work.id && el.dataset.i === String(index));
    });
    if (window.__chamber) window.__chamber.focus(work.id);
  }

  function addRow() {
    state.generation += 1;
    const row = document.createElement("section");
    row.className = "row";
    row.dataset.gen = String(state.generation);
    const label = document.createElement("div");
    label.className = "row-label";
    label.textContent = "generation " + String(state.generation).padStart(2, "0");
    row.appendChild(label);

    const n = state.generation === 1 ? 3 : 4 + (state.generation % 3 === 0 ? 1 : 0);
    for (let k = 0; k < n; k++) {
      const work = WORKS[(state.born + k) % WORKS.length];
      const btn = document.createElement("button");
      btn.className = "cell" + (work.shape === "wide" ? " wide" : "") + (work.shape === "tall" ? " tall" : "") + (work.shape === "squat" ? " squat" : "");
      btn.type = "button";
      btn.dataset.work = work.id;
      btn.dataset.i = String(state.born);
      btn.style.setProperty("--d", (k * 90) + "ms");
      btn.style.setProperty("--blob", BLOBS[(state.born + k) % BLOBS.length]);
      const w = work.shape === "wide" ? 460 : 168 + ((state.born * 37 + k * 53) % 90);
      btn.style.setProperty("--w", w + "px");
      btn.innerHTML =
        '<span class="membrane">' +
          '<img src="' + work.src + '" alt="' + work.title + '" />' +
          '<span class="nucleus"></span>' +
          '<svg class="stitch-ring" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M18 62 C22 28, 48 14, 70 26 C88 36, 90 58, 74 74 C58 90, 28 86, 18 62 Z" /></svg>' +
        '</span>' +
        '<span class="cell-meta"><span>' + String(state.born + 1).padStart(2, "0") + '</span><span>' + work.id + '</span></span>';
      const index = state.born;
      btn.addEventListener("click", function () {
        state.selected = index;
        openLedger(work, index);
      });
      btn.addEventListener("pointerenter", function (e) {
        state.pointer.x = e.clientX / window.innerWidth;
        state.pointer.y = e.clientY / window.innerHeight;
        if (window.__chamber) window.__chamber.focus(work.id);
      });
      row.appendChild(btn);
      state.born += 1;
      state.cells += 1;
    }
    plate.appendChild(row);
    paintLive();
    requestAnimationFrame(sewRows);
    if (state.generation > 1 && !reduced) {
      const last = row.lastElementChild;
      if (last) last.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function sewRows() {
    const cells = plate.querySelectorAll(".cell");
    if (!cells.length) return;
    const frame = document.querySelector(".frame").getBoundingClientRect();
    threads.setAttribute("viewBox", "0 0 " + frame.width + " " + Math.max(frame.height, plate.scrollHeight + 200));
    threads.style.height = Math.max(frame.height, document.body.scrollHeight) + "px";
    let d = "";
    const pts = [];
    cells.forEach(function (el) {
      const r = el.getBoundingClientRect();
      pts.push({
        x: r.left + r.width * 0.5 - frame.left,
        y: r.top + r.height * 0.46 - frame.top + window.scrollY
      });
    });
    if (pts.length) {
      d = "M " + pts[0].x + " " + pts[0].y;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2 - 18;
        d += " Q " + mx + " " + my + " " + b.x + " " + b.y;
      }
    }
    threads.innerHTML = '<path d="' + d + '" fill="none" stroke="#c4376a" stroke-width="1.1" stroke-dasharray="4 5" stroke-linecap="round" opacity="0.75" />';
  }

  document.getElementById("grow").addEventListener("click", addRow);
  window.addEventListener("resize", sewRows);
  window.addEventListener("pointermove", function (e) {
    state.pointer.x += (e.clientX / window.innerWidth - state.pointer.x) * 0.35;
    state.pointer.y += (e.clientY / window.innerHeight - state.pointer.y) * 0.35;
  });

  let nearBottom = false;
  window.addEventListener("scroll", function () {
    sewRows();
    const edge = window.scrollY + window.innerHeight;
    nearBottom = edge > document.body.scrollHeight - 140;
  }, { passive: true });

  const hash = (location.hash || "").replace("#", "");
  const fromHash = MEDIA.findIndex(function (m) { return m.id === hash; });
  if (fromHash >= 0) {
    state.locked = true;
    setMedium(fromHash);
  }

  addRow();
  openLedger(WORKS[0], 0);
  setTimeout(addRow, reduced ? 400 : 900);

  if (!reduced) {
    setInterval(function () {
      if (state.generation < 8 && (nearBottom || state.generation < 3)) addRow();
    }, 5200);
    setInterval(function () {
      if (!state.locked) setMedium((state.medium + 1) % MEDIA.length);
    }, 9000);
  }

  bootChamber();

  function bootChamber() {
    const canvas = document.getElementById("chamber");
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 40);
    camera.position.set(0.2, 0.1, 5.4);

    const loader = new THREE.TextureLoader();
    const textures = {};
    WORKS.forEach(function (w) {
      const t = loader.load(w.src);
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
      textures[w.id] = t;
    });

    const uniforms = {
      uTime: { value: 0 },
      uMedium: { value: 0 },
      uMap: { value: textures.carte },
      uPointer: { value: new THREE.Vector2(0.6, 0.4) }
    };

    const mat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      transparent: true,
      vertexShader: [
        "uniform float uTime;",
        "uniform float uMedium;",
        "uniform vec2 uPointer;",
        "varying vec3 vN;",
        "varying vec3 vP;",
        "varying vec2 vUv;",
        "varying vec3 vWorld;",
        "void main(){",
        "  vUv = uv;",
        "  vec3 p = position;",
        "  float cell = smoothstep(1.2, 2.4, uMedium) * (1.0 - smoothstep(2.8, 3.6, uMedium));",
        "  float n = sin(p.x*3.1 + uTime*0.55)*cos(p.y*2.4 - uTime*0.32)*sin(p.z*2.7 + uTime*0.22);",
        "  n += sin(p.y*6.0 + uTime)*0.15;",
        "  p += normal * n * (0.16 + 0.22*cell);",
        "  p.x += (uPointer.x - 0.5) * 0.18;",
        "  p.y += (0.5 - uPointer.y) * 0.12;",
        "  vec4 w = modelMatrix * vec4(p, 1.0);",
        "  vWorld = w.xyz;",
        "  vP = p;",
        "  vN = normalize(mat3(modelMatrix) * normal);",
        "  gl_Position = projectionMatrix * viewMatrix * w;",
        "}"
      ].join("\n"),
      fragmentShader: [
        "uniform float uTime;",
        "uniform float uMedium;",
        "uniform sampler2D uMap;",
        "varying vec3 vN;",
        "varying vec3 vP;",
        "varying vec2 vUv;",
        "varying vec3 vWorld;",
        "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }",
        "void main(){",
        "  vec3 N = normalize(vN);",
        "  vec3 V = normalize(cameraPosition - vWorld);",
        "  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.2);",
        "  vec2 uv = vUv + N.xy * 0.08 * fres;",
        "  vec3 tex = texture2D(uMap, clamp(uv, 0.0, 1.0)).rgb;",
        "  float m = uMedium;",
        "  float wash = 1.0 - smoothstep(0.0, 0.85, m);",
        "  float mesh = smoothstep(0.35, 1.0, m) * (1.0 - smoothstep(1.15, 1.8, m));",
        "  float cell = smoothstep(1.25, 1.9, m) * (1.0 - smoothstep(2.15, 2.8, m));",
        "  float stitch = smoothstep(2.3, 2.9, m) * (1.0 - smoothstep(3.15, 3.8, m));",
        "  float glass = smoothstep(3.3, 3.95, m) * (1.0 - smoothstep(4.2, 4.85, m));",
        "  float metal = smoothstep(4.3, 4.95, m) * (1.0 - smoothstep(5.2, 5.85, m));",
        "  float glitter = smoothstep(5.3, 5.9, m);",
        "  vec3 paper = vec3(0.94, 0.90, 0.85);",
        "  vec3 col = mix(paper, tex, 0.88);",
        "  float grid = step(0.92, fract(vUv.x * 18.0)) + step(0.92, fract(vUv.y * 18.0));",
        "  col = mix(col, vec3(0.12, 0.09, 0.08), grid * mesh * 0.85);",
        "  col = mix(col, col * 0.45 + paper * 0.4, mesh * 0.45);",
        "  float nucleus = smoothstep(0.16, 0.0, length(vUv - vec2(0.48, 0.5)));",
        "  float membrane = smoothstep(0.08, 0.0, abs(length(vUv - 0.5) - 0.36));",
        "  col = mix(col, vec3(0.55, 0.16, 0.32), membrane * cell);",
        "  col = mix(col, vec3(0.1, 0.07, 0.06), nucleus * cell);",
        "  float thread = smoothstep(0.045, 0.0, abs(fract(vUv.y * 22.0 + vUv.x * 3.0) - 0.5) - 0.36);",
        "  col = mix(col, vec3(0.77, 0.22, 0.42), (thread * 0.65 + fres) * stitch);",
        "  vec3 glassCol = mix(vec3(0.75, 0.88, 0.9), tex, 0.45) + fres * vec3(0.85, 0.95, 1.0);",
        "  col = mix(col, glassCol, glass);",
        "  float spec = pow(max(dot(N, normalize(vec3(0.4, 0.8, 0.5))), 0.0), 28.0);",
        "  float flake = step(0.92, hash(floor(vUv * 48.0) + floor(uTime * 2.0)));",
        "  vec3 metalCol = tex * vec3(1.05, 0.86, 0.55) + spec * vec3(1.0, 0.9, 0.7) + flake * 0.35;",
        "  col = mix(col, metalCol, metal);",
        "  float spark = step(0.965, hash(floor(vUv * 70.0) + floor(uTime * 6.0)));",
        "  col = mix(col, col + spark * vec3(1.0, 0.95, 0.8), glitter);",
        "  col += fres * 0.18;",
        "  float alpha = 0.92;",
        "  alpha = mix(alpha, 0.55 + fres, glass);",
        "  gl_FragColor = vec4(col, alpha);",
        "}"
      ].join("\n")
    });

    const hero = new THREE.Mesh(new THREE.IcosahedronGeometry(1.55, 5), mat);
    hero.position.set(1.55, 0.05, 0);
    scene.add(hero);

    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.64, 2),
      new THREE.MeshBasicMaterial({ color: 0x1b1410, wireframe: true, transparent: true, opacity: 0.0 })
    );
    wire.position.copy(hero.position);
    scene.add(wire);

    const satellites = [];
    for (let i = 0; i < 6; i++) {
      const g = new THREE.SphereGeometry(0.18 + (i % 3) * 0.06, 24, 18);
      const s = new THREE.Mesh(g, mat);
      const a = (i / 6) * Math.PI * 2;
      s.position.set(Math.cos(a) * 2.15 - 0.4, Math.sin(a) * 1.15, Math.sin(a) * 0.4);
      s.userData.a = a;
      s.userData.r = 1.6 + (i % 3) * 0.25;
      scene.add(s);
      satellites.push(s);
    }

    const key = new THREE.DirectionalLight(0xfff1dd, 1.1);
    key.position.set(2, 3, 4);
    scene.add(key);
    scene.add(new THREE.AmbientLight(0xf0e2d0, 0.6));

    const chamber = {
      medium: 0,
      focusId: "carte",
      focus: function (id) {
        this.focusId = id;
        if (textures[id]) uniforms.uMap.value = textures[id];
      }
    };
    window.__chamber = chamber;

    window.addEventListener("resize", function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const clock = new THREE.Clock();
    function frame() {
      requestAnimationFrame(frame);
      const t = reduced ? 0.8 : clock.getElapsedTime();
      const target = state.medium;
      uniforms.uMedium.value += (target - uniforms.uMedium.value) * (reduced ? 1 : 0.04);
      uniforms.uTime.value = t;
      uniforms.uPointer.value.set(state.pointer.x, state.pointer.y);
      hero.rotation.y = t * 0.18 + (state.pointer.x - 0.5) * 0.6;
      hero.rotation.x = Math.sin(t * 0.2) * 0.18 + (state.pointer.y - 0.5) * 0.3;
      wire.rotation.copy(hero.rotation);
      wire.material.opacity = Math.max(0, 1.0 - Math.abs(uniforms.uMedium.value - 1.0)) * 0.45;
      satellites.forEach(function (s, i) {
        const a = s.userData.a + t * 0.12;
        s.position.x = Math.cos(a) * s.userData.r + 0.4;
        s.position.y = Math.sin(a * 1.3) * 0.9;
        s.position.z = Math.sin(a) * 0.45;
        s.scale.setScalar(0.7 + Math.sin(t + i) * 0.08);
      });
      camera.position.x += ((state.pointer.x - 0.5) * 0.7 - camera.position.x) * 0.04;
      camera.position.y += ((0.5 - state.pointer.y) * 0.4 - camera.position.y) * 0.04;
      camera.lookAt(0.4, 0.05, 0);
      renderer.render(scene, camera);
    }
    frame();
  }
})();
