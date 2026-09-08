# Pure-python PNG icon generator (no third-party deps).
import zlib, struct, math

SEGS = [((0.30,0.19),(0.30,0.44)),((0.30,0.44),(0.305,0.52)),((0.305,0.52),(0.325,0.585)),
        ((0.325,0.585),(0.365,0.635)),((0.365,0.635),(0.425,0.665)),((0.425,0.665),(0.50,0.675)),
        ((0.50,0.675),(0.74,0.675))]
SLASH = ((0.395,0.455),(0.585,0.345))
INK = (21,17,7)
BG  = (16,17,20)

def dseg(px,py,a,b):
    ax,ay=a; bx,by=b
    dx,dy=bx-ax,by-ay
    L=dx*dx+dy*dy
    t=0.0 if L==0 else max(0.0,min(1.0,((px-ax)*dx+(py-ay)*dy)/L))
    return math.hypot(px-(ax+t*dx), py-(ay+t*dy))

def cov(px,py,segs,w):
    d=min(dseg(px,py,a,b) for a,b in segs)
    e=0.0035
    return max(0.0,min(1.0,(w/2 + e - d)/(2*e)))

def rrect(px,py,pad,r):
    lo,hi=pad,1.0-pad
    cx=min(max(px,lo+r),hi-r); cy=min(max(py,lo+r),hi-r)
    d=math.hypot(px-cx,py-cy)
    if px<lo or px>hi or py<lo or py>hi: return 0.0
    e=0.004
    return max(0.0,min(1.0,(r+e-d)/(2*e)))

def png(path,S,pad):
    r=(1.0-2*pad)*0.24
    gw=0.085*(1-2*pad); sw=gw*0.85
    off=pad; sc=1.0-2*pad
    segs=[((a[0]*sc+off,a[1]*sc+off),(b[0]*sc+off,b[1]*sc+off)) for a,b in SEGS]
    sl=[((SLASH[0][0]*sc+off,SLASH[0][1]*sc+off),(SLASH[1][0]*sc+off,SLASH[1][1]*sc+off))]
    rows=bytearray()
    for y in range(S):
        rows.append(0)
        py=(y+0.5)/S
        for x in range(S):
            px=(x+0.5)/S
            t=(px+py)/2.0
            g=(int(214+(138-214)*t), int(175+(107-175)*t), int(52+(20-52)*t))
            a=rrect(px,py,pad,r)
            c=[int(BG[i]+(g[i]-BG[i])*a) for i in range(3)]
            k=max(cov(px,py,segs,gw), cov(px,py,sl,sw))
            if k>0:
                c=[int(c[i]+(INK[i]-c[i])*k) for i in range(3)]
            rows += bytes(c)
    def chunk(t,d):
        return struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
    data=b'\x89PNG\r\n\x1a\n'
    data+=chunk(b'IHDR',struct.pack('>IIBBBBB',S,S,8,2,0,0,0))
    data+=chunk(b'IDAT',zlib.compress(bytes(rows),9))
    data+=chunk(b'IEND',b'')
    open(path,'wb').write(data)

if __name__=='__main__':
    import sys
    o=sys.argv[1] if len(sys.argv)>1 else '.'
    png(f'{o}/icon-192.png',192,0.0)
    png(f'{o}/icon-512.png',512,0.0)
    png(f'{o}/icon-maskable.png',512,0.113)
