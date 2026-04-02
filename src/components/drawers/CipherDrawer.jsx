import { useState } from 'react'

export default function CipherDrawer({ activeTool, text, onResult, showAlert, transformText }) {
    const [key, setKey] = useState('')

    const toolId = activeTool?.id || ''

    const handleApply = async () => {
        if (!text) { showAlert('Enter text first', 'warning'); return }
        if (!key) { showAlert('Enter a key/passphrase', 'warning'); return }

        // Map tool IDs to their endpoints and payload structures
        const configs = {
            vigenere_enc: { endpoint: '/api/v1/text/vigenere-encrypt', label: 'Vigenere Encrypted' },
            vigenere_dec: { endpoint: '/api/v1/text/vigenere-decrypt', label: 'Vigenere Decrypted' },
            playfair_enc: { endpoint: '/api/v1/text/playfair-encrypt', label: 'Playfair Encrypted' },
            substitution_cipher: { endpoint: '/api/v1/text/substitution-cipher', label: 'Substitution Applied' },
            columnar_transposition: { endpoint: '/api/v1/text/columnar-transposition', label: 'Columnar Transposition Applied' },
        }

        const config = configs[toolId]
        if (!config) {
            // AES encryption/decryption (client-side Web Crypto API)
            if (toolId === 'aes_encrypt' || toolId === 'aes_decrypt') {
                try {
                    const enc = new TextEncoder()
                    const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(key.padEnd(32, '\0').slice(0, 32)), 'AES-GCM', false,
                        toolId === 'aes_encrypt' ? ['encrypt'] : ['decrypt'])

                    if (toolId === 'aes_encrypt') {
                        const iv = crypto.getRandomValues(new Uint8Array(12))
                        const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, keyMaterial, enc.encode(text))
                        const combined = new Uint8Array(iv.length + encrypted.byteLength)
                        combined.set(iv)
                        combined.set(new Uint8Array(encrypted), iv.length)
                        const b64 = btoa(String.fromCharCode(...combined))
                        onResult('AES Encrypted', b64)
                    } else {
                        const data = Uint8Array.from(atob(text), c => c.charCodeAt(0))
                        const iv = data.slice(0, 12)
                        const ciphertext = data.slice(12)
                        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, keyMaterial, ciphertext)
                        onResult('AES Decrypted', new TextDecoder().decode(decrypted))
                    }
                    showAlert(toolId === 'aes_encrypt' ? 'Text encrypted' : 'Text decrypted', 'success')
                } catch {
                    showAlert(toolId === 'aes_encrypt' ? 'Encryption failed' : 'Decryption failed — wrong passphrase?', 'danger')
                }
                return
            }
            showAlert('Unknown cipher tool', 'danger')
            return
        }

        try {
            const payload = toolId === 'substitution_cipher'
                ? { text, mapping: key }
                : { text, key }
            const data = await transformText({ endpoint: config.endpoint, ...payload }).unwrap()
            onResult(config.label, data.result)
            showAlert(`${config.label}`, 'success')
        } catch (err) {
            showAlert(err.data?.detail || 'Cipher operation failed', 'danger')
        }
    }

    const getLabel = () => {
        if (toolId === 'substitution_cipher') return 'Substitution Alphabet (26 chars A-Z)'
        if (toolId === 'aes_encrypt' || toolId === 'aes_decrypt') return 'Passphrase'
        return 'Key'
    }

    const getPlaceholder = () => {
        if (toolId === 'substitution_cipher') return 'ZYXWVUTSRQPONMLKJIHGFEDCBA'
        if (toolId === 'aes_encrypt' || toolId === 'aes_decrypt') return 'Enter a passphrase...'
        if (toolId === 'columnar_transposition') return 'e.g., ZEBRAS'
        return 'e.g., SECRET'
    }

    const getTitle = () => {
        const titles = {
            vigenere_enc: 'Vigenere Encrypt',
            vigenere_dec: 'Vigenere Decrypt',
            playfair_enc: 'Playfair Encrypt',
            substitution_cipher: 'Substitution Cipher',
            columnar_transposition: 'Columnar Transposition',
            aes_encrypt: 'AES-256 Encrypt',
            aes_decrypt: 'AES-256 Decrypt',
        }
        return titles[toolId] || 'Cipher'
    }

    return (
        <div className="tu-gen">
            <h3 className="tu-gen-title">{getTitle()}</h3>
            <div className="tu-gen-card">
                <div className="tu-gen-section">
                    <label className="tu-gen-label">{getLabel()}</label>
                    <input
                        type="text"
                        className="tu-gen-input"
                        value={key}
                        onChange={e => setKey(e.target.value)}
                        placeholder={getPlaceholder()}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-2)', color: 'var(--text-1)' }}
                    />
                </div>
                <button
                    className="tu-gen-btn"
                    onClick={handleApply}
                    style={{ width: '100%', marginTop: '12px', padding: '10px', borderRadius: '8px', background: 'var(--sky)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                    Apply
                </button>
            </div>
        </div>
    )
}
