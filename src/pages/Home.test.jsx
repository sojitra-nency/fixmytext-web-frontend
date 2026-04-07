import React from 'react'
import { render } from '@testing-library/react'
import Home from './Home'

// Mock TextForm since it's a complex component
vi.mock('../components/editor/TextForm', () => ({
  default: (props) => <div data-testid="text-form">{JSON.stringify(Object.keys(props))}</div>,
}))

describe('Home', () => {
  it('renders TextForm with correct props', () => {
    const props = {
      mode: 'dark',
      setMode: vi.fn(),
      showAlert: vi.fn(),
      gamification: {},
      user: null,
      isAuthenticated: false,
      subscription: {},
    }
    const { getByTestId } = render(<Home {...props} />)
    expect(getByTestId('text-form')).toBeInTheDocument()
    const content = getByTestId('text-form').textContent
    expect(content).toContain('mode')
    expect(content).toContain('setMode')
    expect(content).toContain('showAlert')
    expect(content).toContain('gamification')
  })
})
