"""ساخت آیکون‌های کارنما — بدون هیچ کتابخانه‌ی بیرونی.
اجرا: python3 make_icons.py <پوشه‌ی مقصد>

لوگو هندسی است: دو کمانِ هم‌ضخامت که به یک ساقه‌ی عمودی می‌رسند.
"""
import math
import struct
import sys
import zlib

BG = (16, 16, 19)
GOLD = (208, 167, 35)

# مختصات لوگو در جعبه‌ی مرجع ۶۴۰×۵۱۴
MW, MH = 640.0, 514.0
CX, CY = -3.0, 386.0      # مرکز کمان چپ (کمان راست قرینه‌ی آن است)
RI, RO = 255.0, 389.5     # شعاع داخلی و بیرونی
STEM = (RO - RI) / 2.0    # نیم‌پهنای ساقه


def inside(x, y):
    if y <= CY:
        if RI <= math.hypot(x - CX, y - CY) <= RO:
            return True
        return RI <= math.hypot(x - (MW - CX), y - CY) <= RO
    return abs(x - MW / 2.0) <= STEM


def alpha_map(nw, nh, ss=3):
    """پوشش هر پیکسل را با نمونه‌برداری فوق‌العاده حساب می‌کند تا لبه‌ها نرم شود."""
    sx, sy = MW / nw, MH / nh
    step = 1.0 / (ss + 1)
    out = bytearray(nw * nh)
    for py in range(nh):
        base = py * nw
        for px in range(nw):
            hit = 0
            for i in range(1, ss + 1):
                y = (py + i * step) * sy
                for j in range(1, ss + 1):
                    if inside((px + j * step) * sx, y):
                        hit += 1
            out[base + px] = hit * 255 // (ss * ss)
    return out


def png(size, rows):
    def chunk(tag, data):
        body = tag + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body))
    header = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", header)
            + chunk(b"IDAT", zlib.compress(bytes(rows), 9)) + chunk(b"IEND", b""))


def build(size, ratio):
    nw = max(1, int(size * ratio))
    nh = max(1, round(MH * nw / MW))
    alpha = alpha_map(nw, nh)
    ox, oy = (size - nw) // 2, (size - nh) // 2
    blend = [bytes(BG[i] + (GOLD[i] - BG[i]) * a // 255 for i in range(3)) for a in range(256)]
    rows = bytearray()
    for y in range(size):
        rows.append(0)  # filter type: none
        in_y = oy <= y < oy + nh
        for x in range(size):
            a = alpha[(y - oy) * nw + (x - ox)] if in_y and ox <= x < ox + nw else 0
            rows += blend[a]
    return png(size, rows)


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "."
    # maskable: لوگو ۵۰٪ پهنا، یعنی ۲۵٪ فضای تنفس از هر طرف (safe zone اندروید)
    specs = [("icon-maskable.png", 512, 0.50), ("icon-512.png", 512, 0.62),
             ("icon-192.png", 192, 0.62), ("logo-karnama.png", 512, 0.70)]
    for name, size, ratio in specs:
        with open("%s/%s" % (out, name), "wb") as f:
            f.write(build(size, ratio))
    print("icons written to", out)


if __name__ == "__main__":
    main()
