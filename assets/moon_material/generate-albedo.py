from pathlib import Path
import numpy as np
from PIL import Image

SIZE = 2048
RNG = np.random.default_rng(314159)


def tileable_noise(cells: int) -> np.ndarray:
    small = RNG.uniform(0, 255, (cells, cells)).astype(np.uint8)
    tiled = Image.fromarray(np.tile(small, (3, 3)), 'L').resize((SIZE * 3, SIZE * 3), Image.Resampling.BICUBIC)
    crop = np.asarray(tiled.crop((SIZE, SIZE, SIZE * 2, SIZE * 2)), dtype=np.float32)
    return (crop - 127.5) / 72.0


# Subtle albedo variation across a broad dust field, from maria to ejecta.
field = (
    tileable_noise(5) * 11 + tileable_noise(13) * 7 + tileable_noise(38) * 5
    + tileable_noise(110) * 3.5 + tileable_noise(320) * 2.4 + tileable_noise(900) * 1.3
)
height, width = field.shape

# Small overlapping, edge-wrapped impact bowls and raised rims. Albedo stays
# restrained; the supplied PBR normal map provides most of the surface relief.
y_grid = np.arange(height)
x_grid = np.arange(width)
for _ in range(175):
    cx, cy = RNG.integers(0, width), RNG.integers(0, height)
    radius = float(RNG.choice([1, 1, 1, 2, 2, 3, 4, 5, 7, 9, 12, 15, 19, 25]))
    reach = int(radius * 1.65) + 2
    xs = np.arange(cx - reach, cx + reach + 1)
    ys = np.arange(cy - reach, cy + reach + 1)
    dx = ((xs - cx + width / 2) % width) - width / 2
    dy = ((ys - cy + height / 2) % height) - height / 2
    d = np.sqrt((dy[:, None] / radius) ** 2 + (dx[None, :] / radius) ** 2)
    strength = float(RNG.uniform(2.5, 8.5)) * (1.0 if radius < 8 else .72)
    bowl = -strength * np.exp(-((d / .78) ** 2) * 2.4)
    rim = strength * .64 * np.exp(-(((d - 1.0) / .12) ** 2))
    ejecta = strength * .10 * np.exp(-(((d - 1.22) / .19) ** 2))
    field[np.ix_(ys % height, xs % width)] += bowl + rim + ejecta

base = np.clip(139 + field, 92, 180).astype(np.uint8)
# Slightly warm regolith under the cool scene light, with a neutral grayscale feel.
rgb = np.stack((np.clip(base.astype(np.int16) + 3, 0, 255), base,
                np.clip(base.astype(np.int16) - 3, 0, 255)), axis=-1).astype(np.uint8)
out = Path(__file__).with_name('lunar-albedo.webp')
Image.fromarray(rgb, 'RGB').save(out, 'WEBP', quality=93, method=6)
print(out)
