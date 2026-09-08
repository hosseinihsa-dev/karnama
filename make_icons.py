from PIL import Image, ImageDraw

def grad(S):
    im=Image.new('RGB',(S,S)); d=ImageDraw.Draw(im)
    c1=(214,175,52); c2=(138,107,20)
    for i in range(S*2):
        t=i/(S*2-1); c=tuple(int(c1[k]+(c2[k]-c1[k])*t) for k in range(3))
        d.line([(i,0),(0,i)],fill=c)
    return im

def kaf(S):
    F=4; W=S*F
    L=Image.new('RGBA',(W,W),(0,0,0,0)); d=ImageDraw.Draw(L)
    ink=(21,17,7,255); w=int(W*0.085)
    P=lambda p:[(x*W,y*W) for x,y in p]
    path=[(0.30,0.19),(0.30,0.44),(0.305,0.52),(0.325,0.585),(0.365,0.635),(0.425,0.665),(0.50,0.675),(0.74,0.675)]
    d.line(P(path),fill=ink,width=w,joint='curve')
    for x,y in P(path): d.ellipse([x-w/2,y-w/2,x+w/2,y+w/2],fill=ink)
    sl=[(0.395,0.455),(0.585,0.345)]; sw=int(w*0.85)
    d.line(P(sl),fill=ink,width=sw,joint='curve')
    for x,y in P(sl): d.ellipse([x-sw/2,y-sw/2,x+sw/2,y+sw/2],fill=ink)
    return L.resize((S,S),Image.LANCZOS)

def make(S,pad,out):
    im=Image.new('RGB',(S,S),(16,17,20))
    mask=Image.new('L',(S,S),0)
    ImageDraw.Draw(mask).rounded_rectangle([pad,pad,S-pad-1,S-pad-1],radius=int((S-2*pad)*0.24),fill=255)
    im.paste(grad(S),(0,0),mask)
    g=kaf(S); sc=(S-2*pad)/S
    if sc<1:
        g2=g.resize((int(S*sc),int(S*sc)),Image.LANCZOS); im.paste(g2,(pad,pad),g2)
    else:
        im.paste(g,(0,0),g)
    im.save(out)

if __name__=='__main__':
    import sys
    o=sys.argv[1] if len(sys.argv)>1 else '.'
    make(192,0,f'{o}/icon-192.png'); make(512,0,f'{o}/icon-512.png'); make(512,58,f'{o}/icon-maskable.png')
