// Template — duplicate this file to create a new animation.
// 1. Rename the file (kebab-case), e.g. `my-animation.js`
// 2. Replace `Template` / `template` with the animation name
// 3. Import and call `initTemplateAnimation()` in `src/main.js` (DOMContentLoaded)
// Add `import ScrollTrigger from 'gsap/dist/ScrollTrigger'` if you need
// `ScrollTrigger.create` (the plugin is already registered in main.js).
// Logs are silent unless the page is opened with `?debug` (see utils/logger.js).

import gsap from 'gsap/dist/gsap'
import { createLogger } from '../utils/logger'

const TEMPLATE_SELECTOR = '[data-animation="template"]'
const MOBILE_BREAKPOINT = 480

const logger = createLogger('template')

let templateAnimationInitialized = false

function createTemplateAnimation(element) {
    if (!element) return

    gsap.from(element, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            once: true,
            markers: logger.markers
        }
    })
}

export function initTemplateAnimation(scope = document) {
    if (templateAnimationInitialized) return

    const elements = scope.querySelectorAll(TEMPLATE_SELECTOR)
    logger.log('elements found:', elements.length, elements)
    if (!elements.length) return

    const mm = gsap.matchMedia()
    mm.add(
        {
            isDesktop: `(min-width: ${MOBILE_BREAKPOINT}px)`,
            isMobile: `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
        },
        (context) => {
            logger.log('matchMedia', context.conditions)
            // Remove this line to also run the animation on mobile.
            if (context.conditions.isMobile) return

            elements.forEach((element) => {
                createTemplateAnimation(element)
            })
        }
    )

    templateAnimationInitialized = true
}
