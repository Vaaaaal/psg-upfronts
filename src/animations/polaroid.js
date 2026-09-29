import gsap from 'gsap/dist/gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'

const IMAGE_SELECTOR = '[data-animate="polaroid"]'
const PARALLAX_ATTRIBUTE = 'data-polaroid-parallax'

let polaroidAnimationInitialized = false

function createPolaroidAnimation(polaroid) {
    if (!polaroid) return
    
    const tween = gsap.fromTo(
        polaroid,
        { yPercent: 50 },
        { yPercent: 0, duration: 1, ease: 'cubic.out' }
    )

    ScrollTrigger.create({
        trigger: polaroid,
        start: 'top bottom',
        animation: tween
    })
}

function createPolaroidParallax(polaroid) {
    if (!polaroid || !polaroid.hasAttribute(PARALLAX_ATTRIBUTE)) return

    // Accepts "20" or "20%" — percentage of the polaroid's own height.
    const amount = parseFloat(polaroid.getAttribute(PARALLAX_ATTRIBUTE))
    if (!amount) return

    // Pixel `y` (not `yPercent`) so it stacks with the entry tween's yPercent.
    const getOffset = () => (polaroid.offsetHeight * amount) / 100

    gsap.fromTo(
        polaroid,
        { y: () => getOffset() },
        {
            y: () => -getOffset(),
            ease: 'none',
            scrollTrigger: {
                trigger: polaroid,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true
            }
        }
    )
}

export function initPolaroidAnimation(scope = document) {
    if (polaroidAnimationInitialized) return

    const allPolaroids = scope.querySelectorAll(IMAGE_SELECTOR)
    if (!allPolaroids.length) return

    allPolaroids.forEach((polaroid) => {
        // createPolaroidAnimation(polaroid)
        createPolaroidParallax(polaroid)
    })

    polaroidAnimationInitialized = true
}
