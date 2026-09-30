import Plyr from 'plyr'

const FADE_DURATION_MS = 250

export function initVideoModal({ lenis } = {}) {
    const modal = document.querySelector('.modal_video_wrap')
    const trigger = document.querySelector('.hero_background_scale')
    const video = modal?.querySelector('video')

    if (!modal || !trigger || !video) return

    const player = new Plyr(video)
    const heroVideo = trigger.querySelector('video')
    let hideTimer = null

    modal.style.transition = `opacity ${FADE_DURATION_MS}ms ease`
    modal.style.willChange = 'opacity'
    modal.style.display = 'none'
    modal.style.opacity = '0'
    modal.style.visibility = 'hidden'
    modal.style.pointerEvents = 'none'

    const open = () => {
        if (hideTimer) {
            clearTimeout(hideTimer)
            hideTimer = null
        }

        modal.style.display = 'flex'
        requestAnimationFrame(() => {
            modal.style.opacity = '1'
            modal.style.visibility = 'visible'
            modal.style.pointerEvents = 'auto'
        })

        lenis?.stop()
        heroVideo?.pause()
        player.currentTime = 0
        player.play()
    }

    const close = () => {
        modal.style.opacity = '0'
        modal.style.visibility = 'hidden'
        modal.style.pointerEvents = 'none'

        hideTimer = setTimeout(() => {
            modal.style.display = 'none'
            hideTimer = null
        }, FADE_DURATION_MS)

        player.pause()
        heroVideo?.play()
        lenis?.start()
    }

    trigger.addEventListener('click', open)

    document.querySelectorAll('.button_video_modal').forEach((button) => {
        button.addEventListener('click', (event) => {
            event.preventDefault()
            open()
        })
    })

    modal.querySelectorAll('.modal_close_button, .modal_background').forEach((element) => {
        element.addEventListener('click', close)
    })
}
