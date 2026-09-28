EARTH — ECOLOGICALLY RESTORED / LAYERED PBR GLB

Files: earth.glb, earth_day.jpg, earth_normal.jpg, earth_roughness.jpg, earth_cloud_opacity.png, earth_night_emission.jpg.
UVs: 2:1 equirectangular.
Layers: Earth_Surface r=1.000; Earth_Clouds r=1.012; Earth_Atmosphere r=1.028; Earth_Night_Lights_Helper r=1.002.
Three.js: rotate surface and clouds independently; use day/normal/roughness as PBR inputs; blend cloud opacity; apply a view-angle Fresnel/scattering term to atmosphere; gate night-emission with a night-side shader.
Geographic basis: bundled Blue Marble Next Generation / ETOPO reference data available with Matplotlib Basemap. Day texture is a derived greener restoration treatment; clouds and city-light map are independent.
