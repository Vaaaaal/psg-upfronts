import Plyr from 'plyr'

const FADE_DURATION_MS = 250
// Any of these opens the modal. Add `data-video-modal-trigger` in Webflow
// to use it on another page (e.g. Manifesto).
const TRIGGER_SELECTOR =
    '.hero_background_scale, .button_video_modal, [data-video-modal-trigger]'

export function initVideoModal({ lenis } = {}) {
    const modal = document.querySelector('.modal_video_wrap')
    const triggers = document.querySelectorAll(TRIGGER_SELECTOR)
    const video = modal?.querySelector('video')

    if (!modal || !triggers.length || !video) return

    const player = new Plyr(video)
    // Background videos inside the triggers (e.g. hero), paused while open
    const backgroundVideos = [...triggers].flatMap((trigger) => [
        ...trigger.querySelectorAll('video')
    ])
    let pausedVideos = []
    let hideTimer = null
    let isOpen = false

    modal.style.transition = `opacity ${FADE_DURATION_MS}ms ease`
    modal.style.willChange = 'opacity'
    modal.style.display = 'none'
    modal.style.opacity = '0'
    modal.style.visibility = 'hidden'
    modal.style.pointerEvents = 'none'

    const open = () => {
        // A trigger nested in another one would fire open twice
        if (isOpen) return
        isOpen = true

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
        pausedVideos = backgroundVideos.filter((bgVideo) => !bgVideo.paused)
        pausedVideos.forEach((bgVideo) => bgVideo.pause())
        player.currentTime = 0
        player.play()
    }

    const close = () => {
        if (!isOpen) return
        isOpen = false

        modal.style.opacity = '0'
        modal.style.visibility = 'hidden'
        modal.style.pointerEvents = 'none'

        hideTimer = setTimeout(() => {
            modal.style.display = 'none'
            hideTimer = null
        }, FADE_DURATION_MS)

        player.pause()
        pausedVideos.forEach((bgVideo) => bgVideo.play())
        pausedVideos = []
        lenis?.start()
    }

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault()
            open()
        })
    })

    modal.querySelectorAll('.modal_close_button, .modal_background').forEach((element) => {
        element.addEventListener('click', close)
    })
}
