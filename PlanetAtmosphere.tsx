import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

export type AtmosphereProps = {
  earthRadius: number;
  /** Planet -> sun direction in world space. */
  sunDirection: THREE.Vector3;
  /** Rotation in radians / second, normally matched to the Earth rotation. */
  rotationSpeed?: number;
  /** Thickness of the atmosphere shell as a fraction of Earth radius. */
  atmosphereThickness?: number;
  intensity?: number;
  horizonPower?: number;
  rayleighStrength?: number;
  mieStrength?: number;
  skyTint?: THREE.ColorRepresentation;
  horizonTint?: THREE.ColorRepresentation;
  /** Optional grayscale land mask in the same UV layout as the Earth mesh. */
  landMask?: THREE.Texture;
  /** Very small desaturated green contribution from land beneath the shell. */
  landGreenInfluence?: number;
  landMaskGain?: number;
  renderOrder?: number;
};

export type CloudLayerProps = {
  earthRadius: number;
  cloudTexture: THREE.Texture;
  sunDirection: THREE.Vector3;
  /** Independent cloud rotation in radians / second. */
  rotationSpeed?: number;
  altitude?: number;
  opacity?: number;
  ambientLight?: number;
  sunStrength?: number;
  tint?: THREE.ColorRepresentation;
  alphaCutoff?: number;
  renderOrder?: number;
};

const ATMOSPHERE_VERTEX = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  varying vec2 vUv;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMOSPHERE_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform vec3 uCameraPosition;
  uniform vec3 uSunDirection;
  uniform vec3 uSkyTint;
  uniform vec3 uHorizonTint;
  uniform sampler2D uLandMask;

  uniform float uIntensity;
  uniform float uHorizonPower;
  uniform float uRayleighStrength;
  uniform float uMieStrength;
  uniform float uLandGreenInfluence;
  uniform float uLandMaskGain;

  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  varying vec2 vUv;

  const float PI = 3.14159265359;

  float rayleighPhase(float mu) {
    // Rayleigh phase function, scaled for an artistic real-time approximation.
    return 0.75 * (1.0 + mu * mu);
  }

  float henyeyGreenstein(float mu, float g) {
    float gg = g * g;
    float denom = pow(max(0.0001, 1.0 + gg - 2.0 * g * mu), 1.5);
    return (1.0 - gg) / (4.0 * PI * denom);
  }

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(uCameraPosition - vWorldPos);
    vec3 L = normalize(uSunDirection);

    // On a back-facing shell the center is approximately |N dot V| = 1,
    // while the silhouette approaches 0. This gives us a clean planetary rim.
    float viewTerm = clamp(1.0 - abs(dot(N, V)), 0.0, 1.0);
    float rim = pow(viewTerm, uHorizonPower);

    float sunFacing = dot(N, L);
    float day = smoothstep(-0.18, 0.62, sunFacing);

    float sunView = clamp(dot(V, L), -1.0, 1.0);
    float rayleigh = rayleighPhase(sunView);
    float mie = henyeyGreenstein(sunView, 0.76);

    float phase =
      uRayleighStrength * rayleigh +
      uMieStrength * mie;

    // Preserve a tiny amount of atmospheric energy near the terminator while
    // strongly favoring the illuminated hemisphere.
    float illumination = mix(0.055, 1.0, day);
    float scattering = rim * phase * illumination;

    // A second broad term keeps the silhouette soft rather than looking like
    // an emissive neon outline.
    float broadHorizon = pow(viewTerm, max(0.4, uHorizonPower * 0.55));
    float broad = broadHorizon * mix(0.03, 0.34, day);

    vec3 baseSky = mix(uHorizonTint, uSkyTint, 0.62);

    // Optional, deliberately tiny land influence. The mask should be grayscale
    // with black=non-land and white=land, matching the Earth UV layout.
    float land = texture2D(uLandMask, vUv).r;
    land = smoothstep(0.04, 0.92, land) * uLandMaskGain;
    vec3 subtleLandTint = vec3(0.018, 0.023, 0.014) *
      land * uLandGreenInfluence * rim * day;

    vec3 color = baseSky + subtleLandTint;

    float alpha = clamp(
      uIntensity * (0.82 * scattering + 0.18 * broad),
      0.0,
      0.78
    );

    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

const CLOUD_VERTEX = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  varying vec2 vUv;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CLOUD_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform sampler2D uCloudMap;
  uniform vec3 uCameraPosition;
  uniform vec3 uSunDirection;
  uniform vec3 uTint;
  uniform float uOpacity;
  uniform float uAmbientLight;
  uniform float uSunStrength;
  uniform float uAlphaCutoff;

  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(uCloudMap, vUv);
    float alpha = tex.a * uOpacity;

    // Explicitly remove near-zero alpha pixels. This prevents fully transparent
    // regions of a rectangular PNG from contributing any blended fragments.
    if (alpha < uAlphaCutoff) discard;

    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(uCameraPosition - vWorldPos);
    vec3 L = normalize(uSunDirection);

    float sunFacing = dot(N, L);
    float day = smoothstep(-0.25, 0.68, sunFacing);

    // Gentle terminator softening keeps clouds dimensional without a baked glow.
    float backScatter = pow(max(0.0, 1.0 - sunFacing), 2.0) * 0.055;
    float light = uAmbientLight + uSunStrength * day + backScatter;

    // Slight grazing brightening; deliberately restrained.
    float grazing = pow(1.0 - max(dot(N, V), 0.0), 2.5) * 0.045;

    vec3 color = tex.rgb * uTint * (light + grazing);
    gl_FragColor = vec4(color, alpha);
  }
`;

function createBlackMaskTexture() {
  const data = new Uint8Array([0, 0, 0, 255]);
  const texture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

export function AtmosphereShell({
  earthRadius,
  sunDirection,
  rotationSpeed = 0,
  atmosphereThickness = 0.018,
  intensity = 1.0,
  horizonPower = 3.6,
  rayleighStrength = 0.80,
  mieStrength = 0.16,
  skyTint = '#dceeff',
  horizonTint = '#f5fbff',
  landMask,
  landGreenInfluence = 0.75,
  landMaskGain = 0.5,
  renderOrder = 10,
}: AtmosphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const fallbackMask = useMemo(() => createBlackMaskTexture(), []);
  const material = useMemo(() => {
    const sky = new THREE.Color(skyTint);
    const horizon = new THREE.Color(horizonTint);

    return new THREE.ShaderMaterial({
      vertexShader: ATMOSPHERE_VERTEX,
      fragmentShader: ATMOSPHERE_FRAGMENT,
      uniforms: {
        uCameraPosition: { value: new THREE.Vector3() },
        uSunDirection: { value: new THREE.Vector3(0, 1, 0) },
        uSkyTint: { value: sky },
        uHorizonTint: { value: horizon },
        uLandMask: { value: fallbackMask },
        uIntensity: { value: intensity },
        uHorizonPower: { value: horizonPower },
        uRayleighStrength: { value: rayleighStrength },
        uMieStrength: { value: mieStrength },
        uLandGreenInfluence: { value: landGreenInfluence },
        uLandMaskGain: { value: landMaskGain },
      },
      side: THREE.BackSide,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
  }, []);

  useEffect(() => {
    material.uniforms.uSkyTint.value.set(skyTint);
    material.uniforms.uHorizonTint.value.set(horizonTint);
  }, [material, skyTint, horizonTint]);

  useEffect(() => {
    material.uniforms.uIntensity.value = intensity;
    material.uniforms.uHorizonPower.value = horizonPower;
    material.uniforms.uRayleighStrength.value = rayleighStrength;
    material.uniforms.uMieStrength.value = mieStrength;
    material.uniforms.uLandGreenInfluence.value = landGreenInfluence;
    material.uniforms.uLandMaskGain.value = landMaskGain;
    material.uniforms.uLandMask.value = landMask ?? fallbackMask;
  }, [
    material,
    intensity,
    horizonPower,
    rayleighStrength,
    mieStrength,
    landGreenInfluence,
    landMaskGain,
    landMask,
    fallbackMask,
  ]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    material.uniforms.uCameraPosition.value.copy(camera.position);
    material.uniforms.uSunDirection.value.copy(sunDirection).normalize();

    if (rotationSpeed !== 0) {
      meshRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  useEffect(() => {
    return () => {
      material.dispose();
      fallbackMask.dispose();
    };
  }, [material, fallbackMask]);

  return (
    <mesh
      ref={meshRef}
      renderOrder={renderOrder}
      frustumCulled
    >
      <sphereGeometry args={[earthRadius * (1 + atmosphereThickness), 96, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export function CloudShell({
  earthRadius,
  cloudTexture,
  sunDirection,
  rotationSpeed = 0.006,
  altitude = 0.010,
  opacity = 0.72,
  ambientLight = 0.08,
  sunStrength = 0.95,
  tint = '#ffffff',
  alphaCutoff = 0.004,
  renderOrder = 20,
}: CloudLayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: CLOUD_VERTEX,
        fragmentShader: CLOUD_FRAGMENT,
        uniforms: {
          uCloudMap: { value: cloudTexture },
          uCameraPosition: { value: new THREE.Vector3() },
          uSunDirection: { value: new THREE.Vector3(0, 1, 0) },
          uTint: { value: new THREE.Color(tint) },
          uOpacity: { value: opacity },
          uAmbientLight: { value: ambientLight },
          uSunStrength: { value: sunStrength },
          uAlphaCutoff: { value: alphaCutoff },
        },
        transparent: true,
        depthTest: true,
        depthWrite: false,
        side: THREE.FrontSide,
        blending: THREE.NormalBlending,
        toneMapped: true,
      }),
    [],
  );

  useEffect(() => {
    material.uniforms.uCloudMap.value = cloudTexture;
    material.uniforms.uTint.value.set(tint);
    material.uniforms.uOpacity.value = opacity;
    material.uniforms.uAmbientLight.value = ambientLight;
    material.uniforms.uSunStrength.value = sunStrength;
    material.uniforms.uAlphaCutoff.value = alphaCutoff;
  }, [
    material,
    cloudTexture,
    tint,
    opacity,
    ambientLight,
    sunStrength,
    alphaCutoff,
  ]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    material.uniforms.uCameraPosition.value.copy(camera.position);
    material.uniforms.uSunDirection.value.copy(sunDirection).normalize();

    if (rotationSpeed !== 0) {
      meshRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  return (
    <mesh
      ref={meshRef}
      renderOrder={renderOrder}
      frustumCulled
    >
      <sphereGeometry args={[earthRadius * (1 + altitude), 128, 80]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export type PlanetAtmosphereSystemProps = Omit<AtmosphereProps, 'earthRadius'> &
  Omit<CloudLayerProps, 'earthRadius' | 'sunDirection' | 'cloudTexture'> & {
    earthRadius: number;
    cloudTexture?: THREE.Texture;
    cloudRotationSpeed?: number;
  };

/**
 * Drop this next to an existing Earth mesh. The Earth itself remains untouched.
 */
export function PlanetAtmosphereSystem({
  earthRadius,
  sunDirection,
  rotationSpeed = 0,
  cloudRotationSpeed = 0.006,
  cloudTexture,
  atmosphereThickness,
  intensity,
  horizonPower,
  rayleighStrength,
  mieStrength,
  skyTint,
  horizonTint,
  landMask,
  landGreenInfluence,
  landMaskGain,
  altitude,
  opacity,
  ambientLight,
  sunStrength,
  tint,
  alphaCutoff,
  renderOrder,
}: PlanetAtmosphereSystemProps) {
  return (
    <>
      <AtmosphereShell
        earthRadius={earthRadius}
        sunDirection={sunDirection}
        rotationSpeed={rotationSpeed}
        atmosphereThickness={atmosphereThickness}
        intensity={intensity}
        horizonPower={horizonPower}
        rayleighStrength={rayleighStrength}
        mieStrength={mieStrength}
        skyTint={skyTint}
        horizonTint={horizonTint}
        landMask={landMask}
        landGreenInfluence={landGreenInfluence}
        landMaskGain={landMaskGain}
        renderOrder={renderOrder ?? 10}
      />

      {cloudTexture ? (
        <CloudShell
          earthRadius={earthRadius}
          cloudTexture={cloudTexture}
          sunDirection={sunDirection}
          rotationSpeed={cloudRotationSpeed}
          altitude={altitude}
          opacity={opacity}
          ambientLight={ambientLight}
          sunStrength={sunStrength}
          tint={tint}
          alphaCutoff={alphaCutoff}
          renderOrder={(renderOrder ?? 10) + 10}
        />
      ) : null}
    </>
  );
}
