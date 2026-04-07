import { render, screen, fireEvent } from '@testing-library/react'

import CipherDrawer from './CipherDrawer'

function renderCipher(props = {}) {
    return render(
        <CipherDrawer
            activeTool={{ id: 'vigenere_enc' }}
            text="Hello world"
            onResult={vi.fn()}
            showAlert={vi.fn()}
            transformText={vi.fn()}
            {...props}
        />
    )
}

describe('CipherDrawer', () => {
    it('renders title for vigenere_enc', () => {
        renderCipher({ activeTool: { id: 'vigenere_enc' } })
        expect(screen.getByText('Vigenere Encrypt')).toBeInTheDocument()
    })

    it('renders title for aes_encrypt', () => {
        renderCipher({ activeTool: { id: 'aes_encrypt' } })
        expect(screen.getByText('AES-256 Encrypt')).toBeInTheDocument()
    })

    it('renders title for substitution_cipher', () => {
        renderCipher({ activeTool: { id: 'substitution_cipher' } })
        expect(screen.getByText('Substitution Cipher')).toBeInTheDocument()
    })

    it('renders default title for unknown tool', () => {
        renderCipher({ activeTool: { id: 'unknown' } })
        expect(screen.getByText('Cipher')).toBeInTheDocument()
    })

    it('renders correct label for substitution cipher', () => {
        renderCipher({ activeTool: { id: 'substitution_cipher' } })
        expect(screen.getByText('Substitution Alphabet (26 chars A-Z)')).toBeInTheDocument()
    })

    it('renders correct label for aes tools', () => {
        renderCipher({ activeTool: { id: 'aes_encrypt' } })
        expect(screen.getByText('Passphrase')).toBeInTheDocument()
    })

    it('renders correct label for other ciphers', () => {
        renderCipher({ activeTool: { id: 'vigenere_enc' } })
        expect(screen.getByText('Key')).toBeInTheDocument()
    })

    it('renders placeholder for substitution cipher', () => {
        renderCipher({ activeTool: { id: 'substitution_cipher' } })
        expect(screen.getByPlaceholderText('ZYXWVUTSRQPONMLKJIHGFEDCBA')).toBeInTheDocument()
    })

    it('renders placeholder for columnar transposition', () => {
        renderCipher({ activeTool: { id: 'columnar_transposition' } })
        expect(screen.getByPlaceholderText('e.g., ZEBRAS')).toBeInTheDocument()
    })

    it('renders placeholder for aes', () => {
        renderCipher({ activeTool: { id: 'aes_decrypt' } })
        expect(screen.getByPlaceholderText('Enter a passphrase...')).toBeInTheDocument()
    })

    it('shows warning when no text', () => {
        const showAlert = vi.fn()
        renderCipher({ text: '', showAlert })
        fireEvent.click(screen.getByText('Apply'))
        expect(showAlert).toHaveBeenCalledWith('Enter text first', 'warning')
    })

    it('shows warning when no key', () => {
        const showAlert = vi.fn()
        renderCipher({ text: 'some text', showAlert })
        fireEvent.click(screen.getByText('Apply'))
        expect(showAlert).toHaveBeenCalledWith('Enter a key/passphrase', 'warning')
    })

    it('updates key input', () => {
        renderCipher()
        const input = screen.getByPlaceholderText('e.g., SECRET')
        fireEvent.change(input, { target: { value: 'MYKEY' } })
        expect(input.value).toBe('MYKEY')
    })

    it('calls transformText for vigenere_enc with key', async () => {
        const onResult = vi.fn()
        const showAlert = vi.fn()
        const transformText = vi.fn().mockReturnValue({
            unwrap: () => Promise.resolve({ result: 'encrypted' }),
        })

        renderCipher({ activeTool: { id: 'vigenere_enc' }, text: 'Hello', onResult, showAlert, transformText })

        fireEvent.change(screen.getByPlaceholderText('e.g., SECRET'), { target: { value: 'KEY' } })
        fireEvent.click(screen.getByText('Apply'))

        await vi.waitFor(() => {
            expect(transformText).toHaveBeenCalled()
            expect(onResult).toHaveBeenCalledWith('Vigenere Encrypted', 'encrypted')
        })
    })

    it('shows error when transformText fails', async () => {
        const showAlert = vi.fn()
        const transformText = vi.fn().mockReturnValue({
            unwrap: () => Promise.reject({ data: { detail: 'Server error' } }),
        })

        renderCipher({ activeTool: { id: 'vigenere_enc' }, text: 'Hello', showAlert, transformText })

        fireEvent.change(screen.getByPlaceholderText('e.g., SECRET'), { target: { value: 'KEY' } })
        fireEvent.click(screen.getByText('Apply'))

        await vi.waitFor(() => {
            expect(showAlert).toHaveBeenCalledWith('Server error', 'danger')
        })
    })

    it('shows danger for unknown cipher tool with key provided', async () => {
        const showAlert = vi.fn()
        renderCipher({ activeTool: { id: 'unknown_tool' }, text: 'Hello', showAlert })

        fireEvent.change(screen.getByPlaceholderText('e.g., SECRET'), { target: { value: 'KEY' } })
        fireEvent.click(screen.getByText('Apply'))

        await vi.waitFor(() => {
            expect(showAlert).toHaveBeenCalledWith('Unknown cipher tool', 'danger')
        })
    })

    it('handles no activeTool gracefully', () => {
        renderCipher({ activeTool: null })
        expect(screen.getByText('Cipher')).toBeInTheDocument()
    })
})
