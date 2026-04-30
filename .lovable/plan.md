# Re-align Navy & Gold tokens (light + dark)

## What's wrong now

The Phase 1 implementation guessed Navy & Gold hexes instead of using the values you just pasted. Current vs. target on the key tokens:

| Token | Current (wrong) | Target (your spec) |
|---|---|---|
| `--bg-page` light | `#EFE9DC` | `#F4ECDC` |
| `--bg-sidebar` light | `#0E1A2B` | `#1A2540` |
| `--bg-card-dark` light | `#14233A` | `#1A2540` |
| `--accent-gold` light | `#C8932E` | `#C9A24E` |
| `--accent-gold-soft` light | `#E0B85F` | `#E8D49A` |
| `--divider` light | `#C9BFA8` | `#D9CDB0` |
| `--divider-dark` light | `#1F3050` | `#2A3656` |
| `--bg-page` dark | `#0E1A2B` | `#0E1628` |
| `--bg-sidebar` dark | `#08111E` | `#060B18` |
| `--bg-card-dark` dark | `#14233A` | `#18233D` |
| `--accent-gold` dark | `#D4A24A` | `#E0BC65` |
| `--accent-gold-soft` dark | `#E6C07A` | `#2C2316` (dark wash, intentional) |
| `--text-primary-dark` dark | `#F4EFE2` | `#F2E6C7` |

You also introduced two new role tokens not in the original token set: `--bg-subtle`, `--text-secondary-dark`, `--chip`, `--ring-focus`. These should be added so future Scholar primitives (alt rows, captions, chips, focus rings) can read through them.

## Changes

### 1. `src/index.css` — Navy & Gold blocks only

Replace the Navy & Gold light block (`:root, [data-theme="navy-gold"]`) and dark block (`.dark[data-theme="navy-gold"], .dark:root`) with the exact tokens you pasted:

**Light:**
```
--bg-page: #F4ECDC; --bg-sidebar: #1A2540;
--bg-card-dark: #1A2540; --bg-card-light: #FFFFFF;
--bg-subtle: #EDE3CC;
--accent-gold: #C9A24E; --accent-gold-soft: #E8D49A;
--text-primary-dark: #1A2540; --text-primary-light: #F4ECDC;
--text-secondary-dark: #3D4A6B;
--text-muted-dark: #6B7280; --text-muted-light: #A8B0C4;
--divider: #D9CDB0; --divider-dark: #2A3656;
--chip: #EDE3CC; --ring-focus: rgba(201,162,78,0.4);
```

**Dark:**
```
--bg-page: #0E1628; --bg-sidebar: #060B18;
--bg-card-dark: #18233D; --bg-card-light: #18233D;
--bg-subtle: #0E1628;
--accent-gold: #E0BC65; --accent-gold-soft: #2C2316;
--text-primary-dark: #F2E6C7; --text-primary-light: #F2E6C7;
--text-secondary-dark: #C8BC9A;
--text-muted-dark: #8A8170; --text-muted-light: #8A8170;
--divider: #2A3656; --divider-dark: #3A4670;
--chip: #18233D; --ring-focus: rgba(224,188,101,0.45);
```

### 2. Add the four new role tokens to the other 5 themes

`--bg-subtle`, `--text-secondary-dark`, `--chip`, `--ring-focus` get added to each of: Oxblood, Forest, Ink & Blush, Copper, Monochrome — light + dark — using palette-appropriate values derived from each theme's existing hexes (so e.g. monochrome's `--ring-focus` is grey, oxblood's is wine-tinted, etc.). This keeps all 6 themes structurally identical so components can rely on every token existing.

### 3. `tailwind.config.js` — bind the new tokens

Add Tailwind utilities mapped to the new variables:
- `bg-subtle` → `var(--bg-subtle)`
- `text-secondary` → `var(--text-secondary-dark)`
- `bg-chip` → `var(--chip)`
- `ring-focus` → `var(--ring-focus)` (under `ringColor`)

No other tailwind keys change.

### 4. No JS / context changes

`ThemeContext.tsx` already applies `data-theme="navy-gold"` and toggles `.dark` — both blocks above are picked up automatically. No code changes outside the two files above.

## After this lands

Default page should match your spec exactly: `#F4ECDC` parchment, `#1A2540` navy sidebar, `#C9A24E` gold rules. Dark mode flips to `#0E1628` page with cream `#F2E6C7` text and lifted gold `#E0BC65`. Then we'll be safe to start Phase 2 (Scholar primitives) building against a stable token set.