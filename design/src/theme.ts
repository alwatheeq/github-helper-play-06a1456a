export interface Theme {
  mode: "light" | "dark";
  bg: string; panel: string; panel2: string;
  ink: string; body: string; muted: string;
  accent: string; accentSoft: string;
  rule: string; chip: string;
  sb: string; sbInk: string; sbMuted: string; sbActive: string;
  name: string;
}

export const themes: Record<string, Theme> = {
  navy_light:    { mode:"light", bg:"#FAF7EE", panel:"#FFFFFF",  panel2:"#F5EFE2", ink:"#0E1F3A", body:"#2A3B57", muted:"#7A8499", accent:"#B8893A", accentSoft:"#F0E4CB", rule:"#E2DAC4", chip:"#F5EFE2", sb:"#0E1F3A", sbInk:"#FAF7EE", sbMuted:"#8A9CB8", sbActive:"#B8893A", name:"Navy & Gold · Light" },
  navy_dark:     { mode:"dark",  bg:"#0B1424", panel:"#13203A",  panel2:"#1A2A4A", ink:"#F0E4CB", body:"#C9D2E2", muted:"#6E7E9C", accent:"#D4A85A", accentSoft:"#2A3858", rule:"#22315A", chip:"#1A2A4A", sb:"#080F1C", sbInk:"#F0E4CB", sbMuted:"#6E7E9C", sbActive:"#D4A85A", name:"Navy & Gold · Dark" },
  oxblood_light: { mode:"light", bg:"#F6EFE5", panel:"#FFFFFF",  panel2:"#F0E3D4", ink:"#3E1414", body:"#5B2424", muted:"#8A6A6A", accent:"#9C2B2B", accentSoft:"#F2D9D2", rule:"#E2D2C0", chip:"#F0E3D4", sb:"#3E1414", sbInk:"#F6EFE5", sbMuted:"#A88080", sbActive:"#E0A0A0", name:"Oxblood & Cream · Light" },
  oxblood_dark:  { mode:"dark",  bg:"#1A0808", panel:"#2A1414",  panel2:"#3A1E1E", ink:"#F2D9D2", body:"#D9BFB8", muted:"#8A6A6A", accent:"#D86060", accentSoft:"#3A1E1E", rule:"#3F2424", chip:"#2A1414", sb:"#0F0404", sbInk:"#F2D9D2", sbMuted:"#8A6A6A", sbActive:"#E08080", name:"Oxblood & Cream · Dark" },
  forest_light:  { mode:"light", bg:"#F1EEDE", panel:"#FBFAEF",  panel2:"#E8E5D2", ink:"#1A2E1F", body:"#324836", muted:"#6E7E72", accent:"#5B7A3A", accentSoft:"#D9E2C2", rule:"#D4D7BB", chip:"#E8E5D2", sb:"#1A2E1F", sbInk:"#F1EEDE", sbMuted:"#7A8C7E", sbActive:"#A8C880", name:"Forest & Parchment · Light" },
  forest_dark:   { mode:"dark",  bg:"#0F1A12", panel:"#16261B",  panel2:"#1F3325", ink:"#D9E2C2", body:"#B5C2A0", muted:"#6E7E72", accent:"#8AAA60", accentSoft:"#1F3325", rule:"#243828", chip:"#16261B", sb:"#0A1310", sbInk:"#D9E2C2", sbMuted:"#6E7E72", sbActive:"#A8C880", name:"Forest & Parchment · Dark" },
  ink_light:     { mode:"light", bg:"#F7F2EC", panel:"#FFFFFF",  panel2:"#F0E5DD", ink:"#1B1B1F", body:"#3A3A42", muted:"#7A7780", accent:"#C5708A", accentSoft:"#F4DDE3", rule:"#E5DAD0", chip:"#F0E5DD", sb:"#1B1B1F", sbInk:"#F7F2EC", sbMuted:"#7A7780", sbActive:"#E090A8", name:"Ink & Blush · Light" },
  ink_dark:      { mode:"dark",  bg:"#0F0F12", panel:"#18181E",  panel2:"#22222A", ink:"#F4DDE3", body:"#D0CCD2", muted:"#7A7780", accent:"#E090A8", accentSoft:"#2A2028", rule:"#2A2A32", chip:"#18181E", sb:"#08080B", sbInk:"#F4DDE3", sbMuted:"#7A7780", sbActive:"#E090A8", name:"Ink & Blush · Dark" },
  copper_light:  { mode:"light", bg:"#F4EFE5", panel:"#FFFFFF",  panel2:"#EDE3D2", ink:"#3A2A1E", body:"#5C4530", muted:"#8A7560", accent:"#B8723A", accentSoft:"#F0DCC0", rule:"#DCCDB8", chip:"#EDE3D2", sb:"#3A2A1E", sbInk:"#F4EFE5", sbMuted:"#A89580", sbActive:"#E0A060", name:"Copper & Charcoal · Light" },
  copper_dark:   { mode:"dark",  bg:"#1C1814", panel:"#26211C",  panel2:"#332B23", ink:"#F2E6D2", body:"#D9CDB8", muted:"#9A8E7C", accent:"#D89255", accentSoft:"#3F2F20", rule:"#3B342C", chip:"#332B23", sb:"#120F0C", sbInk:"#F2E6D2", sbMuted:"#9A8E7C", sbActive:"#E0A060", name:"Copper & Charcoal · Dark" },
  mono_light:    { mode:"light", bg:"#FAFAFA",  panel:"#FFFFFF",  panel2:"#F3F4F6", ink:"#111827", body:"#374151", muted:"#6B7280", accent:"#374151", accentSoft:"#E5E7EB", rule:"#E5E7EB", chip:"#F3F4F6", sb:"#111827", sbInk:"#F9FAFB", sbMuted:"#9CA3AF", sbActive:"#9CA3AF", name:"Monochrome · Light" },
  mono_dark:     { mode:"dark",  bg:"#0A0A0A",  panel:"#1F2937",  panel2:"#111827", ink:"#F3F4F6", body:"#D1D5DB", muted:"#9CA3AF", accent:"#9CA3AF", accentSoft:"#1F2937", rule:"#374151", chip:"#1F2937", sb:"#000000", sbInk:"#F3F4F6", sbMuted:"#6B7280", sbActive:"#D1D5DB", name:"Monochrome · Dark" },
};

export type ThemeKey = keyof typeof themes;
