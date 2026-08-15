const defaults = { className: 'h-5 w-5', strokeWidth: 1.75 }

export function IconDashboard(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...defaults} {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  )
}

export function IconIncome(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...defaults} {...props}>
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M2 10h20" strokeLinecap="round" />
      <path d="M12 14v-3M10.5 12.5 12 14l1.5-1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconExpense(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...defaults} {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" strokeLinecap="round" />
      <path d="M6 15h3M13 15h5" strokeLinecap="round" />
    </svg>
  )
}

export function IconTrendDown(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...defaults} {...props}>
      <path d="M3 17l6-6 4 4 8-10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 5h7v7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconTrendUp(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...defaults} {...props}>
      <path d="M3 17l6-6 4 4 8-10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 7h7v7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconAlert({ className = '', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={`h-4 w-4 shrink-0 ${className}`}
      strokeWidth={1.75}
      {...props}
    >
      <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
      <path d="M10.3 4.5h3.4L20 18H4L10.3 4.5z" strokeLinejoin="round" />
    </svg>
  )
}

export function IconDownload({ className = '', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={`h-4 w-4 shrink-0 ${className}`}
      strokeWidth={1.75}
      {...props}
    >
      <path d="M12 3v12M8 11l4 4 4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconInvoice(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...defaults} {...props}>
      <path d="M9 3h6l4 4v14H5V3h4z" />
      <path d="M14 3v5h5M8 12h8M8 16h5" strokeLinecap="round" />
    </svg>
  )
}

export function IconUsers(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...defaults} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15 20c.3-2.2 1.8-4 4-4" strokeLinecap="round" />
    </svg>
  )
}

export function IconTarget(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...defaults} {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconSparkles(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...defaults} {...props}>
      <path d="M12 3l1.2 4.8L18 9l-4.8 1.2L12 15l-1.2-4.8L6 9l4.8-1.2L12 3z" strokeLinejoin="round" />
      <path d="M5 17l.6 2.4L8 20l-2.4.6L5 23l-.6-2.4L2 20l2.4-.6L5 17z" strokeLinejoin="round" />
    </svg>
  )
}

export function IconSettings(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...defaults} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" strokeLinecap="round" />
    </svg>
  )
}

export function IconWallet(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...defaults} {...props}>
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M3 10h18M16 14h2" strokeLinecap="round" />
    </svg>
  )
}

export function IconPieChart(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...defaults} {...props}>
      <path d="M12 3v9h9a9 9 0 00-9-9z" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

export function IconPlus(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...defaults} {...props}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}

export function IconPencil(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4" strokeWidth={1.75} {...props}>
      <path d="M4 20h4l10-10-4-4L4 16v4z" strokeLinejoin="round" />
      <path d="M13 6l4 4" strokeLinecap="round" />
    </svg>
  )
}

export function IconTrash(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4" strokeWidth={1.75} {...props}>
      <path d="M4 7h16M9 7V5h6v2M7 7l1 12h8l1-12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconInfo(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4" strokeWidth={1.75} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6M12 7h.01" strokeLinecap="round" />
    </svg>
  )
}

export function IconCalendar(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4" strokeWidth={1.75} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" />
    </svg>
  )
}

export function IconScan(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4" strokeWidth={1.75} {...props}>
      <path d="M4 7V5a1 1 0 011-1h2M16 4h2a1 1 0 011 1v2M20 17v2a1 1 0 01-1 1h-2M8 20H6a1 1 0 01-1-1v-2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  )
}

const NAV_ICON_MAP = {
  dashboard: IconDashboard,
  income: IconIncome,
  expense: IconExpense,
  invoice: IconInvoice,
  family: IconUsers,
  ai: IconSparkles,
  settings: IconSettings,
}

export function NavIcon({ name, className = 'h-5 w-5' }) {
  const Icon = NAV_ICON_MAP[name]
  return Icon ? <Icon className={className} /> : null
}
