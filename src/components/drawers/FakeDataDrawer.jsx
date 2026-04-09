import { useState } from 'react';

const FIRST_NAMES = [
  'James',
  'Mary',
  'Robert',
  'Patricia',
  'John',
  'Jennifer',
  'Michael',
  'Linda',
  'David',
  'Elizabeth',
  'William',
  'Barbara',
  'Richard',
  'Susan',
  'Joseph',
  'Jessica',
  'Thomas',
  'Sarah',
  'Charles',
  'Karen',
  'Emma',
  'Liam',
  'Olivia',
  'Noah',
  'Ava',
  'Sophia',
  'Mason',
  'Isabella',
  'Logan',
  'Mia',
];
const LAST_NAMES = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
  'Lee',
  'Perez',
  'Thompson',
  'White',
  'Harris',
  'Sanchez',
  'Clark',
];
const STREETS = [
  'Main St',
  'Oak Ave',
  'Maple Dr',
  'Cedar Ln',
  'Pine Rd',
  'Elm St',
  'Park Ave',
  'Lake Dr',
  'Hill Rd',
  'River Way',
  'Forest Dr',
  'Sunset Blvd',
  'Ocean Ave',
  'Spring St',
  'Valley Rd',
];
const CITIES = [
  'Springfield',
  'Portland',
  'Austin',
  'Denver',
  'Seattle',
  'Boston',
  'Chicago',
  'Phoenix',
  'Nashville',
  'Atlanta',
  'Miami',
  'Dallas',
  'San Diego',
  'Minneapolis',
  'Charlotte',
];
const STATES = [
  'CA',
  'TX',
  'NY',
  'FL',
  'IL',
  'PA',
  'OH',
  'GA',
  'NC',
  'MI',
  'NJ',
  'VA',
  'WA',
  'AZ',
  'CO',
  'MA',
  'TN',
  'IN',
  'MO',
  'MD',
];
const DOMAINS = ['example.com', 'test.org', 'mail.com', 'inbox.net', 'demo.io'];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function genName() {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}
function genEmail(name) {
  const [f, l] = (name || genName()).toLowerCase().split(' ');
  return `${f}.${l}${randInt(1, 99)}@${pick(DOMAINS)}`;
}
function genPhone() {
  return `(${randInt(200, 999)}) ${randInt(200, 999)}-${String(randInt(1000, 9999))}`;
}
function genAddress() {
  return `${randInt(100, 9999)} ${pick(STREETS)}, ${pick(CITIES)}, ${pick(STATES)} ${String(
    randInt(10000, 99999)
  )}`;
}

export default function FakeDataDrawer({ activeTool, onResult, showAlert }) {
  const [count, setCount] = useState(5);
  const [format, setFormat] = useState('text');
  const toolId = activeTool?.id || 'fake_data_set';

  const handleGenerate = () => {
    const results = [];
    for (let i = 0; i < count; i++) {
      const name = genName();
      switch (toolId) {
        case 'fake_name':
          results.push(name);
          break;
        case 'fake_email':
          results.push(genEmail(name));
          break;
        case 'fake_phone':
          results.push(genPhone());
          break;
        case 'fake_address':
          results.push(genAddress());
          break;
        case 'fake_data_set':
          results.push({ name, email: genEmail(name), phone: genPhone(), address: genAddress() });
          break;
        default:
          results.push(name);
      }
    }

    let output;
    if (toolId === 'fake_data_set') {
      if (format === 'json') {
        output = JSON.stringify(results, null, 2);
      } else if (format === 'csv') {
        output =
          'name,email,phone,address\n' +
          results.map((r) => `"${r.name}","${r.email}","${r.phone}","${r.address}"`).join('\n');
      } else {
        output = results
          .map((r, i) => `${i + 1}. ${r.name}\n   ${r.email}\n   ${r.phone}\n   ${r.address}`)
          .join('\n\n');
      }
    } else {
      output = results.join('\n');
    }

    onResult(activeTool?.label || 'Fake Data', output);
    showAlert(`Generated ${count} record(s)`, 'success');
  };

  const titles = {
    fake_name: 'Fake Names',
    fake_email: 'Fake Emails',
    fake_phone: 'Fake Phones',
    fake_address: 'Fake Addresses',
    fake_data_set: 'Fake Data Set',
  };

  return (
    <div className="tu-gen">
      <h3 className="tu-gen-title">{titles[toolId] || 'Fake Data'}</h3>
      <div className="tu-gen-card">
        <div className="tu-gen-section">
          <label className="tu-gen-label">Count</label>
          <div className="tu-gen-options">
            {[5, 10, 25, 50].map((n) => (
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
        {toolId === 'fake_data_set' && (
          <div className="tu-gen-section">
            <label className="tu-gen-label">Format</label>
            <div className="tu-gen-options">
              {['text', 'json', 'csv'].map((f) => (
                <button
                  key={f}
                  className={`tu-gen-opt${format === f ? ' tu-gen-opt--on' : ''}`}
                  onClick={() => setFormat(f)}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
        <button
          className="tu-gen-btn"
          onClick={handleGenerate}
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '10px',
            borderRadius: '8px',
            background: 'var(--amber)',
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
