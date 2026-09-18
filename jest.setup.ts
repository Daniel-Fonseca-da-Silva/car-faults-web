import '@testing-library/jest-dom'

// jsdom does not implement PointerEvent, but Base UI components (e.g. RadioGroup)
// dispatch real PointerEvent instances in their click handlers. Without this
// polyfill, interacting with those components in tests throws
// "PointerEvent is not a constructor".
if (typeof window !== 'undefined' && !window.PointerEvent) {
  class PointerEvent extends MouseEvent {
    public height?: number
    public isPrimary?: boolean
    public pointerId?: number
    public pointerType?: string
    public pressure?: number
    public tangentialPressure?: number
    public tiltX?: number
    public tiltY?: number
    public twist?: number
    public width?: number

    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params)
      this.height = params.height
      this.isPrimary = params.isPrimary
      this.pointerId = params.pointerId
      this.pointerType = params.pointerType
      this.pressure = params.pressure
      this.tangentialPressure = params.tangentialPressure
      this.tiltX = params.tiltX
      this.tiltY = params.tiltY
      this.twist = params.twist
      this.width = params.width
    }
  }

  window.PointerEvent = PointerEvent as unknown as typeof window.PointerEvent
}

if (typeof window !== 'undefined') {
  if (!window.HTMLElement.prototype.hasPointerCapture) {
    window.HTMLElement.prototype.hasPointerCapture = () => false
  }
  if (!window.HTMLElement.prototype.setPointerCapture) {
    window.HTMLElement.prototype.setPointerCapture = () => {}
  }
  if (!window.HTMLElement.prototype.releasePointerCapture) {
    window.HTMLElement.prototype.releasePointerCapture = () => {}
  }
  if (!window.HTMLElement.prototype.scrollIntoView) {
    window.HTMLElement.prototype.scrollIntoView = () => {}
  }
}
