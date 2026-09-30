import gsap from 'gsap/dist/gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'

const TARGET_STICKY_SELECTOR = '[data-animation="target-sticky"]'
const MOBILE_BREAKPOINT = 480

let targetStickyAnimationInitialized = false

function createTargetStickyAnimation(element) {
    if (!element) return

    const container = element.parentElement
    if (!container) return

    // Pin once the element's center reaches the viewport center, and release it
    // when its bottom meets the bottom of its parent (sticky-like behavior).
    ScrollTrigger.create({
        trigger: element,
        start: 'center center',
        endTrigger: container,
        end: () => `bottom ${window.innerHeight / 2 + element.offsetHeight / 2}px`,
        pin: true,
        pinSpacing: false,
        invalidateOnRefresh: true
    })
}

export function initTargetStickyAnimation(scope = document) {
    if (targetStickyAnimationInitialized) return

    const elements = scope.querySelectorAll(TARGET_STICKY_SELECTOR)
    if (!elements.length) return

    const mm = gsap.matchMedia()
    mm.add(
        {
            isDesktop: `(min-width: ${MOBILE_BREAKPOINT}px)`,
            isMobile: `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
        },
        (context) => {
            // Remove this line to also run the animation on mobile.
            if (context.conditions.isMobile) return

            elements.forEach((element) => {
                createTargetStickyAnimation(element)
            })
        }
    )

    targetStickyAnimationInitialized = true
}
