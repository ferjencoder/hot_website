import { useChestData } from '../hooks/useChestData.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Category colours for column headers — matches Excel colour groupings
const COL_CATEGORY = {
  'L5 Crypt':           'crypt',
  'L10 Crypt':          'crypt',
  'L15 Crypt':          'crypt',
  'L20 Crypt':          'crypt',
  'L25 Crypt':          'crypt',
  'L10 rare Crypt':     'rare',
  'L15 rare Crypt':     'rare',
  'L20 rare Crypt':     'rare',
  'L25 rare Crypt':     'rare',
  'L30 rare Crypt':     'rare',
  'L15 epic Crypt':     'epic',
  'L20 epic Crypt':     'epic',
  'L25 epic Crypt':     'epic',
  'L30 epic Crypt':     'epic',
  'L35 epic Crypt':     'epic',
  'L10 Citadel':        'citadel',
  'L15 Citadel':        'citadel',
  'L20 Citadel':        'citadel',
  'L25 Citadel':        'citadel',
  'L30 Citadel':        'citadel',
  'L16-24 Heroic':      'heroic',
  'L25-30 Heroic':      'heroic',
  'L31+ Heroic':        'heroic',
  'L40+ Heroic':        'heroic',
  'Bank':               'bank',
  'Ragnarok Chests':    'special',
  'Olympus Chests':     'special',
  'Ancients vaults':    'special',
  'Others':             'special',
  'L10 Tartaros Crypt': 'tartaros',
  'L15 Tartaros Crypt': 'tartaros',
  'L20 Tartaros Crypt': 'tartaros',
  'L25 Tartaros Crypt': 'tartaros',
  'L30 Tartaros Crypt': 'tartaros',
  'L35 Tartaros Crypt': 'tartaros',
  'Ancients Chests':    'ancients',
  'Epic Monster Chests':'epic',
}

const CAT_COLORS = {
  crypt:    { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
  rare:     { bg: '#e0f2fe', color: '#075985', border: '#bae6fd' },
  epic:     { bg: '#f3e8ff', color: '#6b21a8', border: '#e9d5ff' },
  citadel:  { bg: '#fff7ed', color: '#9a3412', border: '#fed7aa' },
  heroic:   { bg: '#fef9c3', color: '#713f12', border: '#fef08a' },
  bank:     { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
  special:  { bg: '#fce7f3', color: '#9d174d', border: '#fbcfe8' },
  tartaros: { bg: '#fef3c7', color: '#78350f', border: '#fde68a' },
  ancients: { bg: '#f0fdf4', color: '#14532d', border: '#bbf7d0' },
}

// Shorten long column names for the rotated header
function shortName(col) {
  return col
    .replace(' Crypt', '')
    .replace(' Chests', '')
    .replace(' vaults', ' vlt')
    .replace('Tartaros ', 'Tar ')
    .replace('Ancients', 'Anc')
    .replace('Epic Monster', 'Epic Mon')
    .replace('Heroic', 'Hero')
    .replace('Citadel', 'Cit')
    .replace('Olympus', 'Olym')
    .replace('Ragnarok', 'Ragn')
}

export default function Breakdown() {
  const { member } = useAuth()
  const [searchParams] = useSearchParams()
  const initialWeek = parseInt(searchParams.get('week') || '0', 10)

  const {
    weeks, weekIndex, setWeekIndex,
    currentWeek, chestColumns, scoring, weeklyTarget,
    loading, error, generated,
  } = useChestData()

  useEffect(() => {
    if (!isNaN(initialWeek) && initialWeek < weeks.length) {
      setWeekIndex(initialWeek)
    }
  }, [initialWeek, weeks.length])

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
      Loading chest data...
    </div>
  )

  if (error || !currentWeek) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
        {error || 'No chest data yet — run Sync from the HOT Clan app.'}
      </p>
    </div>
  )

  const members = currentWeek.members || []
  const cols    = chestColumns.length ? chestColumns : []

  // Column totals
  const colTotals = {}
  cols.forEach(c => {
    colTotals[c] = members.reduce((s, m) => s + (m.breakdown?.[c] || 0), 0)
  })

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1>Full Breakdown</h1>
          <p>{currentWeek.label}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {weeks.length > 1 && (
            <select
              value={weekIndex}
              onChange={e => setWeekIndex(Number(e.target.value))}
              style={{ width: 'auto', fontSize: 13, padding: '6px 10px' }}
            >
              {weeks.map((w, i) => (
                <option key={w.start} value={i}>
                  {i === 0 ? `📅 ${w.label} (current)` : w.label}
                </option>
              ))}
            </select>
          )}
          <Link to="/leaderboard" className="btn" style={{ fontSize: 13 }}>
            ← Leaderboard
          </Link>
        </div>
      </div>

      <div className="page-body">

        {/* Summary row */}
        <div className="metric-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: 16 }}>
          <div className="metric-card">
            <div className="metric-label">Total points</div>
            <div className="metric-val">{currentWeek.total_points.toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Total chests</div>
            <div className="metric-val" style={{ color: 'var(--text)' }}>
              {currentWeek.total_chests.toLocaleString()}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Hit target</div>
            <div className="metric-val" style={{ color: 'var(--green)' }}>
              {members.filter(m => m.met_target).length}
              <span style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 400 }}>
                /{members.length}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable table */}
        <div style={{
          overflowX: 'auto',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          background: 'var(--bg2)',
        }}>
          <table style={{
            width: 'max-content',
            minWidth: '100%',
            fontSize: 12,
            borderCollapse: 'collapse',
          }}>
            <thead>
              {/* Category header row */}
              <tr>
                <th style={{ ...stickyCol(0), background: 'var(--bg3)', minWidth: 140, fontSize: 10 }}>Member</th>
                <th style={{ ...stickyCol(140), background: 'var(--bg3)', minWidth: 72, fontSize: 10, textAlign: 'right' }}>Points</th>
                <th style={{ ...stickyCol(212), background: 'var(--bg3)', minWidth: 54, fontSize: 10, textAlign: 'right' }}>Chests</th>
                {cols.map(col => {
                  const cat   = COL_CATEGORY[col] || 'bank'
                  const style = CAT_COLORS[cat] || CAT_COLORS.bank
                  return (
                    <th key={col} style={{
                      background:  style.bg,
                      color:       style.color,
                      borderBottom: `2px solid ${style.border}`,
                      padding: '6px 4px 4px',
                      minWidth: 46,
                      maxWidth: 46,
                      fontWeight: 600,
                      fontSize: 9,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      verticalAlign: 'bottom',
                      textAlign: 'center',
                    }}>
                      {/* Rotated label */}
                      <div style={{
                        writingMode: 'vertical-rl',
                        transform: 'rotate(180deg)',
                        height: 80,
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-end',
                        paddingBottom: 4,
                        fontSize: 10,
                        fontWeight: 700,
                      }}>
                        {shortName(col)}
                      </div>
                      {/* Points per chest */}
                      <div style={{ fontSize: 9, opacity: 0.7, marginTop: 2 }}>
                        {scoring[col] > 0 ? `${scoring[col]}p` : '—'}
                      </div>
                    </th>
                  )
                })}
              </tr>
              {/* Column totals row */}
              <tr style={{ background: 'var(--bg4)' }}>
                <td style={{ ...stickyCol(0), background: 'var(--bg4)', padding: '5px 12px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>
                  TOTAL
                </td>
                <td style={{ ...stickyCol(140), background: 'var(--bg4)', padding: '5px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--primary-dark)', fontSize: 11 }}>
                  {currentWeek.total_points.toLocaleString()}
                </td>
                <td style={{ ...stickyCol(212), background: 'var(--bg4)', padding: '5px 8px', textAlign: 'right', fontWeight: 700, fontSize: 11 }}>
                  {currentWeek.total_chests.toLocaleString()}
                </td>
                {cols.map(col => (
                  <td key={col} style={{
                    padding: '5px 4px',
                    textAlign: 'center',
                    fontWeight: colTotals[col] > 0 ? 700 : 400,
                    color: colTotals[col] > 0 ? 'var(--text)' : 'var(--text-muted)',
                    fontSize: 11,
                    background: 'var(--bg4)',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    {colTotals[col] || '—'}
                  </td>
                ))}
              </tr>
            </thead>

            <tbody>
              {members.map((m, idx) => {
                const isSelf = m.name === member
                const rowBg  = isSelf
                  ? 'var(--primary-bg)'
                  : idx % 2 === 0 ? 'var(--bg2)' : 'var(--bg3)'
                return (
                  <tr key={m.name} style={{ background: rowBg }}>
                    {/* Sticky: Name */}
                    <td style={{
                      ...stickyCol(0),
                      background: rowBg,
                      padding: '8px 12px',
                      fontWeight: isSelf ? 700 : 500,
                      color: isSelf ? 'var(--primary-dark)' : 'var(--text)',
                      whiteSpace: 'nowrap',
                      borderBottom: '1px solid var(--border-dim)',
                    }}>
                      {m.name}
                      {isSelf && <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>you</span>}
                    </td>
                    {/* Sticky: Points */}
                    <td style={{
                      ...stickyCol(140),
                      background: rowBg,
                      padding: '8px 8px',
                      textAlign: 'right',
                      fontWeight: 700,
                      color: m.met_target ? 'var(--green)' : m.points > 0 ? 'var(--primary-dark)' : 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      borderBottom: '1px solid var(--border-dim)',
                    }}>
                      {m.points.toLocaleString()}
                      {m.met_target && <span style={{ marginLeft: 4, fontSize: 10 }}>✓</span>}
                    </td>
                    {/* Sticky: Total chests */}
                    <td style={{
                      ...stickyCol(212),
                      background: rowBg,
                      padding: '8px 8px',
                      textAlign: 'right',
                      color: 'var(--text-dim)',
                      whiteSpace: 'nowrap',
                      borderBottom: '1px solid var(--border-dim)',
                    }}>
                      {m.chests}
                    </td>
                    {/* Chest type cells */}
                    {cols.map(col => {
                      const val = m.breakdown?.[col] || 0
                      const cat = COL_CATEGORY[col] || 'bank'
                      const catStyle = CAT_COLORS[cat] || CAT_COLORS.bank
                      return (
                        <td key={col} style={{
                          padding: '6px 4px',
                          textAlign: 'center',
                          fontSize: 12,
                          fontWeight: val > 0 ? 700 : 400,
                          color: val > 0 ? catStyle.color : 'var(--text-muted)',
                          background: val > 0 ? catStyle.bg : 'transparent',
                          borderBottom: '1px solid var(--border-dim)',
                          opacity: val === 0 ? 0.35 : 1,
                        }}>
                          {val > 0 ? val : '·'}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {generated && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
            Last synced: {generated}
          </p>
        )}
      </div>
    </div>
  )
}

// Helper: sticky left column styles
function stickyCol(left) {
  return {
    position: 'sticky',
    left,
    zIndex: 2,
    borderRight: '1px solid var(--border)',
  }
}