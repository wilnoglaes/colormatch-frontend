import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const W = 8, D = 6, H = 3;
const OVERVIEW = { cam: [9, 7, 9], target: [0, 1.2, 0] };

// pos/rot del plano, dónde se para la persona y desde dónde mira la cámara
const WALLS = {
  Trasera:   { size: [W, H], pos: [0, 1.5, -D/2], rot: [0, 0, 0],            stand: [0, 0, -1.8], cam: [0, 1.8, 2.5],  target: [0, 1.3, -D/2] },
  Frontal:   { size: [W, H], pos: [0, 1.5, D/2],  rot: [0, Math.PI, 0],      stand: [0, 0, 1.8],  cam: [0, 1.8, -2.5], target: [0, 1.3, D/2] },
  Izquierda: { size: [D, H], pos: [-W/2, 1.5, 0], rot: [0, Math.PI/2, 0],    stand: [-2.8, 0, 0], cam: [3, 1.8, 0],    target: [-W/2, 1.3, 0] },
  Derecha:   { size: [D, H], pos: [W/2, 1.5, 0],  rot: [0, -Math.PI/2, 0],   stand: [2.8, 0, 0],  cam: [-3, 1.8, 0],   target: [W/2, 1.3, 0] },
  Piso:      { size: [W, D], pos: [0, 0, 0],      rot: [-Math.PI/2, 0, 0],   stand: [0, 0, 0],    cam: [0, 4.5, 3.5],  target: [0, 0, 0] },
  Techo:     { size: [W, D], pos: [0, H, 0],      rot: [Math.PI/2, 0, 0],    stand: [0, 0, 0],    cam: [0, 1.2, 2.8],  target: [0, H, 0] },
};

const box = (w, h, d, color, x, y, z, parent, rough = 0.7) => {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: rough })
  );
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  parent.add(m);
  return m;
};

export default function Room3D({ wallColors, activeWall, onSelectWall }) {
  const mountRef = useRef();
  const S = useRef({});            // estado interno de three
  const cbRef = useRef(onSelectWall);
  cbRef.current = onSelectWall;

  // ---------- Escena (una sola vez) ----------
  useEffect(() => {
    const el = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0f172a");

    const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.set(...OVERVIEW.cam);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    el.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...OVERVIEW.target);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2 + 0.3;

    // Luces
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444455, 0.8));
    const sun = new THREE.DirectionalLight(0xfff1dd, 1.2);
    sun.position.set(5, 8, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 });
    scene.add(sun);
    const bulb = new THREE.PointLight(0xffe2b0, 25, 10, 2);
    bulb.position.set(0, H - 0.4, 0);
    scene.add(bulb);

    // Paredes / piso / techo
    const wallMeshes = {};
    Object.entries(WALLS).forEach(([name, w]) => {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(...w.size),
        new THREE.MeshStandardMaterial({ color: "#e5e5e5", roughness: 0.9 }) // FrontSide: se ve solo desde dentro
      );
      mesh.position.set(...w.pos);
      mesh.rotation.set(...w.rot);
      mesh.receiveShadow = true;
      mesh.userData.wall = name;
      scene.add(mesh);
      wallMeshes[name] = mesh;
    });
    // zócalo
    [[0, -D/2 + .03, W, .02], [0, D/2 - .03, W, .02]].forEach(([x, z, w]) =>
      box(w, 0.15, 0.06, "#f8fafc", x, 0.075, z, scene));
    [-W/2 + .03, W/2 - .03].forEach(x => box(0.06, 0.15, D, "#f8fafc", x, 0.075, 0, scene));

    // ---------- Muebles ----------
    const rug = box(3.5, 0.02, 2.4, "#7c3aed", 0, 0.012, 0.3, scene, 1);
    box(3.2, 0.021, 2.1, "#a78bfa", 0, 0.013, 0.3, scene, 1);
    // sofá
    const sofa = new THREE.Group(); sofa.position.set(0, 0, -2.2); scene.add(sofa);
    box(2.4, 0.45, 0.95, "#334155", 0, 0.3, 0, sofa);
    box(2.4, 0.6, 0.25, "#1e293b", 0, 0.65, -0.35, sofa);
    box(0.25, 0.6, 0.95, "#1e293b", -1.15, 0.45, 0, sofa);
    box(0.25, 0.6, 0.95, "#1e293b", 1.15, 0.45, 0, sofa);
    // mesa de centro
    box(1.1, 0.05, 0.7, "#92613a", 0, 0.42, 0.4, scene, 0.4);
    [[-.5,-.3],[.5,-.3],[-.5,.3],[.5,.3]].forEach(([x,z]) => box(.05,.4,.05,"#5b3a1e",x,.2,.4+z,scene));
    // librero
    const shelf = new THREE.Group(); shelf.position.set(-3.7, 0, -1); scene.add(shelf);
    box(0.4, 2.2, 1.6, "#6b4423", 0, 1.1, 0, shelf);
    [0.5, 1.1, 1.7].forEach((y, i) => box(0.3, 0.3, 1.3, ["#ef4444","#3b82f6","#22c55e"][i], 0.08, y, 0, shelf));
    // lámpara de pie
    box(0.05, 1.6, 0.05, "#222", 3.4, 0.8, -2.4, scene);
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.35, 24),
      new THREE.MeshStandardMaterial({ color: "#fde68a", emissive: "#fbbf24", emissiveIntensity: 0.6 }));
    shade.position.set(3.4, 1.75, -2.4); scene.add(shade);
    // planta
    box(0.4, 0.4, 0.4, "#b45309", 3.3, 0.2, 2, scene);
    const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 1),
      new THREE.MeshStandardMaterial({ color: "#16a34a", flatShading: true }));
    leaves.position.set(3.3, 0.85, 2); leaves.castShadow = true; scene.add(leaves);
    // cuadro y ventana en pared trasera (no bloquean el clic: se asignan a la pared)
    const frame = box(1.2, 0.8, 0.04, "#111", -2, 1.8, -D/2 + 0.03, scene);
    box(1.1, 0.7, 0.045, "#38bdf8", -2, 1.8, -D/2 + 0.035, scene);
    const win = box(1.6, 1.3, 0.04, "#f1f5f9", 2, 1.7, -D/2 + 0.03, scene);
    box(1.4, 1.1, 0.045, "#bae6fd", 2, 1.7, -D/2 + 0.035, scene);
    [frame, win].forEach(m => (m.userData.wall = "Trasera"));

    // ---------- Persona ----------
    const person = new THREE.Group();
    const mat = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.6, 8, 16), mat("#2563eb"));
    body.position.y = 1.0; body.castShadow = true;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), mat("#f0b27a"));
    head.position.y = 1.65; head.castShadow = true;
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.19, 24, 24, 0, Math.PI*2, 0, Math.PI/2), mat("#3b2f2f"));
    hair.position.y = 1.67;
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6), mat("#1e293b"));
    const legR = legL.clone(); legL.position.set(-0.11, 0.3, 0); legR.position.set(0.11, 0.3, 0);
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.55), mat("#2563eb"));
    const armR = armL.clone(); armL.position.set(-0.3, 1.0, 0); armR.position.set(0.3, 1.0, 0);
    // brocha en la mano
    const brush = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4), mat("#a16207"));
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.05), mat("#fff"));
    brush.position.set(0.3, 0.75, 0.15); brush.rotation.x = Math.PI / 2.5; tip.position.set(0.3, 0.9, 0.3);
    person.add(body, head, hair, legL, legR, armL, armR, brush, tip);
    person.traverse(o => o.isMesh && (o.castShadow = true));
    person.position.set(0, 0, 1.5);
    scene.add(person);

    // Clic en pared
    const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
    let down = null;
    renderer.domElement.addEventListener("pointerdown", e => (down = [e.clientX, e.clientY]));
    renderer.domElement.addEventListener("pointerup", e => {
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return; // fue arrastre
      const r = renderer.domElement.getBoundingClientRect();
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(mouse, camera);
      const hit = ray.intersectObjects(scene.children, true).find(h => h.object.userData.wall);
      if (hit) cbRef.current(hit.object.userData.wall);
    });

    // Estado de animación
    S.current = { wallMeshes, person, legL, legR, armL, armR, camera, controls,
      goal: { stand: new THREE.Vector3(0, 0, 1.5), cam: new THREE.Vector3(...OVERVIEW.cam),
              target: new THREE.Vector3(...OVERVIEW.target), face: 0 }, tween: true };
    controls.addEventListener("start", () => (S.current.tween = false));

    let t = 0, raf;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const s = S.current; t += 0.12;
      // caminar
      const to = s.goal.stand.clone().sub(person.position);
      to.y = 0;
      const dist = to.length();
      if (dist > 0.05) {
        to.normalize();
        person.position.addScaledVector(to, Math.min(0.06, dist));
        person.rotation.y = Math.atan2(to.x, to.z);
        legL.rotation.x = Math.sin(t) * 0.6; legR.rotation.x = -Math.sin(t) * 0.6;
        armL.rotation.x = -Math.sin(t) * 0.5; armR.rotation.x = Math.sin(t) * 0.5;
        person.position.y = Math.abs(Math.sin(t)) * 0.03;
      } else {
        legL.rotation.x = legR.rotation.x = armL.rotation.x = armR.rotation.x = 0;
        person.position.y = 0;
        // mirar la pared al llegar
        const d = ((s.goal.face - person.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        person.rotation.y += d * 0.15;
      }
      // cámara enfoca
      if (s.tween) {
        camera.position.lerp(s.goal.cam, 0.05);
        controls.target.lerp(s.goal.target, 0.05);
      }
      controls.update();
      renderer.render(scene, camera);
    };
    loop();

    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", onResize);
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  // ---------- Colores ----------
  useEffect(() => {
    const m = S.current.wallMeshes;
    if (!m) return;
    Object.entries(wallColors).forEach(([k, c]) => m[k]?.material.color.set(c));
  }, [wallColors]);

  // ---------- Persona camina + cámara enfoca ----------
  useEffect(() => {
    const s = S.current, w = WALLS[activeWall];
    if (!s.goal) return;
    if (!w) return goOverview();
    const stand = new THREE.Vector3(...w.stand);
    const look = new THREE.Vector3(...w.target);
    s.goal.stand.copy(stand);
    s.goal.face = Math.atan2(look.x - stand.x, look.z - stand.z);
    s.goal.cam.set(...w.cam);
    s.goal.target.copy(look);
    s.tween = true;
  }, [activeWall]);

  function goOverview() {
    const s = S.current;
    s.goal.cam.set(...OVERVIEW.cam); s.goal.target.set(...OVERVIEW.target); s.tween = true;
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full rounded-xl overflow-hidden" />
      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
        {Object.keys(WALLS).map(n => (
          <button key={n} onClick={() => onSelectWall(n)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              activeWall === n ? "bg-blue-600 border-blue-400 text-white" : "bg-slate-800/80 border-slate-600 text-slate-200"}`}>
            {n}
          </button>
        ))}
        <button onClick={goOverview}
          className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-600 text-slate-200">
          Vista general
        </button>
      </div>
    </div>
  );
}