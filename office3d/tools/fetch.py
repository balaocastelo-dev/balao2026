import os, re, sys, json, subprocess, urllib.parse
from concurrent.futures import ThreadPoolExecutor
B = 'https://raw.githubusercontent.com/microsoft/Microsoft-Rocketbox/master/Assets/'
def get(url, out):
    if os.path.exists(out) and os.path.getsize(out) > 1000: return True
    os.makedirs(os.path.dirname(out), exist_ok=True)
    r = subprocess.run(['curl', '-sS', '-f', '-m', '600', '--retry', '3', '-o', out + '.part', url], capture_output=True, text=True)
    if r.returncode != 0:
        print('FAIL', url, r.stderr.strip()[:120]); 
        if os.path.exists(out + '.part'): os.remove(out + '.part')
        return False
    os.rename(out + '.part', out); return True
AV = {'Professions': ['Business_Male_01','Business_Male_02','Business_Male_06','Business_Male_05','Business_Male_07','Business_Female_03','Business_Female_04','Business_Female_01','Business_Female_02','Business_Male_03','Business_Male_04'],
      'Adults': ['Male_Adult_04','Female_Adult_15','Female_Adult_02','Male_Adult_08','Female_Adult_05']}
def avatar(cat, n):
    d = f'raw/{n}'; fbx = f'{d}/{n}.fbx'
    if not get(f'{B}Avatars/{cat}/{n}/Export/{n}.fbx', fbx): return
    data = open(fbx, 'rb').read()
    names = sorted(set(m.decode() for m in re.findall(rb'([A-Za-z0-9_]+_(?:body|head|opacity)_color\.tga)', data, re.I)))
    done = os.path.exists(f'build/pack/av/{n}/head.webp') and os.path.exists(f'build/pack/av/{n}/body.webp')
    if not done:
        for t in names: get(f'{B}Avatars/{cat}/{n}/Textures/{t}', f'{d}/{t}')
        subprocess.run([sys.executable, 'tools/tex.py', d, f'build/pack/av/{n}'], env=dict(os.environ, BODY='1024', HEAD='2048'), capture_output=True)
        for t in names:
            p = f'{d}/{t}'
            if os.path.exists(p): os.remove(p)
    print('avatar', n, names, sorted(os.listdir(f'build/pack/av/{n}')) if os.path.exists(f'build/pack/av/{n}') else 'NO TEX', flush=True)
S = '''idle_neutral_01 idle_neutral_02 idle_neutral_03 idle_look_around_01 idle_breathe_02 idle_stretch_arms_01 idle_waiting_01 idle_touch_face_01
gestic_talk_neutral_01 gestic_talk_neutral_02 gestic_talk_relaxed_01 gestic_talk_relaxed_02 gestic_talk_excited_01
gestic_listen_neutral_01 gestic_listen_neutral_02 gestic_listen_accept_01 gestic_listen_accept_03 gestic_listen_relaxed_01
gestic_presentation_left_01 gestic_presentation_right_01 gestic_thoughtful_01 gestic_shrug_01 gestic_laugh_low
cell_phone_textmessage documents_check documentfile_idle documents_idle documents_note drink_drinking drink_idle
sit_table_idle_neutral_01 sit_table_idle_neutral_02 sit_table_idle_relaxed_01 sit_table_gestic_thoughtful sit_table_idle_look_around sit_table_breathe_01 work_table work_mid
sit_chair_idle_neutral_01 sit_chair_idle_relaxed_01 sit_chair_idle_look_around sit_chair_breathe_01
wave_01 claphands_01 invite_sit knock_door moderate_01 headphones_idle'''.split()
XY = 'walk_neutral walk_neutral_01 walk_neutral_02 walk_slow_01 walk_stroll_01 walk_start walk_stop walk_fast_01'.split()
XYZ = 'sit_down_table_left sit_down_table_right sit_stand_up_table_left sit_stand_up_table_right sit_down_chair_01 sit_stand_up_chair_01 turn_left_90 turn_right_90 turn_left_180 turn_right_180 gestic_presentation_left_02'.split()
EXTRA = [('static','m_cell_phone_talk_01'),('static','m_cell_phone_listen_01'),('xyz','f_cell_phone_talk_01'),('xyz','f_cell_phone_talk_02'),('xyz','m_cell_phone_talk_02'),('xy','f_walk_self-assured'),('static','f_gestic_talk_self-assured_01'),('xyz','m_gestic_talk_self_assured_01'),('static','m_gestic_talk_cool'),('static','f_gestic_talk_cool'),('static','f_sit_table_idle_stretch arms'),('static','m_sit_table_idle_scratch_head'),('static','f_sit_table_idle_touch_hair')]
anims = [(k, g + '_' + n) for g in 'mf' for k, L in (('static', S), ('xy', XY), ('xyz', XYZ)) for n in L] + EXTRA
jobs = []
def anim(k, n):
    out = 'raw/anim/' + n.replace(' ', '_') + '.fbx'
    ok = get(f'{B}Animations/all_animations_max_motextr_{k}/' + urllib.parse.quote(n) + '.max.fbx', out)
    return (k, n, ok)
if __name__ == '__main__':
    what = sys.argv[1]
    with ThreadPoolExecutor(6) as ex:
        if what == 'avatars':
            list(ex.map(lambda a: avatar(*a), [(c, n) for c, L in AV.items() for n in L]))
            json.dump([{'kind': 'avatar', 'name': n, 'url': f'/raw/{n}/{n}.fbx'} for c, L in AV.items() for n in L], open('build/jobs_av.json', 'w'))
        else:
            res = list(ex.map(lambda a: anim(*a), anims))
            json.dump([{'kind': 'anim', 'name': n.replace(' ', '_'), 'url': '/raw/anim/' + n.replace(' ', '_') + '.fbx', 'opts': {'maxDur': 16, 'src': k}} for k, n, ok in res if ok], open('build/jobs_an.json', 'w'))
            print('anims ok', sum(1 for r in res if r[2]), 'of', len(res))
