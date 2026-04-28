import { useState, useMemo } from 'react'

// ─── Troop type colors ────────────────────────────────────────
const TROOP_COLORS = {
  Ranged:   { bg: '#dbeafe', color: '#1e40af' },
  Melee:    { bg: '#fee2e2', color: '#991b1b' },
  Mounted:  { bg: '#d1fae5', color: '#065f46' },
  Flying:   { bg: '#ede9fe', color: '#5b21b6' },
  Archers:  { bg: '#dbeafe', color: '#1e40af' },
  Riders:   { bg: '#d1fae5', color: '#065f46' },
  Monsters: { bg: '#fef3c7', color: '#92400e' },
  Dragons:  { bg: '#fce7f3', color: '#9d174d' },
  Giants:   { bg: '#ffedd5', color: '#9a3412' },
  Beasts:   { bg: '#ecfdf5', color: '#065f46' },
  Elementals:{ bg: '#f0fdf4', color: '#166534' },
}

function TroopBadge({ text }) {
  // Split "Ranged or Melee" → ['Ranged', 'Melee'] etc.
  const parts = text.split(/\s*(?:or|and|,)\s*/).map(s => s.trim()).filter(Boolean)
  // Find known troop types in each part
  const knownTypes = Object.keys(TROOP_COLORS)

  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
      {parts.map((part, i) => {
        const match = knownTypes.find(t => part.toLowerCase().includes(t.toLowerCase()))
        const style = match ? TROOP_COLORS[match] : { bg: 'var(--bg4)', color: 'var(--text-dim)' }
        return (
          <span key={i} style={{
            padding: '2px 8px', borderRadius: 99,
            fontSize: 11, fontWeight: 700,
            background: style.bg, color: style.color,
          }}>
            {part}
          </span>
        )
      })}
    </span>
  )
}

// ─── Monster faction icons ────────────────────────────────────
const FACTION_EMOJI = {
  Undead: '💀', Elf: '🧝', Cursed: '😈', Barbarian: '⚔️', Inferno: '🔥',
}

// ─── Regular monsters data ────────────────────────────────────
const REGULAR = [
  // Lvl 1-10 (1 kind)
  { lvl: 1,  faction: 'Undead',    troops: 'Ranged or Melee' },
  { lvl: 2,  faction: 'Elf',       troops: 'Ranged or Melee' },
  { lvl: 3,  faction: 'Cursed',    troops: 'Ranged or Melee' },
  { lvl: 4,  faction: 'Barbarian', troops: 'Ranged or Melee' },
  { lvl: 5,  faction: 'Inferno',   troops: 'Ranged or Melee' },
  { lvl: 6,  faction: 'Undead',    troops: 'Mounted or Ranged' },
  { lvl: 7,  faction: 'Elf',       troops: 'Mounted or Ranged' },
  { lvl: 8,  faction: 'Cursed',    troops: 'Mounted or Ranged' },
  { lvl: 9,  faction: 'Barbarian', troops: 'Melee or Mounted' },
  { lvl: 10, faction: 'Inferno',   troops: 'Mounted' },
  // Lvl 11-15 (2 kinds)
  { lvl: 11, faction: 'Elf',       troops: 'Ranged' },
  { lvl: 11, faction: 'Undead',    troops: 'Melee' },
  { lvl: 12, faction: 'Barbarian', troops: 'Melee' },
  { lvl: 12, faction: 'Cursed',    troops: 'Melee' },
  { lvl: 13, faction: 'Inferno',   troops: 'Ranged' },
  { lvl: 13, faction: 'Undead',    troops: 'Mounted' },
  { lvl: 14, faction: 'Cursed',    troops: 'Mounted' },
  { lvl: 14, faction: 'Elf',       troops: 'Ranged' },
  { lvl: 15, faction: 'Barbarian', troops: 'Ranged' },
  { lvl: 15, faction: 'Inferno',   troops: 'Ranged' },
  // Lvl 16-20 (3 kinds)
  { lvl: 16, faction: 'Cursed',    troops: 'Ranged' },
  { lvl: 16, faction: 'Elf',       troops: 'Archers or Mounted' },
  { lvl: 16, faction: 'Undead',    troops: 'Mounted' },
  { lvl: 17, faction: 'Barbarian', troops: 'Mounted' },
  { lvl: 17, faction: 'Inferno',   troops: 'Melee' },
  { lvl: 17, faction: 'Undead',    troops: 'Mounted' },
  { lvl: 18, faction: 'Barbarian', troops: 'Ranged' },
  { lvl: 18, faction: 'Cursed',    troops: 'Melee' },
  { lvl: 18, faction: 'Elf',       troops: 'Ranged' },
  { lvl: 19, faction: 'Elf',       troops: 'Mounted' },
  { lvl: 19, faction: 'Inferno',   troops: 'Ranged or Melee' },
  { lvl: 19, faction: 'Undead',    troops: 'Mounted' },
  { lvl: 20, faction: 'Barbarian', troops: 'Ranged' },
  { lvl: 20, faction: 'Cursed',    troops: 'Mounted' },
  { lvl: 20, faction: 'Inferno',   troops: 'Ranged' },
  // Lvl 21-45 (5 kinds)
  { lvl: 21, faction: 'Barbarian', troops: 'Mounted' },
  { lvl: 21, faction: 'Cursed',    troops: 'Mounted' },
  { lvl: 21, faction: 'Elf',       troops: 'Ranged or Mounted' },
  { lvl: 21, faction: 'Inferno',   troops: 'Ranged' },
  { lvl: 21, faction: 'Undead',    troops: 'Mounted' },
  { lvl: 22, faction: 'Barbarian', troops: 'Ranged' },
  { lvl: 22, faction: 'Cursed',    troops: 'Melee' },
  { lvl: 22, faction: 'Elf',       troops: 'Mounted' },
  { lvl: 22, faction: 'Inferno',   troops: 'Ranged or Melee' },
  { lvl: 22, faction: 'Undead',    troops: 'Melee' },
  { lvl: 23, faction: 'Barbarian', troops: 'Mounted' },
  { lvl: 23, faction: 'Cursed',    troops: 'Melee' },
  { lvl: 23, faction: 'Elf',       troops: 'Mounted' },
  { lvl: 23, faction: 'Inferno',   troops: 'Mounted' },
  { lvl: 23, faction: 'Undead',    troops: 'Melee' },
  { lvl: 24, faction: 'Barbarian', troops: 'Ranged or Melee' },
  { lvl: 24, faction: 'Cursed',    troops: 'Melee' },
  { lvl: 24, faction: 'Elf',       troops: 'Melee' },
  { lvl: 24, faction: 'Inferno',   troops: 'Melee' },
  { lvl: 24, faction: 'Undead',    troops: 'Mounted' },
  { lvl: 25, faction: 'Barbarian', troops: 'Ranged' },
  { lvl: 25, faction: 'Cursed',    troops: 'Mounted' },
  { lvl: 25, faction: 'Elf',       troops: 'Mounted' },
  { lvl: 25, faction: 'Inferno',   troops: 'Ranged or Mounted' },
  { lvl: 25, faction: 'Undead',    troops: 'Ranged' },
  { lvl: 26, faction: 'Barbarian', troops: 'Ranged' },
  { lvl: 26, faction: 'Cursed',    troops: 'Melee' },
  { lvl: 26, faction: 'Elf',       troops: 'Mounted' },
  { lvl: 26, faction: 'Inferno',   troops: 'Mounted' },
  { lvl: 26, faction: 'Undead',    troops: 'Melee' },
  { lvl: 27, faction: 'Barbarian', troops: 'Ranged or Melee' },
  { lvl: 27, faction: 'Cursed',    troops: 'Melee' },
  { lvl: 27, faction: 'Elf',       troops: 'Melee' },
  { lvl: 27, faction: 'Inferno',   troops: 'Mounted' },
  { lvl: 27, faction: 'Undead',    troops: 'Mounted' },
  { lvl: 28, faction: 'Barbarian', troops: 'Ranged or Melee' },
  { lvl: 28, faction: 'Cursed',    troops: 'Mounted' },
  { lvl: 28, faction: 'Elf',       troops: 'Mounted' },
  { lvl: 28, faction: 'Inferno',   troops: 'Mounted' },
  { lvl: 28, faction: 'Undead',    troops: 'Ranged' },
  { lvl: 29, faction: 'Barbarian', troops: 'Ranged' },
  { lvl: 29, faction: 'Cursed',    troops: 'Melee' },
  { lvl: 29, faction: 'Elf',       troops: 'Mounted' },
  { lvl: 29, faction: 'Inferno',   troops: 'Ranged' },
  { lvl: 29, faction: 'Undead',    troops: 'Melee' },
  { lvl: 30, faction: 'Barbarian', troops: 'Ranged' },
  { lvl: 30, faction: 'Cursed',    troops: 'Mounted' },
  { lvl: 30, faction: 'Elf',       troops: 'Mounted' },
  { lvl: 30, faction: 'Inferno',   troops: 'Melee' },
  { lvl: 30, faction: 'Undead',    troops: 'Melee' },
  { lvl: 31, faction: 'Barbarian', troops: 'Melee' },
  { lvl: 31, faction: 'Cursed',    troops: 'Mounted' },
  { lvl: 31, faction: 'Elf',       troops: 'Mounted' },
  { lvl: 31, faction: 'Inferno',   troops: 'Mounted' },
  { lvl: 31, faction: 'Undead',    troops: 'Ranged' },
  { lvl: 32, faction: 'Barbarian', troops: 'Ranged' },
  { lvl: 32, faction: 'Cursed',    troops: 'Melee' },
  { lvl: 32, faction: 'Elf',       troops: 'Mounted' },
  { lvl: 32, faction: 'Inferno',   troops: 'Melee' },
  { lvl: 32, faction: 'Undead',    troops: 'Ranged' },
  { lvl: 33, faction: 'Barbarian', troops: 'Ranged or Melee' },
  { lvl: 33, faction: 'Cursed',    troops: 'Melee' },
  { lvl: 33, faction: 'Elf',       troops: 'Melee' },
  { lvl: 33, faction: 'Inferno',   troops: 'Mounted' },
  { lvl: 33, faction: 'Undead',    troops: 'Melee' },
  { lvl: 34, faction: 'Barbarian', troops: 'Ranged' },
  { lvl: 34, faction: 'Cursed',    troops: 'Mounted' },
  { lvl: 34, faction: 'Elf',       troops: 'Mounted' },
  { lvl: 34, faction: 'Inferno',   troops: 'Mounted' },
  { lvl: 34, faction: 'Undead',    troops: 'Ranged' },
  { lvl: 35, faction: 'Barbarian', troops: 'Ranged' },
  { lvl: 35, faction: 'Cursed',    troops: 'Melee' },
  { lvl: 35, faction: 'Elf',       troops: 'Riders' },
  { lvl: 35, faction: 'Inferno',   troops: 'Riders' },
  { lvl: 35, faction: 'Undead',    troops: 'Melee' },
  { lvl: 36, faction: 'Cursed',    troops: 'Melee or Mounted' },
  { lvl: 36, faction: 'Elf',       troops: 'Melee or Ranged' },
  { lvl: 36, faction: 'Undead',    troops: 'Melee' },
  { lvl: 37, faction: 'Cursed',    troops: 'Mounted or Melee' },
  { lvl: 37, faction: 'Elf',       troops: 'Ranged or Melee' },
  { lvl: 37, faction: 'Inferno',   troops: 'Ranged or Mounted' },
  { lvl: 37, faction: 'Undead',    troops: 'Melee' },
  { lvl: 38, faction: 'Elf',       troops: 'Melee' },
  { lvl: 38, faction: 'Inferno',   troops: 'Ranged or Mounted' },
  { lvl: 38, faction: 'Undead',    troops: 'Ranged' },
  { lvl: 39, faction: 'Cursed',    troops: 'Ranged or Melee' },
  { lvl: 39, faction: 'Inferno',   troops: 'Mounted or Ranged' },
  { lvl: 39, faction: 'Undead',    troops: 'Ranged or Melee' },
  { lvl: 40, faction: 'Cursed',    troops: 'Melee' },
  { lvl: 40, faction: 'Elf',       troops: 'Melee or Mounted' },
  { lvl: 40, faction: 'Inferno',   troops: 'Ranged or Mounted' },
  { lvl: 41, faction: 'Cursed',    troops: 'Melee or Mounted' },
  { lvl: 41, faction: 'Elf',       troops: 'Ranged or Melee' },
  { lvl: 41, faction: 'Undead',    troops: 'Ranged or Melee' },
  { lvl: 42, faction: 'Cursed',    troops: 'Melee or Mounted' },
  { lvl: 42, faction: 'Elf',       troops: 'Melee or Mounted' },
  { lvl: 42, faction: 'Undead',    troops: 'Ranged' },
  { lvl: 43, faction: 'Elf',       troops: 'Ranged or Melee' },
  { lvl: 43, faction: 'Inferno',   troops: 'Ranged or Mounted' },
  { lvl: 43, faction: 'Undead',    troops: 'Melee' },
  { lvl: 44, faction: 'Cursed',    troops: 'Melee or Mounted' },
  { lvl: 44, faction: 'Undead',    troops: 'Melee' },
  { lvl: 45, faction: 'Cursed',    troops: 'Melee or Mounted' },
  { lvl: 45, faction: 'Inferno',   troops: 'Mounted or Ranged' },
]

// ─── Rare monsters data ───────────────────────────────────────
const RARE = [
  { lvl: 1,  faction: 'Undead',    troops: 'Mounted' },
  { lvl: 2,  faction: 'Elf',       troops: 'Mounted' },
  { lvl: 3,  faction: 'Cursed',    troops: 'Mounted' },
  { lvl: 4,  faction: 'Barbarian', troops: 'Mounted' },
  { lvl: 5,  faction: 'Inferno',   troops: 'Ranged' },
  { lvl: 6,  faction: 'Undead',    troops: 'Mounted' },
  { lvl: 7,  faction: 'Elf',       troops: 'Mounted or Ranged' },
  { lvl: 8,  faction: 'Cursed',    troops: 'Ranged' },
  { lvl: 9,  faction: 'Barbarian', troops: 'Mounted' },
  { lvl: 10, faction: 'Inferno',   troops: 'Melee' },
  { lvl: 11, faction: 'Elf',       troops: 'Ranged' },
  { lvl: 11, faction: 'Undead',    troops: 'Mounted' },
  { lvl: 12, faction: 'Barbarian', troops: 'Mounted' },
  { lvl: 12, faction: 'Cursed',    troops: 'Mounted' },
  { lvl: 13, faction: 'Inferno',   troops: 'Mounted' },
  { lvl: 13, faction: 'Undead',    troops: 'Mounted' },
  { lvl: 14, faction: 'Cursed',    troops: 'Mounted' },
  { lvl: 14, faction: 'Elf',       troops: 'Ranged' },
  { lvl: 15, faction: 'Barbarian', troops: 'Ranged' },
  { lvl: 15, faction: 'Inferno',   troops: 'Melee' },
  { lvl: 16, faction: 'Cursed',    troops: 'Mounted' },
  { lvl: 16, faction: 'Elf',       troops: 'Mounted or Ranged' },
  { lvl: 16, faction: 'Undead',    troops: 'Mounted' },
  { lvl: 17, faction: 'Barbarian', troops: 'Mounted' },
  { lvl: 17, faction: 'Inferno',   troops: 'Flying Troops' },
  { lvl: 17, faction: 'Undead',    troops: 'Mounted' },
  { lvl: 18, faction: 'Barbarian', troops: 'Mounted' },
  { lvl: 18, faction: 'Cursed',    troops: 'Ranged' },
  { lvl: 18, faction: 'Elf',       troops: 'Ranged' },
  { lvl: 19, faction: 'Elf',       troops: 'Ranged' },
  { lvl: 19, faction: 'Inferno',   troops: 'Melee' },
  { lvl: 19, faction: 'Undead',    troops: 'Mounted' },
  { lvl: 20, faction: 'Barbarian', troops: 'Ranged' },
  { lvl: 20, faction: 'Cursed',    troops: 'Ranged' },
  { lvl: 20, faction: 'Inferno',   troops: 'Mounted' },
  { lvl: 21, faction: 'Barbarian', troops: 'Mounted' },
  { lvl: 21, faction: 'Cursed',    troops: 'Mounted' },
  { lvl: 21, faction: 'Elf',       troops: 'Ranged or Mounted' },
  { lvl: 21, faction: 'Inferno',   troops: 'Mounted' },
  { lvl: 21, faction: 'Undead',    troops: 'Mounted' },
  { lvl: 22, faction: 'Barbarian', troops: 'Mounted or Flying' },
  { lvl: 22, faction: 'Cursed',    troops: 'Ranged' },
  { lvl: 22, faction: 'Elf',       troops: 'Ranged' },
  { lvl: 22, faction: 'Inferno',   troops: 'Flying' },
  { lvl: 22, faction: 'Undead',    troops: 'Mounted or Flying' },
  { lvl: 23, faction: 'Barbarian', troops: 'Ranged' },
  { lvl: 23, faction: 'Cursed',    troops: 'Ranged' },
  { lvl: 23, faction: 'Elf',       troops: 'Ranged' },
  { lvl: 23, faction: 'Inferno',   troops: 'Melee' },
  { lvl: 23, faction: 'Undead',    troops: 'Flying' },
  { lvl: 24, faction: 'Barbarian', troops: 'Mounted' },
  { lvl: 24, faction: 'Cursed',    troops: 'Flying' },
  { lvl: 24, faction: 'Elf',       troops: 'Ranged or Mounted' },
  { lvl: 24, faction: 'Inferno',   troops: 'Flying' },
  { lvl: 24, faction: 'Undead',    troops: 'Mounted' },
  { lvl: 25, faction: 'Barbarian', troops: 'Melee' },
  { lvl: 25, faction: 'Cursed',    troops: 'Ranged' },
  { lvl: 25, faction: 'Elf',       troops: 'Ranged' },
  { lvl: 25, faction: 'Inferno',   troops: 'Ranged' },
  { lvl: 25, faction: 'Undead',    troops: 'Ranged' },
  { lvl: 26, faction: 'Barbarian', troops: 'Ranged' },
  { lvl: 26, faction: 'Cursed',    troops: 'Melee' },
  { lvl: 26, faction: 'Elf',       troops: 'Ranged' },
  { lvl: 26, faction: 'Inferno',   troops: 'Melee' },
  { lvl: 26, faction: 'Undead',    troops: 'Melee' },
  { lvl: 27, faction: 'Barbarian', troops: 'Mounted' },
  { lvl: 27, faction: 'Cursed',    troops: 'Ranged' },
  { lvl: 27, faction: 'Elf',       troops: 'Mounted' },
  { lvl: 27, faction: 'Inferno',   troops: 'Ranged' },
  { lvl: 27, faction: 'Undead',    troops: 'Flying' },
  { lvl: 28, faction: 'Barbarian', troops: 'Flying' },
  { lvl: 28, faction: 'Cursed',    troops: 'Mounted' },
  { lvl: 28, faction: 'Elf',       troops: 'Flying' },
  { lvl: 28, faction: 'Inferno',   troops: 'Mounted' },
  { lvl: 28, faction: 'Undead',    troops: 'Ranged' },
  { lvl: 29, faction: 'Barbarian', troops: 'Dragons, Elementals, Giants, Beasts' },
  { lvl: 29, faction: 'Cursed',    troops: 'Melee' },
  { lvl: 29, faction: 'Elf',       troops: 'Mounted' },
  { lvl: 29, faction: 'Inferno',   troops: 'Ranged' },
  { lvl: 29, faction: 'Undead',    troops: 'Melee' },
  { lvl: 30, faction: 'Barbarian', troops: 'Mounted' },
  { lvl: 30, faction: 'Cursed',    troops: 'Mounted' },
  { lvl: 30, faction: 'Elf',       troops: 'Ranged' },
  { lvl: 30, faction: 'Inferno',   troops: 'Mounted' },
  { lvl: 30, faction: 'Undead',    troops: 'Dragons, Elementals, Giants, Beasts' },
  { lvl: 31, faction: 'Barbarian', troops: 'Mounted' },
  { lvl: 31, faction: 'Cursed',    troops: 'Dragons and Giants' },
  { lvl: 31, faction: 'Elf',       troops: 'Mounted' },
  { lvl: 31, faction: 'Inferno',   troops: 'Mounted' },
  { lvl: 31, faction: 'Undead',    troops: 'Dragons, Giants and Beasts' },
  { lvl: 32, faction: 'Barbarian', troops: 'Ranged' },
  { lvl: 32, faction: 'Cursed',    troops: 'Mounted' },
  { lvl: 32, faction: 'Elf',       troops: 'Giants and Beasts' },
  { lvl: 32, faction: 'Inferno',   troops: 'Mounted' },
  { lvl: 32, faction: 'Undead',    troops: 'Melee' },
  { lvl: 33, faction: 'Barbarian', troops: 'Mounted' },
  { lvl: 33, faction: 'Cursed',    troops: 'Dragons and Giants or Ranged' },
  { lvl: 33, faction: 'Elf',       troops: 'Mounted' },
  { lvl: 33, faction: 'Inferno',   troops: 'Giants and Beasts' },
  { lvl: 33, faction: 'Undead',    troops: 'Dragons, Giants and Beasts' },
  { lvl: 34, faction: 'Barbarian', troops: 'Dragons, Giants and Beasts' },
  { lvl: 34, faction: 'Cursed',    troops: 'Mounted' },
  { lvl: 34, faction: 'Elf',       troops: 'Giants and Beasts' },
  { lvl: 34, faction: 'Inferno',   troops: 'Mounted' },
  { lvl: 34, faction: 'Undead',    troops: 'Melee' },
  { lvl: 35, faction: 'Barbarian', troops: 'Ranged' },
  { lvl: 35, faction: 'Cursed',    troops: 'Dragons and Giants' },
  { lvl: 35, faction: 'Elf',       troops: 'Mounted' },
  { lvl: 35, faction: 'Inferno',   troops: 'Mounted' },
  { lvl: 35, faction: 'Undead',    troops: 'Melee' },
  { lvl: 36, faction: 'Cursed',    troops: 'Melee' },
  { lvl: 36, faction: 'Elf',       troops: 'Melee or Mounted' },
  { lvl: 36, faction: 'Undead',    troops: 'Ranged or Monsters' },
  { lvl: 37, faction: 'Cursed',    troops: 'Mounted' },
  { lvl: 37, faction: 'Elf',       troops: 'Monsters (not Melee)' },
  { lvl: 37, faction: 'Undead',    troops: 'Melee or Monsters (not Beasts)' },
  { lvl: 38, faction: 'Elf',       troops: 'Melee or Mounted' },
  { lvl: 38, faction: 'Inferno',   troops: 'Mounted' },
  { lvl: 38, faction: 'Undead',    troops: 'Ranged or Monsters' },
  { lvl: 39, faction: 'Cursed',    troops: 'Melee' },
  { lvl: 39, faction: 'Undead',    troops: 'Melee or Monsters (not Beasts)' },
  { lvl: 40, faction: 'Elf',       troops: 'Monsters (not Melee)' },
  { lvl: 40, faction: 'Inferno',   troops: 'Mounted' },
  { lvl: 41, faction: 'Cursed',    troops: 'Melee' },
  { lvl: 41, faction: 'Undead',    troops: 'Ranged or Monsters' },
  { lvl: 42, faction: 'Cursed',    troops: 'Mounted' },
  { lvl: 42, faction: 'Elf',       troops: 'Monsters (not Melee)' },
  { lvl: 42, faction: 'Undead',    troops: 'Melee or Monsters (not Beasts)' },
  { lvl: 43, faction: 'Elf',       troops: 'Melee or Mounted' },
  { lvl: 43, faction: 'Undead',    troops: 'Ranged or Monsters' },
  { lvl: 44, faction: 'Cursed',    troops: 'Melee' },
  { lvl: 44, faction: 'Inferno',   troops: 'Ranged or Flying (not Dragons)' },
  { lvl: 44, faction: 'Undead',    troops: 'Melee or Monsters (not Beasts)' },
  { lvl: 45, faction: 'Cursed',    troops: 'Mounted' },
  { lvl: 45, faction: 'Inferno',   troops: 'Mounted' },
]

const LEVELS = Array.from({ length: 45 }, (_, i) => i + 1)
const FACTIONS = ['All', 'Barbarian', 'Cursed', 'Elf', 'Inferno', 'Undead']

export function Tips() {
  const [mode, setMode] = useState('regular') // 'regular' | 'rare'
  const [selectedLvl, setSelectedLvl] = useState(null)
  const [faction, setFaction] = useState('All')

  const data = mode === 'regular' ? REGULAR : RARE

  const filtered = useMemo(() => {
    return data.filter(m =>
      (selectedLvl === null || m.lvl === selectedLvl) &&
      (faction === 'All' || m.faction === faction)
    )
  }, [data, selectedLvl, faction])

  // Group by level for display
  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach(m => {
      if (!map[m.lvl]) map[m.lvl] = []
      map[m.lvl].push(m)
    })
    return Object.entries(map).sort((a, b) => Number(a[0]) - Number(b[0]))
  }, [filtered])

  return (
    <div>
      <div className="page-header">
        <h1>Monster Guide</h1>
        <p>Which troops to use against each monster level</p>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Regular / Rare toggle */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setMode('regular')}
            className={`btn${mode === 'regular' ? ' active' : ''}`}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            ⚔️ Regular Monsters
          </button>
          <button
            onClick={() => setMode('rare')}
            className={`btn${mode === 'rare' ? ' active' : ''}`}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            ⭐ Rare Monsters (Hero only)
          </button>
        </div>

        {mode === 'rare' && (
          <div style={{
            background: 'var(--primary-bg)', border: '1px solid var(--primary)',
            borderRadius: 'var(--radius-lg)', padding: '10px 14px',
            fontSize: 13, color: 'var(--primary-dark)', fontWeight: 600,
          }}>
            ⚠️ Rare monsters are solo Hero attacks only — do not send troops
          </div>
        )}

        {/* Filters */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Level picker */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
              Filter by level
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              <button
                onClick={() => setSelectedLvl(null)}
                className={`btn${selectedLvl === null ? ' active' : ''}`}
                style={{ padding: '4px 10px', fontSize: 12 }}
              >
                All
              </button>
              {LEVELS.map(l => (
                <button
                  key={l}
                  onClick={() => setSelectedLvl(selectedLvl === l ? null : l)}
                  className={`btn${selectedLvl === l ? ' active' : ''}`}
                  style={{ padding: '4px 10px', fontSize: 12, minWidth: 36 }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Faction filter */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
              Filter by faction
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {FACTIONS.map(f => (
                <button
                  key={f}
                  onClick={() => setFaction(f)}
                  className={`btn${faction === f ? ' active' : ''}`}
                  style={{ padding: '4px 12px', fontSize: 12 }}
                >
                  {f !== 'All' ? FACTION_EMOJI[f] + ' ' : ''}{f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {grouped.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
            No data available for this combination yet.
          </div>
        ) : (
          grouped.map(([lvl, monsters]) => (
            <div key={lvl} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                padding: '10px 16px',
                background: 'var(--bg3)',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{
                  background: 'var(--primary)', color: '#000',
                  padding: '2px 12px', borderRadius: 99,
                  fontSize: 12, fontWeight: 700,
                }}>
                  Level {lvl}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {monsters.length} {monsters.length === 1 ? 'monster type' : 'monster types'}
                </span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Faction</th>
                    <th>Use these troops</th>
                  </tr>
                </thead>
                <tbody>
                  {monsters.map((m, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                        <span style={{ marginRight: 6 }}>{FACTION_EMOJI[m.faction]}</span>
                        {m.faction}
                      </td>
                      <td>
                        <TroopBadge text={m.troops} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}

      </div>
    </div>
  )
}
