'use client'

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { cn } from '@/lib/utils'

type ChangelogRailProps = {
  children: ReactNode
  className?: string
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function ChangelogRail({ children, className }: ChangelogRailProps) {
  const railRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Array<HTMLDivElement | null>>([])
  const [progress, setProgress] = useState(0)
  const [allowMotion, setAllowMotion] = useState(false)
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set())

  const items = Children.toArray(children)
  const itemCount = items.length

  const updateProgress = useCallback(() => {
    const el = railRef.current
    if (!el) return

    if (prefersReducedMotion()) {
      setProgress(100)
      return
    }

    const rect = el.getBoundingClientRect()
    const viewportAnchor = window.innerHeight * 0.35
    const scrolled = viewportAnchor - rect.top
    const next = rect.height <= 0 ? 0 : Math.min(1, Math.max(0, scrolled / rect.height))
    setProgress(next * 100)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')

    const revealVisibleItems = () => {
      const visible = new Set<number>()
      for (const item of itemRefs.current) {
        if (!item) continue
        const index = Number(item.dataset.index)
        const rect = item.getBoundingClientRect()
        if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
          visible.add(index)
        }
      }
      setRevealed(visible)
    }

    const applyPreference = () => {
      if (media.matches) {
        setAllowMotion(false)
        setProgress(100)
        setRevealed(new Set(Array.from({ length: itemCount }, (_, index) => index)))
        return
      }

      setAllowMotion(true)
      revealVisibleItems()
      updateProgress()
    }

    applyPreference()

    const itemsInRail = itemRefs.current.filter(Boolean) as HTMLDivElement[]
    const observer = new IntersectionObserver(
      (entries) => {
        if (media.matches) return
        setRevealed((prev) => {
          const next = new Set(prev)
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            const index = Number((entry.target as HTMLElement).dataset.index)
            if (!Number.isNaN(index)) next.add(index)
          }
          return next
        })
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' },
    )

    for (const item of itemsInRail) observer.observe(item)

    const onScroll = () => {
      updateProgress()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    media.addEventListener('change', applyPreference)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      media.removeEventListener('change', applyPreference)
    }
  }, [itemCount, updateProgress])

  return (
    <div ref={railRef} className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 start-0 w-6 md:start-[calc(18rem+2rem)]"
      >
        <div className="absolute start-1/2 top-0 h-full w-px -translate-x-1/2 bg-border" />
        <div
          className="absolute start-1/2 top-0 w-px -translate-x-1/2 bg-primary motion-reduce:!h-full"
          style={{ height: `${progress}%` }}
        />
      </div>
      <div className={className}>
        {items.map((child, index) => {
          const isRevealed = !allowMotion || revealed.has(index)
          const key = isValidElement(child) && child.key != null ? child.key : index

          return (
            <div
              key={key}
              ref={(node) => {
                itemRefs.current[index] = node
              }}
              data-index={index}
              className={cn(
                'relative motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:animate-none',
                isRevealed && 'is-active',
                allowMotion && !isRevealed && 'translate-y-4 opacity-0',
                allowMotion && isRevealed && 'animate-in fade-in slide-in-from-bottom-4 duration-500',
              )}
            >
              {child}
            </div>
          )
        })}
      </div>
    </div>
  )
}
