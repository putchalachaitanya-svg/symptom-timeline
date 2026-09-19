const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

const dataFilePath = path.join(__dirname, 'data.json');

if (!fs.existsSync(dataFilePath)) {
  const initialData = {
    patients: [
      { id: 1, name: 'Maya Sharma', treatmentType: 'Chemical Peel', startDate: '2026-09-15' },
      { id: 2, name: 'Arjun Kapoor', treatmentType: 'Laser Therapy', startDate: '2026-09-10' },
      { id: 3, name: 'Priya Desai', treatmentType: 'Microdermabrasion', startDate: '2026-09-12' }
    ],
    updates: [
      { id: 1, patientId: 1, symptom: 'Redness', severity: 'Mild', timestamp: '2026-09-15T10:00:00', description: 'Mild redness appeared after treatment', associatedSymptoms: [] },
      { id: 2, patientId: 1, symptom: 'Burning sensation', severity: 'Moderate', timestamp: '2026-09-15T10:20:00', description: 'Burning sensation started', associatedSymptoms: ['Redness'] },
      { id: 3, patientId: 1, symptom: 'Burning sensation', severity: 'Severe', timestamp: '2026-09-15T10:45:00', description: 'Burning sensation has increased significantly', associatedSymptoms: ['Redness', 'Warmth'] },
      { id: 4, patientId: 1, symptom: 'Swelling', severity: 'Moderate', timestamp: '2026-09-15T11:00:00', description: 'Swelling appeared in treated area', associatedSymptoms: ['Redness', 'Burning sensation'] },
      { id: 5, patientId: 1, symptom: 'Burning sensation', severity: 'Severe', timestamp: '2026-09-15T11:20:00', description: 'Burning sensation persists and remains severe', associatedSymptoms: ['Redness', 'Swelling', 'Warmth'] },
      { id: 6, patientId: 2, symptom: 'Itching', severity: 'Mild', timestamp: '2026-09-10T14:00:00', description: 'Minor itching in treated area', associatedSymptoms: [] },
      { id: 7, patientId: 2, symptom: 'Itching', severity: 'Moderate', timestamp: '2026-09-10T15:30:00', description: 'Itching has increased', associatedSymptoms: ['Redness'] },
      { id: 8, patientId: 3, symptom: 'Sensitivity', severity: 'Mild', timestamp: '2026-09-12T09:00:00', description: 'Skin sensitivity to touch', associatedSymptoms: [] }
    ]
  };
  fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2));
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/patients', (req, res) => {
  const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  res.json(data.patients);
});

app.get('/api/patients/:patientId/updates', (req, res) => {
  const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  const patientId = parseInt(req.params.patientId);
  const updates = data.updates.filter(u => u.patientId === patientId);
  updates.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  res.json(updates);
});

app.post('/api/updates', (req, res) => {
  const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  const newUpdate = {
    id: Math.max(...data.updates.map(u => u.id), 0) + 1,
    patientId: req.body.patientId,
    symptom: req.body.symptom,
    severity: req.body.severity,
    timestamp: req.body.timestamp,
    description: req.body.description,
    associatedSymptoms: req.body.associatedSymptoms || []
  };
  data.updates.push(newUpdate);
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  res.json(newUpdate);
});

app.listen(PORT, () => {
  console.log(`✓ Server running at http://localhost:${PORT}`);
});
