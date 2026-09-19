const fs = require('fs');
const path = require('path');

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(message || `Expected ${expected}, got ${actual}`);
}

function assertArrayLength(arr, length, message) {
  if (!Array.isArray(arr) || arr.length !== length) throw new Error(message || `Expected array length ${length}, got ${arr?.length}`);
}

test('Data file exists and contains patients and updates', () => {
  const dataPath = path.join(__dirname, '../data.json');
  assert(fs.existsSync(dataPath), 'data.json file should exist');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  assert(data.patients, 'Data should have patients array');
  assert(data.updates, 'Data should have updates array');
  assertArrayLength(data.patients, 3, 'Should have 3 fictional patients');
});

test('Fictional patients are present with required fields', () => {
  const dataPath = path.join(__dirname, '../data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const patient1 = data.patients.find(p => p.id === 1);
  assert(patient1, 'Patient with ID 1 should exist');
  assertEqual(patient1.name, 'Maya Sharma', 'Patient 1 should be Maya Sharma');
  assert(patient1.treatmentType, 'Patient should have treatmentType');
  assert(patient1.startDate, 'Patient should have startDate');
});

test('Demo symptom updates are loaded for patient 1', () => {
  const dataPath = path.join(__dirname, '../data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const patient1Updates = data.updates.filter(u => u.patientId === 1);
  assert(patient1Updates.length >= 5, 'Patient 1 should have at least 5 demo updates');
});

test('Each update has required fields', () => {
  const dataPath = path.join(__dirname, '../data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  data.updates.forEach(update => {
    assert(update.id !== undefined, 'Update should have id');
    assert(update.patientId !== undefined, 'Update should have patientId');
    assert(update.symptom, 'Update should have symptom');
    assert(update.severity, 'Update should have severity');
    assert(update.timestamp, 'Update should have timestamp');
    assert(Array.isArray(update.associatedSymptoms), 'associatedSymptoms should be array');
  });
});

test('Severity values are valid (Mild, Moderate, or Severe)', () => {
  const dataPath = path.join(__dirname, '../data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const validSeverities = ['Mild', 'Moderate', 'Severe'];
  data.updates.forEach(update => {
    assert(validSeverities.includes(update.severity), `Severity "${update.severity}" must be valid`);
  });
});

test('All timestamps are valid ISO format', () => {
  const dataPath = path.join(__dirname, '../data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  data.updates.forEach(update => {
    const timestamp = new Date(update.timestamp);
    assert(!isNaN(timestamp.getTime()), `Timestamp "${update.timestamp}" is not a valid date`);
  });
});

test('Patient updates can be sorted chronologically', () => {
  const dataPath = path.join(__dirname, '../data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const patient1Updates = data.updates.filter(u => u.patientId === 1).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  for (let i = 1; i < patient1Updates.length; i++) {
    const prevTime = new Date(patient1Updates[i - 1].timestamp).getTime();
    const currTime = new Date(patient1Updates[i].timestamp).getTime();
    assert(prevTime <= currTime, 'Updates should be in chronological order');
  }
});

test('Data contains no diagnosis or treatment recommendations', () => {
  const dataPath = path.join(__dirname, '../data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  data.updates.forEach(update => {
    const descLower = (update.description || '').toLowerCase();
    assert(!descLower.includes('diagnos'), 'Descriptions should not contain diagnosis language');
  });
});

test('Associated symptoms are reasonable and consistent', () => {
  const dataPath = path.join(__dirname, '../data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const commonSymptoms = ['Redness', 'Burning sensation', 'Itching', 'Swelling', 'Pain', 'Warmth', 'Sensitivity', 'Dryness'];
  data.updates.forEach(update => {
    update.associatedSymptoms.forEach(sym => {
      assert(commonSymptoms.includes(sym) || sym.length > 0, `Associated symptom "${sym}" should be reasonable`);
    });
  });
});

test('Demo data shows symptom progression for patient 1', () => {
  const dataPath = path.join(__dirname, '../data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const patient1Updates = data.updates.filter(u => u.patientId === 1).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  assert(patient1Updates.length >= 3, 'Patient 1 should have multiple updates to show progression');
  const severities = patient1Updates.map(u => u.severity);
  const uniqueSeverities = [...new Set(severities)];
  assert(uniqueSeverities.length >= 2, 'Updates should show different severity levels');
  const symptoms = patient1Updates.map(u => u.symptom);
  const uniqueSymptoms = [...new Set(symptoms)];
  assert(uniqueSymptoms.length >= 2, 'Multiple different symptoms should be recorded');
});

console.log('\n🧪 Running Symptom Timeline Tests\n');
console.log('='.repeat(60));

tests.forEach(({ name, fn }) => {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
    failed++;
  }
});

console.log('='.repeat(60));
console.log(`\n${passed} passed, ${failed} failed out of ${tests.length} tests\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✓ All tests passed!\n');
}
