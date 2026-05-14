"use client";

/**
 * MoleculeBackground — Molécula de Capsaicina C₁₈H₂₇NO₃ en Three.js
 * Fondo interactivo del Hero. Auto-rota; el usuario puede arrastrar para rotar.
 * Se desmonta limpiamente al salir del viewport.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const ATOMS = [
  { id:  0, pos: [ 0.00,  0.00,  0.00] as [number,number,number], type: "C" as const },
  { id:  1, pos: [ 1.20,  0.00,  0.69] as [number,number,number], type: "C" as const },
  { id:  2, pos: [ 1.20,  0.00, -0.69] as [number,number,number], type: "C" as const },
  { id:  3, pos: [ 0.00,  0.00, -1.40] as [number,number,number], type: "C" as const },
  { id:  4, pos: [-1.20,  0.00, -0.69] as [number,number,number], type: "C" as const },
  { id:  5, pos: [-1.20,  0.00,  0.69] as [number,number,number], type: "C" as const },
  { id:  6, pos: [ 2.52,  0.18, -1.06] as [number,number,number], type: "O" as const },
  { id:  7, pos: [ 3.50,  0.35, -2.04] as [number,number,number], type: "C" as const },
  { id:  8, pos: [ 0.00, -0.15, -2.80] as [number,number,number], type: "O" as const },
  { id:  9, pos: [ 0.00,  0.20,  1.55] as [number,number,number], type: "C" as const },
  { id: 10, pos: [ 0.00,  0.10,  2.96] as [number,number,number], type: "N" as const },
  { id: 11, pos: [ 0.00,  0.00,  4.38] as [number,number,number], type: "C" as const },
  { id: 12, pos: [ 1.26, -0.20,  5.08] as [number,number,number], type: "O" as const },
  { id: 13, pos: [-1.30,  0.18,  5.08] as [number,number,number], type: "C" as const },
  { id: 14, pos: [-2.55,  0.35,  4.38] as [number,number,number], type: "C" as const },
  { id: 15, pos: [-3.80,  0.20,  5.08] as [number,number,number], type: "C" as const },
  { id: 16, pos: [-5.08,  0.00,  4.40] as [number,number,number], type: "C" as const },
  { id: 17, pos: [-6.35, -0.20,  5.10] as [number,number,number], type: "C" as const },
  { id: 18, pos: [-7.58,  0.00,  4.42] as [number,number,number], type: "C" as const },
  { id: 19, pos: [-8.60,  0.55,  5.32] as [number,number,number], type: "C" as const },
  { id: 20, pos: [-8.60, -0.55,  3.52] as [number,number,number], type: "C" as const },
];

const BONDS: [number, number, boolean][] = [
  [0,1,false],[1,2,true],[2,3,false],[3,4,true],[4,5,false],[5,0,true],
  [2,6,false],[6,7,false],
  [3,8,false],
  [0,9,false],
  [9,10,false],[10,11,false],[11,12,true],
  [11,13,false],[13,14,false],[14,15,false],
  [15,16,false],[16,17,true],
  [17,18,false],[18,19,false],[18,20,false],
];

function makeGlowTexture(r: number, g: number, b: number): THREE.CanvasTexture {
  const sz = 256, half = 128;
  const cv = document.createElement("canvas");
  cv.width = cv.height = sz;
  const ctx = cv.getContext("2d")!;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0.00, `rgba(${r},${g},${b},1.0)`);
  grad.addColorStop(0.12, `rgba(${r},${g},${b},0.75)`);
  grad.addColorStop(0.35, `rgba(${r},${g},${b},0.22)`);
  grad.addColorStop(0.70, `rgba(${r},${g},${b},0.05)`);
  grad.addColorStop(1.00, `rgba(${r},${g},${b},0.0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, sz, sz);
  return new THREE.CanvasTexture(cv);
}

export default function MoleculeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === "undefined") return;

    const isMobile = window.innerWidth < 768;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.2;
    container.appendChild(renderer.domElement);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";

    const scene = new THREE.Scene();
    if (!isMobile) scene.fog = new THREE.FogExp2(0x06080e, 0.016);

    const camera = new THREE.PerspectiveCamera(
      isMobile ? 52 : 42,
      container.clientWidth / container.clientHeight,
      0.1,
      300
    );
    camera.position.set(0, 0, isMobile ? 24 : 30);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping   = true;
    controls.dampingFactor   = 0.06;
    controls.autoRotate      = true;
    controls.autoRotateSpeed = 0.7;
    controls.enableZoom      = false;
    controls.mouseButtons    = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN } as typeof controls.mouseButtons;
    controls.enablePan       = false;
    controls.minPolarAngle   = Math.PI * 0.15;
    controls.maxPolarAngle   = Math.PI * 0.85;
    controls.target.set(0, -0.5, 0);
    controls.update();

    scene.add(new THREE.AmbientLight(0x1a2440, 1.2));

    const keyLight = new THREE.PointLight(0xfff8f0, 1400, 60);
    keyLight.position.set(10, 12, 12);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x2040e0, 600, 45);
    rimLight.position.set(-10, 2, -12);
    scene.add(rimLight);

    const topLight = new THREE.PointLight(0xe8f0ff, 500, 35);
    topLight.position.set(0, 18, 6);
    if (!isMobile) scene.add(topLight);

    const fillLight = new THREE.PointLight(0x300f00, 220, 30);
    fillLight.position.set(2, -8, 5);
    if (!isMobile) scene.add(fillLight);

    const redEmber   = new THREE.PointLight(0xDC1010, 500, 18);
    const amberEmber = new THREE.PointLight(0xEA4500, 380, 14);
    scene.add(redEmber);
    scene.add(amberEmber);

    const glowTexO = makeGlowTexture(220, 30, 20);
    const glowTexN = makeGlowTexture(234, 88, 12);

    const mol = new THREE.Group();
    const cen = new THREE.Vector3();
    ATOMS.forEach(a => cen.add(new THREE.Vector3(...a.pos)));
    cen.divideScalar(ATOMS.length);

    const matC = new THREE.MeshStandardMaterial({
      color: 0xd2d4e8,
      roughness: 0.28,
      metalness: 0.0,
      emissive: new THREE.Color(0x505878),
      emissiveIntensity: 0.55,
    });

    function hotMat(col: number, em: number, ei: number) {
      return new THREE.MeshStandardMaterial({
        color: col, roughness: 0.22, metalness: 0.35,
        emissive: em, emissiveIntensity: ei,
      });
    }
    const matO = hotMat(0x6b1010, 0xDC2626, 2.0);
    const matN = hotMat(0x5c2200, 0xEA580C, 1.8);

    const RADIUS = { C: 0.28, O: 0.34, N: 0.31 };
    const MATS   = { C: matC, O: matO, N: matN };
    const SPHERE_SEG = isMobile ? 14 : 32;
    const SPHERE_ROW = isMobile ? 10 : 22;

    const atomMeshes: THREE.Mesh[] = [];
    const sprites: THREE.Sprite[]  = [];
    const oPositions: THREE.Vector3[] = [];

    ATOMS.forEach(atom => {
      const wp = new THREE.Vector3(...atom.pos).sub(cen);
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS[atom.type], SPHERE_SEG, SPHERE_ROW),
        MATS[atom.type]
      );
      mesh.position.copy(wp);
      mesh.userData = { type: atom.type };
      mol.add(mesh);
      atomMeshes.push(mesh);

      if (atom.type === "O" || atom.type === "N") {
        const tex   = atom.type === "O" ? glowTexO : glowTexN;
        const scale = atom.type === "O" ? 3.4 : 2.8;
        const sm = new THREE.SpriteMaterial({
          map: tex,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          transparent: true,
          opacity: 0.60,
        });
        const sp = new THREE.Sprite(sm);
        sp.position.copy(wp);
        sp.scale.setScalar(scale);
        sp.userData = { type: atom.type, baseOpacity: 0.60 };
        mol.add(sp);
        sprites.push(sp);
        if (atom.type === "O") oPositions.push(wp.clone());
        if (atom.type === "N") amberEmber.position.copy(wp);
      }
    });

    if (oPositions.length) {
      const oc = new THREE.Vector3();
      oPositions.forEach(p => oc.add(p));
      oc.divideScalar(oPositions.length);
      redEmber.position.copy(oc);
    }

    const bondMat = new THREE.MeshStandardMaterial({
      color: 0xb8bcd2,
      roughness: 0.32,
      metalness: 0.0,
      emissive: new THREE.Color(0x3c4060),
      emissiveIntensity: 0.45,
    });
    const BOND_R = 0.068;
    const DBL_OFF = 0.12;
    const CYL_SEG = isMobile ? 6 : 10;

    BONDS.forEach(([ia, ib, dbl]) => {
      const pA = new THREE.Vector3(...ATOMS[ia].pos).sub(cen);
      const pB = new THREE.Vector3(...ATOMS[ib].pos).sub(cen);
      const dir = new THREE.Vector3().subVectors(pB, pA);
      const len = dir.length();
      const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
      const dn  = dir.clone().normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), dn);
      const perp = new THREE.Vector3(-dn.z, 0, dn.x).normalize();

      const offsets = dbl
        ? [perp.clone().multiplyScalar(-DBL_OFF), perp.clone().multiplyScalar(DBL_OFF)]
        : [new THREE.Vector3()];

      offsets.forEach(off => {
        const b = new THREE.Mesh(
          new THREE.CylinderGeometry(BOND_R, BOND_R, len, CYL_SEG),
          bondMat
        );
        b.position.copy(mid.clone().add(off));
        b.setRotationFromQuaternion(quat);
        mol.add(b);
      });
    });

    mol.rotation.x = Math.PI * 0.14;
    mol.rotation.z = -Math.PI * 0.06;

    let mol2: THREE.Group | null = null;
    if (isMobile) {
      // Móvil: una sola molécula centrada, más pequeña
      mol.position.set(0, 0, 0);
      mol.scale.setScalar(0.75);
      scene.add(mol);
    } else {
      // Desktop: dos moléculas a los lados
      mol.position.set(-7.5, 0, 0);
      scene.add(mol);
      mol2 = mol.clone(true);
      mol2.position.set(7.5, 0, 0);
      mol2.rotation.y = Math.PI * 0.35;
      scene.add(mol2);
    }

    function makeParticles(count: number, spread: number, size: number, color: number, opacity: number) {
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i*3]   = (Math.random() - 0.5) * spread;
        pos[i*3+1] = (Math.random() - 0.5) * spread * 0.65;
        pos[i*3+2] = (Math.random() - 0.5) * spread;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      return new THREE.Points(geo, new THREE.PointsMaterial({
        color, size, transparent: true, opacity,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
    }

    scene.add(makeParticles(isMobile ? 120 : 600, 80, 0.07, 0x3a0505, 0.60));
    scene.add(makeParticles(isMobile ?  60 : 300, 60, 0.05, 0x050a20, 0.45));
    scene.add(makeParticles(isMobile ?  30 : 120, 18, 0.05, 0x3a0a00, 0.40));

    const resizeObs = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObs.observe(container);

    const clock = new THREE.Clock();
    let rafId: number;

    function animate() {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      keyLight.intensity  = 1400 + Math.sin(t * 0.18) * 150;
      keyLight.position.x = 10 + Math.sin(t * 0.15) * 3;
      keyLight.position.z = 12 + Math.cos(t * 0.11) * 3;

      redEmber.intensity   = 500 + Math.sin(t * 1.3) * 140 + Math.sin(t * 3.1 + 0.4) * 60;
      amberEmber.intensity = 380 + Math.sin(t * 0.9 + 1.1) * 90;

      atomMeshes.forEach((m, i) => {
        if (m.userData.type === "O") {
          (m.material as THREE.MeshStandardMaterial).emissiveIntensity =
            1.8 + 0.5 * Math.sin(t * 1.4 + i * 0.9);
        } else if (m.userData.type === "N") {
          (m.material as THREE.MeshStandardMaterial).emissiveIntensity =
            1.6 + 0.35 * Math.sin(t * 1.1 + 0.5);
        }
      });

      sprites.forEach(sp => {
        const isO = sp.userData.type === "O";
        sp.material.opacity =
          sp.userData.baseOpacity +
          (isO ? 0.22 : 0.18) * Math.sin(t * 1.2 + (isO ? 0 : 0.8));
      });

      // Rotar mol2 levemente (solo desktop)
      if (mol2) mol2.rotation.y += 0.003;

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      controls.dispose();
      scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
        if (obj instanceof THREE.Sprite) {
          obj.material.map?.dispose();
          obj.material.dispose();
        }
      });
      glowTexO.dispose();
      glowTexN.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      aria-hidden="true"
    />
  );
}
