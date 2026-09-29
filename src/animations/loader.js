import gsap from 'gsap/dist/gsap'

const LOADER_WRAP_SELECTOR = '.loader_wrap'
const LOADER_INNER_SELECTOR = '.loader_inner'
const LOADER_UNDERLAY_SELECTOR = '.loader_underlay' 
const LOADER_CONTENT_SELECTOR = '.loader_content'
const LOADER_TAG_SELECTOR = '.loader_tag'
const LOADER_LOGO_SELECTOR = '.loader_logo_overlay'

let loaderAnimationInitialized = false

export function initLoaderAnimation(scope = document) {
    if (loaderAnimationInitialized) return

    const wrap = scope.querySelector(LOADER_WRAP_SELECTOR)
    const inner = scope.querySelector(LOADER_INNER_SELECTOR)
    const underlay = scope.querySelector(LOADER_UNDERLAY_SELECTOR)
    const content = scope.querySelector(LOADER_CONTENT_SELECTOR)
    const tag = scope.querySelector(LOADER_TAG_SELECTOR)
    const overlay = scope.querySelector(LOADER_LOGO_SELECTOR)
    if (!wrap || !inner || !underlay || !content || !tag || !overlay) return

    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } })

    tl.fromTo(
        content,
        {
            opacity: 0,
            scale: 0.8
        },
        {
            opacity: 1,
            scale: 1,
            duration: 1
        }
    )
        .from(
            tag,
            {
                opacity: 0,
                duration: 1
            },
            '<0.3'
        )
        .fromTo(
            overlay,
            { 
                clipPath: 'inset(0% 100% 0% 0%)'
            },
            { 
                clipPath: 'inset(0% 0% 0% 0%)', 
                duration: 1.2
            },
            '<0.3'
        )
        .to(
            [inner, underlay],
            {
                yPercent: -115,
                duration: 1,
                stagger: 0.2,
                onComplete: () => {
                    gsap.set(wrap, { display: 'none' })
                }
            }
        )

    loaderAnimationInitialized = true
}
