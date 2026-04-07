import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import PipelineStrip from './PipelineStrip'

vi.mock('framer-motion', () => {
  const m = (tag) => ({ children, ...props }) => React.createElement(tag || 'div', props, children)
  return {
    motion: new Proxy({}, { get: (_, tag) => m(tag) }),
    AnimatePresence: ({ children }) => children,
    useReducedMotion: () => false,
  }
})

describe('PipelineStrip', () => {
  it('returns null when steps is empty', () => {
    const { container } = render(<PipelineStrip steps={[]} onClear={vi.fn()} />)
    expect(container.innerHTML).toBe('')
  })

  it('returns null when steps is null', () => {
    const { container } = render(<PipelineStrip steps={null} onClear={vi.fn()} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders input, output, and step nodes', () => {
    const steps = [
      { label: 'Uppercase', timestamp: 1 },
      { label: 'Trim', timestamp: 2 },
    ]
    render(<PipelineStrip steps={steps} onClear={vi.fn()} />)
    expect(screen.getByText('Input')).toBeInTheDocument()
    expect(screen.getByText('Output')).toBeInTheDocument()
    expect(screen.getByText('Uppercase')).toBeInTheDocument()
    expect(screen.getByText('Trim')).toBeInTheDocument()
  })

  it('renders arrows between steps', () => {
    const steps = [{ label: 'Step1', timestamp: 1 }]
    render(<PipelineStrip steps={steps} onClear={vi.fn()} />)
    const arrows = screen.getAllByText('\u2192')
    expect(arrows.length).toBeGreaterThanOrEqual(2) // before step and after step
  })

  it('calls onClear when Clear button is clicked', () => {
    const onClear = vi.fn()
    render(<PipelineStrip steps={[{ label: 'X', timestamp: 1 }]} onClear={onClear} />)
    fireEvent.click(screen.getByText('Clear'))
    expect(onClear).toHaveBeenCalled()
  })
})
