import { useState } from 'react';

export function JsonPathDrawer({ text, onResult, showAlert }) {
  const [path, setPath] = useState('$');

  const handleQuery = () => {
    if (!text) {
      showAlert('Enter JSON in the editor first', 'warning');
      return;
    }
    try {
      const obj = JSON.parse(text);
      // Simple JSONPath implementation for common patterns
      const parts = path
        .replace(/^\$\.?/, '')
        .split('.')
        .filter(Boolean);
      let current = obj;
      for (const part of parts) {
        const arrayMatch = part.match(/^(\w+)\[(\d+|\*)\]$/);
        if (arrayMatch) {
          current = current[arrayMatch[1]];
          if (arrayMatch[2] === '*') {
            // Keep as array
          } else {
            current = current[parseInt(arrayMatch[2])];
          }
        } else if (part === '*') {
          current = Object.values(current);
        } else {
          current = current[part];
        }
        if (current === undefined) {
          onResult('JSON Path', 'No match found for path: ' + path);
          return;
        }
      }
      onResult('JSON Path Result', JSON.stringify(current, null, 2));
      showAlert('JSON path query executed', 'success');
    } catch {
      showAlert('Invalid JSON or path expression', 'danger');
    }
  };

  return (
    <div className="tu-gen">
      <h3 className="tu-gen-title">JSON Path Query</h3>
      <div className="tu-gen-card">
        <div className="tu-gen-section">
          <label className="tu-gen-label">JSONPath Expression</label>
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="$.store.book[0].title"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--bg-2)',
              color: 'var(--text-1)',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '4px' }}>
            Examples: $.name, $.items[0], $.users[*].email
          </p>
        </div>
        <button
          className="tu-gen-btn"
          onClick={handleQuery}
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '10px',
            borderRadius: '8px',
            background: 'var(--green)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Query
        </button>
      </div>
    </div>
  );
}

export function MarkdownPreviewDrawer({ text }) {
  const htmlContent = text
    ? text
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\n/g, '<br/>')
    : '<p style="color: var(--text-3)">Enter Markdown in the editor to preview...</p>';

  return (
    <div className="tu-gen">
      <h3 className="tu-gen-title">Markdown Preview</h3>
      <div className="tu-gen-card" style={{ padding: '16px' }}>
        <div
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          style={{ lineHeight: 1.6, color: 'var(--text-1)' }}
        />
      </div>
    </div>
  );
}

export function LoremIpsumDrawer({ onResult, showAlert }) {
  const [count, setCount] = useState(3);
  const [type, setType] = useState('paragraphs');

  const LOREM =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
  const WORDS = LOREM.replace(/[.,]/g, '').toLowerCase().split(/\s+/);

  const handleGenerate = () => {
    let result;
    if (type === 'words') {
      const words = [];
      for (let i = 0; i < count; i++) words.push(WORDS[i % WORDS.length]);
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
      result = words.join(' ') + '.';
    } else if (type === 'sentences') {
      const sentences = LOREM.split('. ').map((s) => s.trim().replace(/\.$/, ''));
      result = Array.from({ length: count }, (_, i) => sentences[i % sentences.length] + '.').join(
        ' '
      );
    } else {
      result = Array.from({ length: count }, () => LOREM).join('\n\n');
    }
    onResult('Lorem Ipsum', result);
    showAlert(`Generated ${count} ${type}`, 'success');
  };

  return (
    <div className="tu-gen">
      <h3 className="tu-gen-title">Lorem Ipsum Generator</h3>
      <div className="tu-gen-card">
        <div className="tu-gen-section">
          <label className="tu-gen-label">Type</label>
          <div className="tu-gen-options">
            {['words', 'sentences', 'paragraphs'].map((t) => (
              <button
                key={t}
                className={`tu-gen-opt${type === t ? ' tu-gen-opt--on' : ''}`}
                onClick={() => setType(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="tu-gen-section">
          <label className="tu-gen-label">Count</label>
          <div className="tu-gen-options">
            {[1, 3, 5, 10].map((n) => (
              <button
                key={n}
                className={`tu-gen-opt${count === n ? ' tu-gen-opt--on' : ''}`}
                onClick={() => setCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <button
          className="tu-gen-btn"
          onClick={handleGenerate}
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '10px',
            borderRadius: '8px',
            background: 'var(--green)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Generate
        </button>
      </div>
    </div>
  );
}

export function SampleJsonDrawer({ onResult, showAlert }) {
  const [template, setTemplate] = useState('user');

  const templates = {
    user: {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      role: 'admin',
      active: true,
      created_at: new Date().toISOString(),
    },
    product: {
      id: 101,
      name: 'Wireless Headphones',
      price: 79.99,
      category: 'Electronics',
      in_stock: true,
      rating: 4.5,
      tags: ['audio', 'wireless', 'bluetooth'],
    },
    order: {
      id: 'ORD-001',
      customer_id: 1,
      items: [{ product_id: 101, quantity: 2, price: 79.99 }],
      total: 159.98,
      status: 'shipped',
      created_at: new Date().toISOString(),
    },
    comment: {
      id: 1,
      post_id: 42,
      author: 'Jane',
      body: 'Great article!',
      likes: 15,
      created_at: new Date().toISOString(),
    },
    api_response: {
      status: 200,
      data: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ],
      pagination: { page: 1, per_page: 10, total: 42, total_pages: 5 },
      meta: { request_id: 'abc-123' },
    },
  };

  const handleGenerate = () => {
    onResult('Sample JSON', JSON.stringify(templates[template], null, 2));
    showAlert('Sample JSON generated', 'success');
  };

  return (
    <div className="tu-gen">
      <h3 className="tu-gen-title">Sample JSON Generator</h3>
      <div className="tu-gen-card">
        <div className="tu-gen-section">
          <label className="tu-gen-label">Template</label>
          <div className="tu-gen-options" style={{ flexWrap: 'wrap' }}>
            {Object.keys(templates).map((t) => (
              <button
                key={t}
                className={`tu-gen-opt${template === t ? ' tu-gen-opt--on' : ''}`}
                onClick={() => setTemplate(t)}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
        <button
          className="tu-gen-btn"
          onClick={handleGenerate}
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '10px',
            borderRadius: '8px',
            background: 'var(--green)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Generate
        </button>
      </div>
    </div>
  );
}
