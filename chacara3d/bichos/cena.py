"""Utilidades do Blender: malhas a partir de arrays, redução de malha, cor de vértice."""
import bpy
import bmesh
import numpy as np


def limpar_cena():
    """Começa do zero (sem fábrica de arquivo: apaga tudo o que houver)."""
    for col in (bpy.data.objects, bpy.data.meshes, bpy.data.armatures, bpy.data.materials,
                bpy.data.actions, bpy.data.cameras, bpy.data.lights, bpy.data.images):
        for item in list(col):
            col.remove(item)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)
    cena = bpy.context.scene
    cena.frame_start = 0
    cena.render.fps = 30
    cena.render.fps_base = 1.0
    return cena


def malha(nome, verts, faces, ligar=True):
    """Cria um objeto de malha com vértices (N,3) e faces (lista ou array)."""
    me = bpy.data.meshes.new(nome)
    verts = np.asarray(verts, dtype=float)
    me.from_pydata(verts.tolist(), [], [list(map(int, f)) for f in faces])
    me.update()
    ob = bpy.data.objects.new(nome, me)
    if ligar:
        bpy.context.scene.collection.objects.link(ob)
    return ob


def malha_rapida(nome, verts, quads):
    """Igual a `malha`, mas para muitas quads (usa foreach_set)."""
    me = bpy.data.meshes.new(nome)
    verts = np.asarray(verts, dtype=np.float32)
    quads = np.asarray(quads, dtype=np.int32)
    me.vertices.add(len(verts))
    me.vertices.foreach_set('co', verts.ravel())
    me.loops.add(quads.size)
    me.loops.foreach_set('vertex_index', quads.ravel())
    me.polygons.add(len(quads))
    me.polygons.foreach_set('loop_start', np.arange(0, quads.size, 4, dtype=np.int32))
    me.update(calc_edges=True)
    me.validate()
    ob = bpy.data.objects.new(nome, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def contar_tris(ob):
    me = ob.data
    n = np.zeros(len(me.polygons), dtype=np.int32)
    me.polygons.foreach_get('loop_total', n)
    return int((n - 2).sum())


def aplicar_modificadores(ob):
    """Aplica todos os modificadores pela avaliação do depsgraph (sem operadores)."""
    dg = bpy.context.evaluated_depsgraph_get()
    ev = ob.evaluated_get(dg)
    novo = bpy.data.meshes.new_from_object(ev)
    velho = ob.data
    ob.modifiers.clear()
    ob.data = novo
    novo.name = velho.name
    bpy.data.meshes.remove(velho)
    return ob


def reduzir(ob, alvo_tris, simetria=True, grupo=None, fator_grupo=1.0):
    """Reduz a malha (colapso de arestas) até perto de `alvo_tris` triângulos."""
    atual = contar_tris(ob)
    if atual <= alvo_tris:
        return ob
    m = ob.modifiers.new('reduzir', 'DECIMATE')
    m.decimate_type = 'COLLAPSE'
    m.ratio = alvo_tris / atual
    m.use_collapse_triangulate = True
    if simetria:
        m.use_symmetry = True
        m.symmetry_axis = 'X'
    if grupo:
        # no colapso, o grupo marca onde reduzir; invertido, poupa os vértices marcados
        m.vertex_group = grupo
        m.vertex_group_factor = fator_grupo
        m.invert_vertex_group = True
    aplicar_modificadores(ob)
    return ob


def suavizar_laplace(ob, repeticoes=2, fator=0.5):
    m = ob.modifiers.new('suaviza', 'SMOOTH')
    m.factor = fator
    m.iterations = repeticoes
    aplicar_modificadores(ob)


def sombrear_suave(ob):
    me = ob.data
    me.polygons.foreach_set('use_smooth', np.ones(len(me.polygons), dtype=bool))
    me.update()


def coords(ob):
    me = ob.data
    v = np.zeros(len(me.vertices) * 3, dtype=np.float64)
    me.vertices.foreach_get('co', v)
    return v.reshape(-1, 3)


def por_coords(ob, v):
    ob.data.vertices.foreach_set('co', np.asarray(v, dtype=np.float32).ravel())
    ob.data.update()


def cor_vertice(ob, rgba, nome='Color'):
    """Atributo de cor por vértice (float, linear) chamado `nome`."""
    me = ob.data
    if nome in me.color_attributes:
        me.color_attributes.remove(me.color_attributes[nome])
    at = me.color_attributes.new(nome, 'FLOAT_COLOR', 'POINT')
    at.data.foreach_set('color', np.asarray(rgba, dtype=np.float32).ravel())
    me.color_attributes.active_color = at
    try:
        me.color_attributes.render_color_index = me.color_attributes.active_color_index
    except Exception:
        pass
    return at


def material(nome, cor, rugosidade=0.8, metal=0.0, especular=0.5):
    """Material glTF simples (Principled BSDF)."""
    mat = bpy.data.materials.get(nome) or bpy.data.materials.new(nome)
    try:
        mat.use_nodes = True
    except Exception:
        pass
    nt = mat.node_tree
    bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    bsdf.inputs['Base Color'].default_value = (*cor, 1.0)
    bsdf.inputs['Roughness'].default_value = rugosidade
    bsdf.inputs['Metallic'].default_value = metal
    if 'Specular IOR Level' in bsdf.inputs:
        bsdf.inputs['Specular IOR Level'].default_value = especular
    mat.diffuse_color = (*cor, 1.0)
    return mat


def juntar(objetos, nome):
    """Junta várias malhas num objeto só (mantém materiais e atributos)."""
    bm_total = None
    alvo = objetos[0]
    with bpy.context.temp_override(active_object=alvo, selected_editable_objects=objetos,
                                   selected_objects=objetos, object=alvo):
        bpy.ops.object.join()
    alvo.name = nome
    alvo.data.name = nome
    return alvo


def lin_srgb(c):
    """sRGB (0-1) -> linear, para escrever cores de material."""
    c = np.asarray(c, dtype=float)
    return tuple(np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4))


def normais_personalizadas(ob, normais):
    """Normais por vértice dadas (ex.: gradiente exato da SDF): sombreado liso com poucos triângulos."""
    n = np.asarray(normais, dtype=float)
    n = n / np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)
    ob.data.normals_split_custom_set_from_vertices(n.tolist())


def tris_e_arestas(ob):
    me = ob.data
    me.calc_loop_triangles()
    t = np.zeros(len(me.loop_triangles) * 3, dtype=np.int64)
    me.loop_triangles.foreach_get('vertices', t)
    a = np.zeros(len(me.edges) * 2, dtype=np.int64)
    me.edges.foreach_get('vertices', a)
    return t.reshape(-1, 3), a.reshape(-1, 2)


def limpar_dobras(ob, forma, max_rodadas=6):
    """Colapsa as faces que a redução dobrou (normal ao contrário da forma)."""
    import sdf
    for _ in range(max_rodadas):
        tris, _a = tris_e_arestas(ob)
        ruins = sdf.faces_ruins(forma, coords(ob), tris)
        if len(ruins) == 0:
            return 0
        bm = bmesh.new()
        bm.from_mesh(ob.data)
        bm.verts.ensure_lookup_table()
        bm.faces.ensure_lookup_table()
        # cada face do bmesh já é triângulo (a redução triangula)
        alvo = set()
        for i in ruins:
            if i < len(bm.faces):
                f = bm.faces[int(i)]
                e = min(f.edges, key=lambda e: e.calc_length())
                alvo.add(e)
        arestas = [e for e in alvo if e.is_valid]
        bmesh.ops.collapse(bm, edges=arestas, uvs=False)
        bm.to_mesh(ob.data)
        bm.free()
        ob.data.update()
    tris, _a = tris_e_arestas(ob)
    return len(sdf.faces_ruins(forma, coords(ob), tris))
