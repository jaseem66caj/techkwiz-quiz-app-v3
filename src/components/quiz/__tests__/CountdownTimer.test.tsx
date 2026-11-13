import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { CountdownTimer } from '../CountdownTimer'

jest.mock('framer-motion', () => ({ motion: { div: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div> } }))

describe('countdown layout and expiration', () => {
  let host: HTMLDivElement
  let root: Root
  beforeEach(() => {
    jest.useFakeTimers()
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    root = createRoot(host)
  })
  afterEach(() => { act(() => root.unmount()); jest.useRealTimers() })

  it('reports expiration once and resets for the next question', () => {
    const onTimeUp = jest.fn()
    act(() => root.render(<CountdownTimer totalSeconds={2} isActive onTimeUp={onTimeUp} questionNumber={0} />))
    act(() => jest.advanceTimersByTime(2000))
    expect(onTimeUp).toHaveBeenCalledTimes(1)
    act(() => jest.advanceTimersByTime(2000))
    expect(onTimeUp).toHaveBeenCalledTimes(1)
    act(() => root.render(<CountdownTimer totalSeconds={2} isActive onTimeUp={onTimeUp} questionNumber={1} />))
    expect(onTimeUp).toHaveBeenCalledTimes(1)
    expect(host.textContent).toContain('0:02')
    act(() => jest.advanceTimersByTime(2000))
    expect(onTimeUp).toHaveBeenCalledTimes(2)
  })

  it('keeps the paused timer in the layout without counting down', () => {
    const onTimeUp = jest.fn()
    act(() => root.render(<CountdownTimer totalSeconds={2} isActive={false} onTimeUp={onTimeUp} questionNumber={0} />))
    act(() => jest.advanceTimersByTime(3000))
    expect(host.textContent).toContain('Time Remaining')
    expect(host.textContent).toContain('0:02')
    expect(onTimeUp).not.toHaveBeenCalled()
  })
})
