"""می‌سازد: آیکون‌های کارنما از روی نقاب برداری لوگو.
اجرا: python3 make_icons.py <پوشه‌ی مقصد>
"""
import base64, io, sys
from PIL import Image

BG = (16, 16, 19)
GOLD = (208, 167, 35)

MASK_B64 = "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"

def mark():
    return Image.open(io.BytesIO(base64.b64decode(MASK_B64))).convert("L")

def build(size, ratio):
    m = mark()
    target = int(size * ratio)
    w, h = m.size
    scale = target / max(w, h)
    nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
    # supersample then shrink => smooth edges
    big = m.resize((nw * 4, nh * 4), Image.LANCZOS).resize((nw, nh), Image.LANCZOS)
    canvas = Image.new("RGB", (size, size), BG)
    gold = Image.new("RGB", (nw, nh), GOLD)
    canvas.paste(gold, ((size - nw) // 2, (size - nh) // 2), big)
    return canvas.quantize(colors=24)

def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "."
    # maskable: لوگو ۵۰% پهنا => ۲۵% فضای تنفس از هر طرف (safe zone اندروید)
    build(512, 0.50).save(f"{out}/icon-maskable.png", optimize=True)
    build(512, 0.62).save(f"{out}/icon-512.png", optimize=True)
    build(192, 0.62).save(f"{out}/icon-192.png", optimize=True)
    build(512, 0.70).save(f"{out}/logo-karnama.png", optimize=True)
    print("icons written to", out)

if __name__ == "__main__":
    main()
