import { renderHook } from '@testing-library/react'
import { useAuth } from './useAuth'

const mockRefresh = vi.fn()
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}))
vi.mock('../store/api/authApi', () => ({
  useRefreshMutation: () => [mockRefresh],
  useGetMeQuery: vi.fn(),
}))

import { useSelector } from 'react-redux'
import { useGetMeQuery } from '../store/api/authApi'

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRefresh.mockReturnValue({ unwrap: () => Promise.resolve({}) })
  })

  it('returns user and isAuthenticated=true when token exists', () => {
    useSelector.mockReturnValue({ accessToken: 'tok', user: { name: 'Test' } })
    const { result } = renderHook(() => useAuth())
    expect(result.current.user).toEqual({ name: 'Test' })
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('returns isAuthenticated=false when no token', () => {
    useSelector.mockReturnValue({ accessToken: null, user: null })
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('calls refresh on mount when no token', () => {
    useSelector.mockReturnValue({ accessToken: null, user: null })
    renderHook(() => useAuth())
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  it('does not call refresh when token exists', () => {
    useSelector.mockReturnValue({ accessToken: 'tok', user: null })
    renderHook(() => useAuth())
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('calls refresh only once even on re-render', () => {
    useSelector.mockReturnValue({ accessToken: null, user: null })
    const { rerender } = renderHook(() => useAuth())
    rerender()
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  it('skips useGetMeQuery when not authenticated', () => {
    useSelector.mockReturnValue({ accessToken: null, user: null })
    renderHook(() => useAuth())
    expect(useGetMeQuery).toHaveBeenCalledWith(undefined, { skip: true })
  })

  it('does not skip useGetMeQuery when authenticated', () => {
    useSelector.mockReturnValue({ accessToken: 'tok', user: null })
    renderHook(() => useAuth())
    expect(useGetMeQuery).toHaveBeenCalledWith(undefined, { skip: false })
  })

  it('handles refresh failure silently', () => {
    mockRefresh.mockReturnValue({ unwrap: () => Promise.reject(new Error('fail')) })
    useSelector.mockReturnValue({ accessToken: null, user: null })
    expect(() => renderHook(() => useAuth())).not.toThrow()
  })
})
