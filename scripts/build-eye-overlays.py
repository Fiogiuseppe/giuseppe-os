#!/usr/bin/env python3
"""Build transparent eye blink overlays from aligned open/closed portrait pair."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OPEN_PATH = ROOT / "public/avatar/avatar-eyes-open.png"
CLOSED_PATH = ROOT / "public/images/jewel-face_closed.png"
OUT_DIR = ROOT / "public/avatar"

# Tight eye-only regions on 1024x1024 portrait (cx, cy, rx, ry per eye)
EYE_ELLIPSES = (
    (386, 428, 62, 30),
    (638, 428, 62, 30),
)

# Crop box for mid-frame blend — eyes only, no brow or cheeks
EYE_BOX = (312, 398, 712, 458)

DIFF_THRESHOLD = 18
MASK_BLUR = 7.0
MASK_EXPAND = 1
REGION_MASK_BLUR = 5.5


def load_rgba(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def remove_background_flood(image: Image.Image, threshold: int = 40) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    visited = set()
    stack: list[tuple[int, int]] = []

    for x in range(width):
        stack.append((x, 0))
        stack.append((x, height - 1))
    for y in range(height):
        stack.append((0, y))
        stack.append((width - 1, y))

    def is_background(x: int, y: int) -> bool:
        r, g, b, _a = pixels[x, y]
        return r <= threshold and g <= threshold and b <= threshold

    while stack:
        x, y = stack.pop()
        if (x, y) in visited:
            continue
        if x < 0 or y < 0 or x >= width or y >= height:
            continue
        if not is_background(x, y):
            continue

        visited.add((x, y))
        pixels[x, y] = (0, 0, 0, 0)
        stack.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])

    return rgba


def build_eye_region_mask(size: tuple[int, int]) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    for cx, cy, rx, ry in EYE_ELLIPSES:
        draw.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=255)
    return mask.filter(ImageFilter.GaussianBlur(REGION_MASK_BLUR))


def build_change_mask(open_img: Image.Image, compare_img: Image.Image) -> Image.Image:
    diff = ImageChops.difference(open_img.convert("RGB"), compare_img.convert("RGB"))
    diff_gray = diff.convert("L")
    diff_mask = diff_gray.point(lambda value: 255 if value > DIFF_THRESHOLD else 0)

    region_mask = build_eye_region_mask(open_img.size)
    mask = ImageChops.lighter(diff_mask, region_mask)

    if MASK_EXPAND > 0:
        mask = mask.filter(ImageFilter.MaxFilter(MASK_EXPAND * 2 + 1))

    if MASK_BLUR > 0:
        mask = mask.filter(ImageFilter.GaussianBlur(MASK_BLUR))

    return mask


def apply_mask_to_overlay(source: Image.Image, mask: Image.Image) -> Image.Image:
    overlay = Image.new("RGBA", source.size, (0, 0, 0, 0))
    overlay.paste(source, (0, 0), mask)
    return remove_background_flood(overlay, threshold=28)


def blend_in_box(
    open_img: Image.Image,
    closed_img: Image.Image,
    amount: float,
    box: tuple[int, int, int, int],
) -> Image.Image:
    blended = open_img.copy()
    region_open = open_img.crop(box)
    region_closed = closed_img.crop(box)
    mixed = Image.blend(region_open, region_closed, amount)
    blended.paste(mixed, box)
    return blended


def restrict_mask_to_eyes(mask: Image.Image, size: tuple[int, int]) -> Image.Image:
    eye_mask = build_eye_region_mask(size)
    return ImageChops.multiply(mask, eye_mask)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    open_img = load_rgba(OPEN_PATH)
    closed_img = load_rgba(CLOSED_PATH)

    if open_img.size != closed_img.size:
        raise SystemExit(f"Size mismatch: {open_img.size} vs {closed_img.size}")

    transparent_open = remove_background_flood(open_img)
    transparent_open.save(OPEN_PATH, optimize=True)

    # Full closed overlay — only pixels that differ from open
    closed_mask = restrict_mask_to_eyes(build_change_mask(open_img, closed_img), open_img.size)
    overlay_closed = apply_mask_to_overlay(closed_img, closed_mask)
    overlay_closed.save(OUT_DIR / "avatar-eyes-overlay-closed.png", optimize=True)

    # Mid overlay — 55% toward closed in eye box
    mid_img = blend_in_box(open_img, closed_img, 0.62, EYE_BOX)
    mid_mask = restrict_mask_to_eyes(build_change_mask(open_img, mid_img), open_img.size)
    overlay_mid = apply_mask_to_overlay(mid_img, mid_mask)
    overlay_mid.save(OUT_DIR / "avatar-eyes-overlay-mid.png", optimize=True)

    print("Wrote:")
    print(f"  {OPEN_PATH} (transparent background)")
    print(f"  {OUT_DIR / 'avatar-eyes-overlay-mid.png'}")
    print(f"  {OUT_DIR / 'avatar-eyes-overlay-closed.png'}")


if __name__ == "__main__":
    main()
