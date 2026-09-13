"""ساخت آیکون‌های کارنما — بدون هیچ کتابخانه‌ی بیرونی.
اجرا: python3 make_icons.py <پوشه‌ی مقصد>
"""
import base64, struct, sys, zlib

BG = (16, 16, 19)
GOLD = (208, 167, 35)
MW, MH = 640, 514
MASK_B64 = "eNrt28ERggAQBEHzTxoz8IGUg2xPBtx28aE4jk+9pC87Lskd9WNyOOpG5CjUbeRBqFweidwxKPQYZI9BoUcheQwKPgLZo1DoIQgfgqIPQfYY1LQ9BOkjUNv4IGSPQPiEIH0Iwoeg6AMQPgRFH4LwESj6CKQPQbFHIH4Eij4C4UNQ9AFIH4GiD0H6CKRPANJHIH1CkD4A6ROB9CFInwjED0D6BCB9CNInAPEjkD4BSB+B9IlA/AikTwTiByB9AtDQBMKnRYAWJhA/TQo0LYD4aRKgVQHET5MC7UkgfZoEaEkC8dMmQCMSiJ8mAZoPQPw0CdByBOKnSYA2AxA/bQo0F4D4aVOgpQDET5sArQQgfZoEaCAA8dMkQNsQiJ82AZoFQPo0CdAiAOKnTYHGABA/TQK0A4D4aROgDQDET5sCnV/4aROg0ysE6PAKATq7QoCOrhCgkysE6OAKATq3QoCOrRCgUysE6NAKATqzQoFurBCgCysE6L4KAbquQn+OqxCg0yoE6LAKATqrQoCOqhCgkyoE6KAKATqnQoCOqRCgUyoE6JAKATqjQn+uqBCgG6oE6IQKATqgQoDOp9Cf6ykE6HYKAbrcqeO6yUUAHe7rMzraeYDOdlz1CdMZ3SyB56xnr8md31jDs6LHYHlc10EwPLHLUBie2UkQDK/tHAiWF3cLCMObOwOB4eWdAMHw+vQRGA4AH4PhBuwhGA5BH4HlFvQhGM7BHoLhJPgBGI5CH4HlLvAxGG5DH4DhPPQRWC5EH4LhRvQBGM5EH4HhUvAhGI5FH4HlXvgBGC5GH4D80bdG8FmPQeB/LocfgOF09BFYzkcfgOGA9BEo/Aikj0DhByB9AAo/AukDUPQRiB+Awo9A/ACkTwDiByB9AhA/AvETgPQRiJ8AxA9A/AgUfQDiB6DwAxA/AIUfgfgBKPwAxA9A0QcgfgDiJwDxAxA/AYgfgPgJQPwAxE8A4gcgfgIQPwDxE4D4AYifAMQPQPwEIH8A4icA8QMQP/GHH4D4CUD8AMQPQPwEIH784ScA+QMQPwGIH3/4CUD+AORPAOLHH34CkD8A8ROA+AHIn/jDD0D8BCB+/OEnAPkDED/N+7MwgPxpFKB5AeRPo/6MCyB+GgVoWf7w0yZAs/LHn0YBGpU//DQK0KQA4if+BCB+GvJnTQD50yhAU/LHn0YBGpI//jQK0Iz84adRgEbkjz+NAjQhgPxp1J8BAcRP/AlA/rTkz3gA8qdRf6bjjz+NAjQcf/hpFKDZ+ONPowCNxh9/GgVoMv7wE38CkD8t+bMXgPxpFaC18MNPowCNxR9+GgVoKv740yhAQ/HHn1YB2ok//MSf+ONPSwCNxB9/GvVnIwD5E38CkD9N+TMQf/yJPwGIn/gTf/jp+QCNwx9/4k8A4if+xB9/GgBoGf7wE3/ijz/xJwDxE3/ijz891J9VAORP/Ik//sSfAORPA/5Mwh9/4k8A8ifvP/GHnwYAGoQ//sSf+ONPU/7sASB/4k/88acpf9bgjz/xJwD5E3/ijz/xJ/74E3/ijz899DSAtuCPP/En/vgTf+IPP/En/vgTf+KPP/En/vgTf+KPP/En/vgTf+KPP/En/vgTf+KPP/En/vgTf+KPP/74408A4o8//sSf+ONP/Ik//sSf+ONP/Ik//sSf+ONP/Ik//sSf+ONP/Ik//sSf+ONP/Ik//sSf+ONP/PEn/vgTf+KPP/74E3/ijz/xx5/440/88Sf++BN//Ik//sQff+KPP/HHn/jjT/zxJ/74E3/8iT/++ONP/PHHn/jjjz/xxx9/4o8//sQff/yJP/74E3/8iT/+xB9/4o8/8cef+ONP/PEn/vjjjz/xx5/440/88cef+ONP/PEn/vgTf/yJP/7EH3/ijz/xx5/440/88Sf++ONP/PEn/vjjjz/+xB9//Ik//vgTf/yJP/7EH3/ijz/xx5/440/88Sf++BN//Ik//sQff/yJP/74E3/88Zf1BsEtcuI="


def mask():
    return zlib.decompress(base64.b64decode(MASK_B64))


def scaled_alpha(m, nw, nh):
    """نقاب را با میانگین‌گیری مساحتی کوچک می‌کند تا لبه‌ها نرم بماند."""
    out = bytearray(nw * nh)
    for y in range(nh):
        y0, y1 = y * MH // nh, max(y * MH // nh + 1, (y + 1) * MH // nh)
        for x in range(nw):
            x0, x1 = x * MW // nw, max(x * MW // nw + 1, (x + 1) * MW // nw)
            total = 0
            for yy in range(y0, y1):
                row = yy * MW
                total += sum(m[row + x0:row + x1])
            out[y * nw + x] = total // ((y1 - y0) * (x1 - x0))
    return out


def png(size, rows):
    def chunk(tag, data):
        body = tag + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body))
    head = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", head)
            + chunk(b"IDAT", zlib.compress(rows, 9)) + chunk(b"IEND", b""))


def build(size, ratio):
    m = mask()
    target = int(size * ratio)
    nw = target
    nh = max(1, round(MH * target / MW))
    alpha = scaled_alpha(m, nw, nh)
    ox, oy = (size - nw) // 2, (size - nh) // 2
    rows = bytearray()
    for y in range(size):
        rows.append(0)  # filter: none
        inside_y = oy <= y < oy + nh
        for x in range(size):
            a = alpha[(y - oy) * nw + (x - ox)] if inside_y and ox <= x < ox + nw else 0
            if a == 0:
                rows += bytes(BG)
            elif a == 255:
                rows += bytes(GOLD)
            else:
                rows += bytes((BG[i] + (GOLD[i] - BG[i]) * a // 255) for i in range(3))
    return png(size, bytes(rows))


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "."
    # maskable: لوگو ۵۰٪ پهنا => ۲۵٪ فضای تنفس از هر طرف (safe zone اندروید)
    specs = [("icon-maskable.png", 512, 0.50), ("icon-512.png", 512, 0.62),
             ("icon-192.png", 192, 0.62), ("logo-karnama.png", 512, 0.70)]
    for name, size, ratio in specs:
        with open(f"{out}/{name}", "wb") as f:
            f.write(build(size, ratio))
    print("icons written to", out)


if __name__ == "__main__":
    main()
