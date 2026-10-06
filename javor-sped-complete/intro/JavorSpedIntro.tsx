'use client'
import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { LOGO_GRADIENT, LOGO_PATH, LOGO_TRANSFORM, LOGO_VIEWBOX } from './logo-mark'
import './javor-sped-intro.css'

gsap.registerPlugin(useGSAP)

type Props = {
  /** Called when the black screen starts fading: start the hero text entrance here. */
  onReveal?: () => void
  /** Called when the intro is completely finished and removed. */
  onDone?: () => void
}

/**
 * Homepage opening sequence on a black screen (about 7 seconds):
 * 1. The logo loads inside a gold ring that draws as a 000–100 counter runs
 * 2. The logo fades and "JS" rises into the ring
 * 3. JS → JAVOR (the S steps out, AVOR unfolds after the J)
 * 4. JAVOR → JAVOR-SPED
 * 5. The wordmark lifts away and the black fades to uncover the hero
 * The hero photo must already be rendered underneath; this only uncovers it.
 */
export default function JavorSpedIntro({ onReveal, onDone }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)

  useGSAP(() => {
    const el = root.current
    if (!el) return
    const q = gsap.utils.selector(el)
    const finish = () => { setGone(true); onDone?.() }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { onReveal?.(); finish(); return }

    const prog = el.querySelector('.prog') as SVGCircleElement
    const count = el.querySelector('.count') as HTMLElement
    const len = 2 * Math.PI * 72
    const c = { v: 0 }
    gsap.set(prog, { strokeDasharray: len, strokeDashoffset: len })
    gsap.set(q('.l-j, .l-s'), { yPercent: 60, opacity: 0 })
    gsap.set(q('.logo-mark'), { opacity: 0, scale: 0.92, transformOrigin: '50% 50%' })

    const run = () => {
      gsap.timeline()
        // 1 · the logo loads inside the ring
        .to(q('.logo-mark'), { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }, 0.15)
        .to(prog, { strokeDashoffset: 0, duration: 1.8, ease: 'power1.inOut' }, 0.2)
        .to(c, { v: 100, duration: 1.8, ease: 'power1.inOut',
          onUpdate: () => { count.textContent = String(Math.round(c.v)).padStart(3, '0') } }, 0.2)
        .to(q('.count'), { opacity: 0, duration: 0.4 }, 2.0)
        .to(q('.logo-mark'), { opacity: 0, scale: 0.94, duration: 0.45, ease: 'power2.in' }, 2.05)
        // 2 · JS rises into the ring
        .to(q('.l-j'), { yPercent: 0, opacity: 1, duration: 0.65, ease: 'power3.out' }, 2.45)
        .to(q('.l-s'), { yPercent: 0, opacity: 1, duration: 0.65, ease: 'power3.out' }, 2.6)
        .to(q('.ring'), { opacity: 0, scale: 1.12, duration: 0.5, ease: 'power2.in', transformOrigin: '50% 50%' }, 3.35)
        // 3 · JS → JAVOR
        .to(q('.l-s'), { width: 0, opacity: 0, duration: 0.6, ease: 'power3.inOut' }, 3.6)
        .to(q('.x-avor'), { width: 'auto', opacity: 1, duration: 0.9, ease: 'power3.inOut' }, 3.6)
        // 4 · JAVOR → JAVOR-SPED
        .to(q('.x-dash'), { width: 'auto', opacity: 1, paddingLeft: '.1em', paddingRight: '.1em', duration: 0.5, ease: 'power3.inOut' }, 4.7)
        .to(q('.l-s'), { width: 'auto', opacity: 1, duration: 0.6, ease: 'power3.inOut' }, 4.8)
        .to(q('.x-ped'), { width: 'auto', opacity: 1, duration: 0.8, ease: 'power3.inOut' }, 4.9)
        // 5 · fade into the hero
        .to(q('.wm'), { opacity: 0, y: -18, duration: 0.6, ease: 'power2.in' }, 6.0)
        .add(() => onReveal?.(), 6.3)
        .to(q('.intro-bg'), { opacity: 0, duration: 1.2, ease: 'power2.inOut' }, 6.3)
        .add(finish, 7.5)
    }
    // wait for the fonts so the letter widths are measured correctly
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    ;(fonts ? fonts.ready : Promise.resolve()).then(run)
  }, { scope: root })

  if (gone) return null
  return (
    <div ref={root} className="intro" aria-hidden="true">
      <div className="intro-bg" />
      <svg className="ring" viewBox="0 0 150 150">
        <circle className="base" cx="75" cy="75" r="72" />
        <circle className="prog" cx="75" cy="75" r="72" />
      </svg>
      <svg className="logo-mark" viewBox={LOGO_VIEWBOX}>
        <defs>
          <linearGradient id="introGold" gradientUnits="userSpaceOnUse" {...LOGO_GRADIENT}>
            <stop offset="0" stopColor="#8E7240" /><stop offset=".4" stopColor="#C9A45C" />
            <stop offset=".65" stopColor="#E6CF9A" /><stop offset="1" stopColor="#C9A45C" />
          </linearGradient>
        </defs>
        <path transform={LOGO_TRANSFORM} fill="url(#introGold)" d={LOGO_PATH} />
      </svg>
      <div className="count">000</div>
      <div className="intro-stage">
        <div className="wm">
          <span className="gold l-j">J</span><span className="gold x x-avor">AVOR</span>
          <span className="gold x x-dash">-</span>
          <span className="gold l-s">S</span><span className="gold x x-ped">PED</span>
        </div>
      </div>
    </div>
  )
}
