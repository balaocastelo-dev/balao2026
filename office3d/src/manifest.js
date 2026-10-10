// Animation roles -> clip base names (prefixed with m_ / f_ at runtime)
export const ROLES = {
  walk: ['walk_neutral'],
  idle: ['idle_neutral_01', 'idle_neutral_02', 'idle_look_around_01', 'idle_waiting_01'],
  talk: ['gestic_talk_neutral_01', 'gestic_talk_neutral_02', 'gestic_talk_relaxed_01', 'gestic_talk_relaxed_02', 'gestic_talk_excited_01', 'moderate_01'],
  listen: ['gestic_listen_neutral_01', 'gestic_listen_neutral_02', 'gestic_listen_accept_01', 'gestic_listen_accept_03', 'gestic_listen_relaxed_01', 'gestic_thoughtful_01'],
  present: ['gestic_presentation_left_01', 'gestic_presentation_right_01'],
  phone: ['cell_phone_talk_01'],
  text: ['cell_phone_textmessage'],
  docs: ['documents_check', 'documents_note'],
  drink: ['drink_drinking', 'drink_idle'],
  workStand: ['work_table'],
  workMid: ['work_mid'],
  wave: ['wave_01'],
  laugh: ['gestic_laugh_low'],
  stretch: ['idle_stretch_arms_01'],
  cheer: ['cheer_01', 'cheer_03'],
  sitWork: ['sit_table_idle_neutral_02'],
  sitIdle: ['sit_table_idle_neutral_01', 'sit_table_idle_look_around', 'sit_table_gestic_thoughtful', 'sit_table_idle_relaxed_01'],
  sitChair: ['sit_chair_idle_neutral_01', 'sit_chair_idle_relaxed_01', 'sit_chair_idle_look_around'],
  sitDown: ['sit_down_chair_01'],
  standUp: ['sit_stand_up_chair_01'],
};
// clips sampled at full rate (locomotion / transitions)
export const FAST = ['walk_neutral', 'sit_down_chair_01', 'sit_stand_up_chair_01'];
