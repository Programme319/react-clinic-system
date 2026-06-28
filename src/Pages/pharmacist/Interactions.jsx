import { useState } from 'react';
import PharmacistLayout from '@/Layouts/PharmacistLayout';
import { useAuth } from '@/contexts/AuthContext';
import { logView } from '@/lib/audit';
import { useEffect } from 'react';

const INTERACTIONS = [
  { pair: 'Warfarin + Aspirin', risk: 'High', note: 'Increased bleeding risk' },
  { pair: 'Metformin + Contrast dye', risk: 'High', note: 'Risk of lactic acidosis' },
  { pair: 'ACE inhibitor + Potassium', risk: 'Medium', note: 'Hyperkalemia risk' },
];

export default function DrugInteractions() {
  const { authUser } = useAuth();
  const [medA, setMedA] = useState('');
  const [medB, setMedB] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => { logView(authUser, 'drug_interactions', 'checker'); }, [authUser]);

  const check = (e) => {
    e.preventDefault();
    const hit = INTERACTIONS.find(
      (i) => i.pair.toLowerCase().includes(medA.toLowerCase()) && i.pair.toLowerCase().includes(medB.toLowerCase()),
    );
    setResult(hit || { pair: `${medA} + ${medB}`, risk: 'Low', note: 'No known major interaction in local database.' });
  };

  return (
    <PharmacistLayout title="Drug Interaction Checker">
      <form onSubmit={check} className="panel" style={{ maxWidth: 480, marginBottom: '1.5rem' }}>
        <div className="panel__header">Check two medications</div>
        <div className="panel__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input className="input-field" placeholder="Medication A" required value={medA} onChange={(e) => setMedA(e.target.value)} />
          <input className="input-field" placeholder="Medication B" required value={medB} onChange={(e) => setMedB(e.target.value)} />
          <button type="submit" className="btn btn-primary">Check interaction</button>
        </div>
      </form>
      {result && (
        <div className={`alert ${result.risk === 'High' ? 'alert-error' : result.risk === 'Medium' ? 'alert-warning' : 'alert-success'}`}>
          <strong>{result.risk} risk:</strong> {result.pair} — {result.note}
        </div>
      )}
    </PharmacistLayout>
  );
}
