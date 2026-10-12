"""Montagem de um "cacho": raminho com folhas desenhado numa carta quadrada.

Cada folha plana (folhagem_folha.FolhaPlana) é colocada em 3D sobre a carta
(inclinação, torção, dobra em V na nervura central, curvatura) e projetada
de frente: assim aparecem o encurtamento natural, as metades da folha com
larguras diferentes e, quando a folha está virada, a face de baixo (mais
clara). Para cada pixel guarda-se também a normal da superfície no espaço
da carta (x para a direita, y para o topo da imagem, z saindo da carta), que
vira o mapa normal opcional.

Coordenadas: "unidades de carta" de 0 a 1, com y PARA CIMA (y = 0 é a borda
de baixo, onde o raminho entra). Internamente tudo é desenhado com
superamostragem 2x e reduzido no fim.
"""
import math
import numpy as np
import cv2
from folhagem_nucleo import suave, ruido_fractal, misturar, cor


def _norm(v):
    return v / (np.linalg.norm(v, axis=-1, keepdims=True) + 1e-12)


class Carta:
    def __init__(self, tamanho=1024, ss=2, margem=0.012, oclusao=0.22, raio_oclusao=0.012):
        self.tam = tamanho
        self.ss = ss
        self.N = tamanho * ss
        self.margem = margem
        self.oclusao = oclusao
        self.raio_oclusao = raio_oclusao
        self.camadas = []

    # ------------------------------------------------------------ geometria da folha
    @staticmethod
    def _base3d(phi, beta, rho):
        cp, sp, cb, sb = math.cos(phi), math.sin(phi), math.cos(beta), math.sin(beta)
        a = np.array([cb * cp, cb * sp, sb])
        s0 = np.array([-sp, cp, 0.0])
        n0 = np.array([-sb * cp, -sb * sp, cb])
        s = s0 * math.cos(rho) + n0 * math.sin(rho)
        n = n0 * math.cos(rho) - s0 * math.sin(rho)
        return a, s, n

    def _params(self, fp, B, phi, beta, rho, dobra, L, cn, cs):
        a, s, n = self._base3d(math.radians(phi), math.radians(beta), math.radians(rho))
        K = cn * n + cs * s
        f = math.radians(dobra)
        g = {+1: s * math.cos(f) + n * math.sin(f), -1: -s * math.cos(f) + n * math.sin(f)}
        Bp = np.array([B[0] * self.N, B[1] * self.N])
        return a, s, n, K, g, Bp, L * self.N

    def _contorno_proj(self, fp, B, phi, beta, rho, dobra, L, cn, cs):
        """Pontos projetados (px, y para cima) da parte opaca da folha."""
        a, s, n, K, g, Bp, Lp = self._params(fp, B, phi, beta, rho, dobra, L, cn, cs)
        m = fp.alfa[::3, ::3] > 0.3
        lin, col = np.nonzero(m)
        S = fp.s1 - lin * 3 / fp.P
        X = (col * 3 - fp.alfa.shape[1] / 2.0) / fp.P
        lam = S - fp.s0
        sig = np.where(X >= 0, 1, -1)
        u = np.abs(X)
        pts = np.zeros((len(S), 3))
        for sg in (1, -1):
            sel = sig == sg
            pts[sel] = (lam[sel, None] * a + u[sel, None] * g[sg] + (lam[sel] ** 2)[:, None] * K) * Lp
        return pts[:, :2] + Bp

    def cabe(self, fp, B, phi, beta, rho, dobra, L, cn=0.0, cs=0.0):
        p = self._contorno_proj(fp, B, phi, beta, rho, dobra, L, cn, cs) / self.N
        m = self.margem
        return bool(p[:, 0].min() > m and p[:, 0].max() < 1 - m and p[:, 1].min() > m and p[:, 1].max() < 1 - m)

    # ------------------------------------------------------------ desenhar folha
    def folha(self, fp, B, phi, beta, rho, dobra, L, cn=0.0, cs=0.0, z_extra=0.0, escurecer_base=0.12,
              brilho=0.0):
        """Projeta a folha plana na carta.

        B: ponto de inserção do pecíolo (unidades de carta, y para cima).
        phi: direção da nervura no plano da carta (graus, 90 = para cima).
        beta: inclinação para fora da carta (+ vem para o observador).
        rho: torção da lâmina em torno da nervura (±180 mostra a face de baixo).
        dobra: ângulo da dobra em V de cada metade (graus).
        L: comprimento da lâmina (unidades de carta). cn, cs: curvatura (fração de L).
        """
        a, s, n, K, g, Bp, Lp = self._params(fp, B, phi, beta, rho, dobra, L, cn, cs)
        pts = self._contorno_proj(fp, B, phi, beta, rho, dobra, L, cn, cs)
        N = self.N
        x0 = int(max(0, math.floor(pts[:, 0].min()) - 4)); x1 = int(min(N, math.ceil(pts[:, 0].max()) + 4))
        y0 = int(max(0, math.floor(pts[:, 1].min()) - 4)); y1 = int(min(N, math.ceil(pts[:, 1].max()) + 4))
        if x1 <= x0 or y1 <= y0:
            return
        # grade de pixels (centro), y para cima
        xs = np.arange(x0, x1, dtype=np.float64) + 0.5
        ys = np.arange(y1 - 1, y0 - 1, -1, dtype=np.float64) + 0.5     # linhas de cima para baixo
        QX, QY = np.meshgrid(xs, ys)
        qx = (QX - Bp[0]) / Lp
        qy = (QY - Bp[1]) / Lp
        h, w = QX.shape
        # derivadas do relevo na folha plana (por unidade de folha)
        gl, gc = np.gradient(fp.alt)
        dS = (-gl * fp.P).astype(np.float32)
        dX = (gc * fp.P).astype(np.float32)
        metades = []
        A2 = a[:2]; K2 = K[:2]
        for sg in (1, -1):
            G = g[sg]
            G2 = G[:2]
            det = A2[0] * G2[1] - A2[1] * G2[0]
            if abs(det) < 0.04:
                continue
            lam = (qx * G2[1] - qy * G2[0]) / det
            u = (A2[0] * qy - A2[1] * qx) / det
            for _ in range(5):
                Jx0 = A2[0] + 2 * lam * K2[0]; Jy0 = A2[1] + 2 * lam * K2[1]
                Fx = lam * A2[0] + u * G2[0] + lam * lam * K2[0] - qx
                Fy = lam * A2[1] + u * G2[1] + lam * lam * K2[1] - qy
                dt = Jx0 * G2[1] - Jy0 * G2[0]
                dt = np.where(np.abs(dt) < 1e-6, 1e-6, dt)
                dlam = (Fx * G2[1] - Fy * G2[0]) / dt
                du = (Jx0 * Fy - Jy0 * Fx) / dt
                lam -= dlam; u -= du
            S = fp.s0 + lam
            X = sg * u
            mapc = (X * fp.P + fp.alfa.shape[1] / 2.0).astype(np.float32)
            mapl = ((fp.s1 - S) * fp.P).astype(np.float32)
            amostra = lambda img: cv2.remap(img, mapc, mapl, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
            alfa = amostra(fp.alfa)
            larg_px = Lp * np.linalg.norm(G2)
            alfa = alfa * np.clip(0.5 + u * larg_px, 0, 1).astype(np.float32)
            if alfa.max() <= 0:
                continue
            # normal geométrica (com curvatura) e lado visível
            T = a[None, None, :] + 2 * lam[..., None] * K[None, None, :]
            Nn = sg * np.cross(T, G[None, None, :])
            Nn = _norm(Nn)
            Th = _norm(T)
            gS = amostra(dS)[..., None]; gX = amostra(dX)[..., None]
            Np = _norm(Nn - (gS * Th + gX * sg * G[None, None, :]) * 1.0)
            frente = Nn[..., 2] >= 0
            Nvis = np.where(frente[..., None], Np, -Np)
            corsup = amostra(fp.sup); corinf = amostra(fp.inf)
            c = np.where(frente[..., None], corsup, corinf)
            # base da folha levemente mais escura (onde as folhas se sobrepõem no raminho)
            c = c * (1 - escurecer_base * suave(0.22, -0.05, S))[..., None]
            if brilho:
                c = c * (1 + brilho * np.clip(Nvis[..., 1] * 0.6 + Nvis[..., 2] * 0.4 - 0.55, -0.4, 0.4))[..., None]
            z = (lam * a[2] + u * G[2] + lam * lam * K[2]) * Lp
            metades.append((alfa, c.astype(np.float32), Nvis.astype(np.float32), z))
        if not metades:
            return
        if len(metades) == 1:
            al, c, nv, _ = metades[0]
        else:
            (a1, c1, n1, z1), (a2, c2, n2, z2) = metades
            f1 = (z1 >= z2)[..., None]
            af = np.where(f1[..., 0], a1, a2); ab = np.where(f1[..., 0], a2, a1)
            cf = np.where(f1, c1, c2); cb = np.where(f1, c2, c1)
            nf = np.where(f1, n1, n2); nb = np.where(f1, n2, n1)
            al = af + ab * (1 - af)
            wf = (af / np.maximum(al, 1e-6))[..., None]
            c = cf * wf + cb * (1 - wf)
            nv = _norm(nf * wf + nb * (1 - wf))
        zc = (0.5 * (fp.s1 - fp.s0)) * a[2] * Lp + z_extra * N
        r0 = N - y1
        self.camadas.append(dict(z=zc, r0=r0, c0=x0, alfa=al.astype(np.float32), cor=c.astype(np.float32),
                                 normal=nv.astype(np.float32)))

    # ------------------------------------------------------------ galhos
    def galho(self, pontos, raios, cor_base, cor_ponta=None, rng=None, z=0.0, rugoso=0.08, nos=None):
        """Raminho como tubo afinando ao longo de uma polilinha (unidades de carta, y para cima)."""
        rng = rng or np.random.default_rng(0)
        P = np.asarray(pontos, np.float64) * self.N
        R = np.asarray(raios, np.float64) * self.N
        # reamostra suavemente
        seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
        t = np.concatenate([[0], np.cumsum(seg)])
        tt = np.linspace(0, t[-1], max(8, int(t[-1] / 6)))
        P = np.stack([np.interp(tt, t, P[:, 0]), np.interp(tt, t, P[:, 1])], -1)
        R = np.interp(tt, t, R)
        comp_total = tt[-1]
        N = self.N
        x0 = int(max(0, math.floor((P[:, 0] - R).min()) - 3)); x1 = int(min(N, math.ceil((P[:, 0] + R).max()) + 3))
        y0 = int(max(0, math.floor((P[:, 1] - R).min()) - 3)); y1 = int(min(N, math.ceil((P[:, 1] + R).max()) + 3))
        if x1 <= x0 or y1 <= y0:
            return
        xs = np.arange(x0, x1) + 0.5
        ys = np.arange(y1 - 1, y0 - 1, -1) + 0.5
        QX, QY = np.meshgrid(xs, ys)
        melhor = np.full(QX.shape, 1e9)
        lado = np.full(QX.shape, 1e6); rad = np.ones(QX.shape); tpar = np.zeros(QX.shape)
        dirx = np.zeros(QX.shape); diry = np.zeros(QX.shape)
        Hh, Ww = QX.shape
        for i in range(len(P) - 1):
            p, q = P[i], P[i + 1]
            rmax = max(R[i], R[i + 1]) + 3
            # janela local do segmento (linhas de cima para baixo)
            jx0 = max(0, int(math.floor(min(p[0], q[0]) - rmax)) - x0); jx1 = min(Ww, int(math.ceil(max(p[0], q[0]) + rmax)) - x0)
            jr0 = max(0, (y1 - 1) - int(math.ceil(max(p[1], q[1]) + rmax))); jr1 = min(Hh, (y1 - 1) - int(math.floor(min(p[1], q[1]) - rmax)) + 1)
            if jx1 <= jx0 or jr1 <= jr0:
                continue
            jan = (slice(jr0, jr1), slice(jx0, jx1))
            qx, qy = QX[jan], QY[jan]
            d = q - p
            L2 = d @ d + 1e-9
            tq = np.clip(((qx - p[0]) * d[0] + (qy - p[1]) * d[1]) / L2, 0, 1)
            cx = p[0] + tq * d[0]; cy = p[1] + tq * d[1]
            dist = np.hypot(qx - cx, qy - cy)
            rr = R[i] + (R[i + 1] - R[i]) * tq
            norm_d = dist / rr
            sel = norm_d < melhor[jan]
            melhor[jan] = np.where(sel, norm_d, melhor[jan])
            cr = (d[0] * (qy - p[1]) - d[1] * (qx - p[0])) / math.sqrt(L2)
            lado[jan] = np.where(sel, np.sign(cr) * dist, lado[jan])
            rad[jan] = np.where(sel, rr, rad[jan])
            tpar[jan] = np.where(sel, (tt[i] + tq * math.sqrt(L2)) / comp_total, tpar[jan])
            dirx[jan] = np.where(sel, d[0] / math.sqrt(L2), dirx[jan]); diry[jan] = np.where(sel, d[1] / math.sqrt(L2), diry[jan])
        alfa = np.clip((rad - np.abs(lado)) + 0.5, 0, 1).astype(np.float32)
        o = np.clip(lado / rad, -1, 1)
        # normal de cilindro: perpendicular no plano * o + z * sqrt(1-o²)
        px_, py_ = -diry, dirx
        nz = np.sqrt(np.clip(1 - o * o, 0, 1))
        nrm = np.stack([px_ * o, py_ * o, nz], -1).astype(np.float32)
        cb = np.asarray(cor_base, np.float32)
        cp = np.asarray(cor_ponta if cor_ponta is not None else cor_base, np.float32)
        c = misturar(cb, cp, suave(0.0, 1.0, tpar))
        h, w = alfa.shape
        estria = ruido_fractal(rng, h, w, 6.0, oitavas=2, aniso=(1.0, 1.0))
        c = c * (1 + rugoso * estria[..., None])
        c = c * (0.86 + 0.14 * nz)[..., None]          # arredondado bem leve
        if nos:
            for tn in nos:
                c = c * (1 - 0.25 * np.exp(-((tpar - tn) * comp_total / (2.2 * rad)) ** 2))[..., None]
        self.camadas.append(dict(z=z * N, r0=N - y1, c0=x0, alfa=alfa, cor=c.astype(np.float32), normal=nrm))

    def camada_livre(self, r0, c0, alfa, corimg, normal, z):
        """Acrescenta uma camada já pintada (flor, gavinha...) em pixels da carta superamostrada."""
        self.camadas.append(dict(z=z * self.N, r0=r0, c0=c0, alfa=alfa, cor=corimg, normal=normal))

    # ------------------------------------------------------------ composição final
    def compor(self):
        N = self.N
        A = np.zeros((N, N), np.float32)
        C = np.zeros((N, N, 3), np.float32)
        Nm = np.zeros((N, N, 3), np.float32)
        sig = self.raio_oclusao * N
        pad = int(3 * sig) + 2
        for cam in sorted(self.camadas, key=lambda c: -c['z']):
            al = cam['alfa']; h, w = al.shape
            r0, c0 = cam['r0'], cam['c0']
            r1, c1 = r0 + h, c0 + w
            # recorte (camada pode passar da borda)
            rr0, cc0 = max(0, r0), max(0, c0)
            rr1, cc1 = min(N, r1), min(N, c1)
            if rr1 <= rr0 or cc1 <= cc0:
                continue
            al = al[rr0 - r0:rr1 - r0, cc0 - c0:cc1 - c0]
            co = cam['cor'][rr0 - r0:rr1 - r0, cc0 - c0:cc1 - c0]
            nm = cam['normal'][rr0 - r0:rr1 - r0, cc0 - c0:cc1 - c0]
            if self.oclusao > 0:
                pr0, pc0 = max(0, rr0 - pad), max(0, cc0 - pad)
                pr1, pc1 = min(N, rr1 + pad), min(N, cc1 + pad)
                bl = cv2.GaussianBlur(A[pr0:pr1, pc0:pc1], (0, 0), sig)
                occ = bl[rr0 - pr0:rr1 - pr0, cc0 - pc0:cc1 - pc0]
                co = co * (1 - self.oclusao * occ)[..., None]
            Ab = A[rr0:rr1, cc0:cc1]
            k = ((1 - Ab) * al)
            C[rr0:rr1, cc0:cc1] += k[..., None] * co
            Nm[rr0:rr1, cc0:cc1] += k[..., None] * nm
            A[rr0:rr1, cc0:cc1] = Ab + k
        # redução
        t = self.tam
        A2 = cv2.resize(A, (t, t), interpolation=cv2.INTER_AREA)
        C2 = cv2.resize(C, (t, t), interpolation=cv2.INTER_AREA)
        N2 = cv2.resize(Nm, (t, t), interpolation=cv2.INTER_AREA)
        rgb = C2 / np.maximum(A2, 1e-6)[..., None]
        nrm = N2 + (1 - np.clip(A2, 0, 1))[..., None] * np.array([0, 0, 1], np.float32)
        nrm = _norm(nrm)
        return np.clip(rgb, 0, 1).astype(np.float32), np.clip(A2, 0, 1).astype(np.float32), nrm.astype(np.float32)
