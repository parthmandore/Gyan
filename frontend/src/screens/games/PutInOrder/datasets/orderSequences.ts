/**
 * Purpose: Curated ordering datasets for Age 5 Put in Order game.
 *          Contains numbers, language-authentic letters, quantities, and logical picture sequences.
 * Module: Put in Order — Datasets
 * Folder: frontend/src/screens/games/PutInOrder/datasets
 */

import { OrderPreset } from '../types';

export const NUMBER_ORDER_PRESETS: OrderPreset[] = [
  {
    id: 'num_1_2_3',
    type: 'numbers',
    items: [{ display: '1' }, { display: '2' }, { display: '3' }],
  },
  {
    id: 'num_2_3_4',
    type: 'numbers',
    items: [{ display: '2' }, { display: '3' }, { display: '4' }],
  },
  {
    id: 'num_3_4_5',
    type: 'numbers',
    items: [{ display: '3' }, { display: '4' }, { display: '5' }],
  },
  {
    id: 'num_4_5_6',
    type: 'numbers',
    items: [{ display: '4' }, { display: '5' }, { display: '6' }],
  },
  {
    id: 'num_5_6_7',
    type: 'numbers',
    items: [{ display: '5' }, { display: '6' }, { display: '7' }],
  },
  {
    id: 'num_1_2_3_4',
    type: 'numbers',
    items: [{ display: '1' }, { display: '2' }, { display: '3' }, { display: '4' }],
  },
  {
    id: 'num_2_3_4_5',
    type: 'numbers',
    items: [{ display: '2' }, { display: '3' }, { display: '4' }, { display: '5' }],
  },
  {
    id: 'num_4_5_6_7',
    type: 'numbers',
    items: [{ display: '4' }, { display: '5' }, { display: '6' }, { display: '7' }],
  },
  {
    id: 'num_6_7_8_9',
    type: 'numbers',
    items: [{ display: '6' }, { display: '7' }, { display: '8' }, { display: '9' }],
  },
  {
    id: 'num_7_8_9_10',
    type: 'numbers',
    items: [{ display: '7' }, { display: '8' }, { display: '9' }, { display: '10' }],
  },
];

export const ENGLISH_LETTER_PRESETS: OrderPreset[] = [
  {
    id: 'en_let_a_b_c',
    type: 'letters',
    languages: ['en'],
    items: [{ display: 'A' }, { display: 'B' }, { display: 'C' }],
  },
  {
    id: 'en_let_b_c_d',
    type: 'letters',
    languages: ['en'],
    items: [{ display: 'B' }, { display: 'C' }, { display: 'D' }],
  },
  {
    id: 'en_let_c_d_e',
    type: 'letters',
    languages: ['en'],
    items: [{ display: 'C' }, { display: 'D' }, { display: 'E' }],
  },
  {
    id: 'en_let_d_e_f',
    type: 'letters',
    languages: ['en'],
    items: [{ display: 'D' }, { display: 'E' }, { display: 'F' }],
  },
  {
    id: 'en_let_e_f_g',
    type: 'letters',
    languages: ['en'],
    items: [{ display: 'E' }, { display: 'F' }, { display: 'G' }],
  },
  {
    id: 'en_let_a_b_c_d',
    type: 'letters',
    languages: ['en'],
    items: [{ display: 'A' }, { display: 'B' }, { display: 'C' }, { display: 'D' }],
  },
  {
    id: 'en_let_l_m_n_o',
    type: 'letters',
    languages: ['en'],
    items: [{ display: 'L' }, { display: 'M' }, { display: 'N' }, { display: 'O' }],
  },
  {
    id: 'en_let_p_q_r_s',
    type: 'letters',
    languages: ['en'],
    items: [{ display: 'P' }, { display: 'Q' }, { display: 'R' }, { display: 'S' }],
  },
  {
    id: 'en_let_w_x_y_z',
    type: 'letters',
    languages: ['en'],
    items: [{ display: 'W' }, { display: 'X' }, { display: 'Y' }, { display: 'Z' }],
  },
];

export const HINDI_LETTER_PRESETS: OrderPreset[] = [
  {
    id: 'hi_let_a_aa_i',
    type: 'letters',
    languages: ['hi'],
    items: [{ display: 'अ' }, { display: 'आ' }, { display: 'इ' }],
  },
  {
    id: 'hi_let_u_oo_ri',
    type: 'letters',
    languages: ['hi'],
    items: [{ display: 'उ' }, { display: 'ऊ' }, { display: 'ऋ' }],
  },
  {
    id: 'hi_let_e_ai_o',
    type: 'letters',
    languages: ['hi'],
    items: [{ display: 'ए' }, { display: 'ऐ' }, { display: 'ओ' }],
  },
  {
    id: 'hi_let_ka_kha_ga',
    type: 'letters',
    languages: ['hi'],
    items: [{ display: 'क' }, { display: 'ख' }, { display: 'ग' }],
  },
  {
    id: 'hi_let_kha_ga_gha',
    type: 'letters',
    languages: ['hi'],
    items: [{ display: 'ख' }, { display: 'ग' }, { display: 'घ' }],
  },
  {
    id: 'hi_let_cha_chha_ja',
    type: 'letters',
    languages: ['hi'],
    items: [{ display: 'च' }, { display: 'छ' }, { display: 'ज' }],
  },
  {
    id: 'hi_let_ta_tha_da',
    type: 'letters',
    languages: ['hi'],
    items: [{ display: 'त' }, { display: 'थ' }, { display: 'द' }],
  },
  {
    id: 'hi_let_pa_pha_ba',
    type: 'letters',
    languages: ['hi'],
    items: [{ display: 'प' }, { display: 'फ' }, { display: 'ब' }],
  },
  {
    id: 'hi_let_ya_ra_la',
    type: 'letters',
    languages: ['hi'],
    items: [{ display: 'य' }, { display: 'र' }, { display: 'ल' }],
  },
  {
    id: 'hi_let_ka_kha_ga_gha',
    type: 'letters',
    languages: ['hi'],
    items: [{ display: 'क' }, { display: 'ख' }, { display: 'ग' }, { display: 'घ' }],
  },
  {
    id: 'hi_let_pa_pha_ba_bha',
    type: 'letters',
    languages: ['hi'],
    items: [{ display: 'प' }, { display: 'फ' }, { display: 'ब' }, { display: 'भ' }],
  },
];

export const MARATHI_LETTER_PRESETS: OrderPreset[] = [
  {
    id: 'mr_let_a_aa_i',
    type: 'letters',
    languages: ['mr'],
    items: [{ display: 'अ' }, { display: 'आ' }, { display: 'इ' }],
  },
  {
    id: 'mr_let_ka_kha_ga',
    type: 'letters',
    languages: ['mr'],
    items: [{ display: 'क' }, { display: 'ख' }, { display: 'ग' }],
  },
  {
    id: 'mr_let_kha_ga_gha',
    type: 'letters',
    languages: ['mr'],
    items: [{ display: 'ख' }, { display: 'ग' }, { display: 'घ' }],
  },
  {
    id: 'mr_let_cha_chha_ja',
    type: 'letters',
    languages: ['mr'],
    items: [{ display: 'च' }, { display: 'छ' }, { display: 'ज' }],
  },
  {
    id: 'mr_let_ta_tha_da',
    type: 'letters',
    languages: ['mr'],
    items: [{ display: 'त' }, { display: 'थ' }, { display: 'द' }],
  },
  {
    id: 'mr_let_pa_pha_ba',
    type: 'letters',
    languages: ['mr'],
    items: [{ display: 'प' }, { display: 'फ' }, { display: 'ब' }],
  },
  {
    id: 'mr_let_ya_ra_la',
    type: 'letters',
    languages: ['mr'],
    items: [{ display: 'य' }, { display: 'र' }, { display: 'ल' }],
  },
  {
    id: 'mr_let_sha_sha_sa',
    type: 'letters',
    languages: ['mr'],
    items: [{ display: 'श' }, { display: 'ष' }, { display: 'स' }],
  },
  {
    id: 'mr_let_la_ksha_gya',
    type: 'letters',
    languages: ['mr'],
    items: [{ display: 'ळ' }, { display: 'क्ष' }, { display: 'ज्ञ' }],
  },
  {
    id: 'mr_let_ka_kha_ga_gha',
    type: 'letters',
    languages: ['mr'],
    items: [{ display: 'क' }, { display: 'ख' }, { display: 'ग' }, { display: 'घ' }],
  },
];

export const QUANTITY_ORDER_PRESETS: OrderPreset[] = [
  {
    id: 'qty_apples_3',
    type: 'quantities',
    items: [{ display: '🍎' }, { display: '🍎🍎' }, { display: '🍎🍎🍎' }],
  },
  {
    id: 'qty_stars_3',
    type: 'quantities',
    items: [{ display: '⭐' }, { display: '⭐⭐' }, { display: '⭐⭐⭐' }],
  },
  {
    id: 'qty_balloons_3',
    type: 'quantities',
    items: [{ display: '🎈' }, { display: '🎈🎈' }, { display: '🎈🎈🎈' }],
  },
  {
    id: 'qty_flowers_3',
    type: 'quantities',
    items: [{ display: '🌸' }, { display: '🌸🌸' }, { display: '🌸🌸🌸' }],
  },
  {
    id: 'qty_cars_3',
    type: 'quantities',
    items: [{ display: '🚗' }, { display: '🚗🚗' }, { display: '🚗🚗🚗' }],
  },
  {
    id: 'qty_stars_4',
    type: 'quantities',
    items: [{ display: '⭐' }, { display: '⭐⭐' }, { display: '⭐⭐⭐' }, { display: '⭐⭐⭐⭐' }],
  },
  {
    id: 'qty_apples_4',
    type: 'quantities',
    items: [{ display: '🍎' }, { display: '🍎🍎' }, { display: '🍎🍎🍎' }, { display: '🍎🍎🍎🍎' }],
  },
];

export const LOGICAL_ORDER_PRESETS: OrderPreset[] = [
  {
    id: 'logic_plant_growth',
    type: 'logical',
    items: [{ display: '🌱' }, { display: '🌿' }, { display: '🌳' }],
  },
  {
    id: 'logic_chick_hatch',
    type: 'logical',
    items: [{ display: '🥚' }, { display: '🐣' }, { display: '🐥' }],
  },
  {
    id: 'logic_butterfly_lifecycle',
    type: 'logical',
    items: [{ display: '🐛' }, { display: '🥥' }, { display: '🦋' }],
  },
  {
    id: 'logic_moon_phases',
    type: 'logical',
    items: [{ display: '🌑' }, { display: '🌓' }, { display: '🌕' }],
  },
  {
    id: 'logic_human_growth',
    type: 'logical',
    items: [{ display: '👶' }, { display: '🧒' }, { display: '🧑' }],
  },
  {
    id: 'logic_day_cycle',
    type: 'logical',
    items: [{ display: '🌅' }, { display: '☀️' }, { display: '🌙' }],
  },
];
