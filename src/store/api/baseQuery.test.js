import { createAuthBaseQuery, baseQueryWithReauth, createBaseQueryWithReauth } from './baseQuery'

describe('baseQuery module', () => {
  it('exports createAuthBaseQuery as a function', () => {
    expect(typeof createAuthBaseQuery).toBe('function')
  })

  it('exports baseQueryWithReauth as a function', () => {
    expect(typeof baseQueryWithReauth).toBe('function')
  })

  it('exports createBaseQueryWithReauth as a function', () => {
    expect(typeof createBaseQueryWithReauth).toBe('function')
  })

  it('createAuthBaseQuery returns a function', () => {
    const result = createAuthBaseQuery()
    expect(typeof result).toBe('function')
  })

  it('createAuthBaseQuery accepts extraHeaders callback', () => {
    const extraHeaders = vi.fn()
    const result = createAuthBaseQuery(extraHeaders)
    expect(typeof result).toBe('function')
  })

  it('createBaseQueryWithReauth returns a function', () => {
    const result = createBaseQueryWithReauth((headers) => {
      headers.set('X-Custom', 'test')
    })
    expect(typeof result).toBe('function')
  })
})
