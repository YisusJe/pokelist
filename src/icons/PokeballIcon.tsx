export const PokeballIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox='0 0 32 32' aria-hidden='true'>
    <circle cx='16' cy='16' r='14' fill='var(--paper)' stroke='var(--ink)' strokeWidth='2' />
    <path d='M2 16a14 14 0 0 1 28 0z' fill='var(--accent)' stroke='var(--ink)' strokeWidth='2' />
    <path d='M2 16h9a5 5 0 0 0 10 0h9' fill='none' stroke='var(--ink)' strokeWidth='2' />
    <circle cx='16' cy='16' r='4' fill='var(--paper)' stroke='var(--ink)' strokeWidth='2' />
  </svg>
)
