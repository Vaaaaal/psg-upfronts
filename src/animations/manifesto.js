// Manifesto hero — the image starts full screen, shrinks (pin + scrub) into
// its slot, then the small logo + "Manifesto" label are revealed.
// Import and call `initManifestoHeroAnimation()` in `src/main.js` (DOMContentLoaded).
// Logs and markers are silent unless the page is opened with `?debug`.
//
// Webflow structure:
// [data-animation="manifesto-hero"]   section (trigger + pinned element)
//   [data-manifesto-reveal]           small logo, label (revealed at the end)
//   [data-manifesto-slot]             final size/position, stays in the flow
//     [data-manifesto-media]          animated wrapper (absolute, 100% × 100%)
//       img
//
// Anti-flash CSS (page head custom code):
// html.w-mod-js [data-animation="manifesto-hero"] { visibility: hidden; }
// html.w-mod-js [data-manifesto-reveal] { opacity: 0; visibility: hidden; }

import gsap from 'gsap/dist/gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
import { createLogger } from '../utils/logger'

const MANIFESTO_HERO_SELECTOR = '[data-animation="manifesto-hero"]'
const SLOT_SELECTOR = '[data-manifesto-slot]'
const MEDIA_SELECTOR = '[data-manifesto-media]'
const REVEAL_SELECTOR = '[data-manifesto-reveal]'
const MOBILE_BREAKPOINT = 480

const CONFIG = {
    center: true, // true: image ends centered in the viewport
    distance: 1, // scrub length, in viewport heights
    ease: 'power2.inOut', // shrink easing
    scrub: true, // true: sticks to the scroll · 1: smoothed
    minPad: 48, // min padding-top in centered mode (px)
    runOnMobile: true // false: static final state under MOBILE_BREAKPOINT
}

const logger = createLogger('manifesto-hero')

let manifestoHeroAnimationInitialized = false

// Slot position relative to the section (reliable during the pin too)
function getSlotOffset(section, slot) {
    const s = section.getBoundingClientRect()
    const r = slot.getBoundingClientRect()
    return { top: r.top - s.top, left: r.left - s.left, height: r.height }
}

// Centered mode: padding-top computed so the slot sits in the middle of the
// viewport. Start (full screen) and end share the same center.
function applyCentering(section, enabled) {
    section.style.paddingTop = ''
    if (!enabled) return

    const slot = section.querySelector(SLOT_SELECTOR)
    if (!slot) return

    const offset = getSlotOffset(section, slot)
    const padding = parseFloat(getComputedStyle(section).paddingTop)
    const head = offset.top - padding // logo + label above the slot
    const target = window.innerHeight / 2 - offset.height / 2 - head
    section.style.paddingTop = `${Math.max(CONFIG.minPad, target)}px`
}

function showStaticState(section) {
    gsap.set(section, { visibility: 'visible' })
    gsap.set(section.querySelectorAll(REVEAL_SELECTOR), { autoAlpha: 1 })
}

function createManifestoHeroAnimation(section) {
    if (!section) return

    const slot = section.querySelector(SLOT_SELECTOR)
    const media = section.querySelector(MEDIA_SELECTOR)
    const reveals = section.querySelectorAll(REVEAL_SELECTOR)

    if (!slot || !media) {
        logger.log('missing slot or media, showing static state', section)
        showStaticState(section)
        return
    }

    const offset = () => getSlotOffset(section, slot)

    // Small logo + label: played, not scrubbed
    const reveal = gsap.timeline({ paused: true }).fromTo(
        reveals,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }
    )

    // Image shrink, scrubbed during the pin
    gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${window.innerHeight * CONFIG.distance}`,
            scrub: CONFIG.scrub,
            pin: true,
            // Required: the section's parent (main.page_main) is display:flex,
            // and ScrollTrigger then disables pinSpacing by default.
            pinSpacing: true,
            // Measured before the ScrollTriggers further down the page, so
            // they take the extra space added by this pin into account.
            refreshPriority: 1,
            invalidateOnRefresh: true,
            markers: logger.markers,
            onLeave: () => {
                logger.log('pin end, reveal')
                reveal.play()
            },
            onEnterBack: () => reveal.reverse()
        }
    }).fromTo(
        media,
        {
            top: () => -offset().top,
            left: () => -offset().left,
            width: () => document.documentElement.clientWidth,
            height: () => window.innerHeight
        },
        { top: 0, left: 0, width: '100%', height: '100%', ease: CONFIG.ease }
    )

    gsap.set(section, { visibility: 'visible' })
}

export function initManifestoHeroAnimation(scope = document) {
    if (manifestoHeroAnimationInitialized) return

    const elements = scope.querySelectorAll(MANIFESTO_HERO_SELECTOR)
    logger.log('elements found:', elements.length, elements)
    if (!elements.length) return

    // The image is shown full screen: force the largest responsive variant
    elements.forEach((section) => {
        const img = section.querySelector(`${MEDIA_SELECTOR} img`)
        if (!img) return
        img.sizes = '100vw'
        img.loading = 'eager'
    })

    // Centering must run before ScrollTrigger measures positions
    let centeringEnabled = false
    const updateCentering = () =>
        elements.forEach((section) => applyCentering(section, centeringEnabled))
    ScrollTrigger.addEventListener('refreshInit', updateCentering)

    const mm = gsap.matchMedia()
    mm.add(
        {
            isDesktop: `(min-width: ${MOBILE_BREAKPOINT}px)`,
            isMobile: `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
            reduceMotion: '(prefers-reduced-motion: reduce)'
        },
        (context) => {
            logger.log('matchMedia', context.conditions)
            const { isMobile, reduceMotion } = context.conditions

            if (reduceMotion || (isMobile && !CONFIG.runOnMobile)) {
                centeringEnabled = false
                updateCentering()
                elements.forEach(showStaticState)
                return
            }

            centeringEnabled = CONFIG.center
            updateCentering()
            elements.forEach((section) => {
                createManifestoHeroAnimation(section)
            })
        }
    )

    // Images and fonts can shift the layout after DOMContentLoaded
    window.addEventListener('load', () => ScrollTrigger.refresh())

    manifestoHeroAnimationInitialized = true
}