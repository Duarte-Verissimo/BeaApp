'use client';

import { useState, useEffect, useCallback } from 'react';
import { NeoButton } from '@/components/ui/neo-button';
import { NeoInput } from '@/components/ui/neo-input';
import { useAuth } from '@/contexts/auth-context';
import { getClinicSettings, saveClinicSetting, deleteClinicSetting } from '@/app/actions/report-actions';
import { useRouter } from 'next/navigation';

interface Clinic {
  id: string;
  clinic_name: string;
  contract_percentage: number;
}

export function ClinicManager() {
  const { user } = useAuth();
  const router = useRouter();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newPerc, setNewPerc] = useState('');

  const fetchClinics = useCallback(async () => {
    if (!user) return;
    const data = await getClinicSettings(user.id);
    setClinics(data);
  }, [user]);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  const handleAdd = async () => {
    if (!user) return;
    if (!newName || !newPerc) {
      setError('Preencha nome e percentagem');
      return;
    }
    const perc = parseFloat(newPerc);
    if (isNaN(perc) || perc < 0 || perc > 100) {
      setError('Percentagem inválida');
      return;
    }
    setLoading(true);
    const result = await saveClinicSetting(user.id, newName, perc);
    if (result.success) {
      setNewName('');
      setNewPerc('');
      await fetchClinics();
      router.refresh();
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((result as any).error?.message || 'Erro ao guardar');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm('Remover esta clínica?')) return;
    setLoading(true);
    const result = await deleteClinicSetting(user.id, id);
    if (result.success) {
      setClinics(clinics.filter(c => c.id !== id));
      router.refresh();
    } else {
      alert('Erro ao remover');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-4xl p-8 border-2 border-black bg-white mb-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-2xl font-bold mb-4">As Suas Clínicas</h2>
      {error && <p className="text-red-600 mb-2 font-bold">{error}</p>}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <NeoInput
            label="Nome da Clínica"
            placeholder="Ex: Minha Clínica"
            value={newName}
            onChange={e => { setNewName(e.target.value); setError(null); }}
          />
        </div>
        <div className="flex-1">
          <NeoInput
            label="Percentagem (%)"
            type="number"
            placeholder="Ex: 50"
            value={newPerc}
            onChange={e => { setNewPerc(e.target.value); setError(null); }}
          />
        </div>
        <div className="flex items-end">
          <NeoButton onClick={handleAdd} disabled={loading} className="w-full md:w-auto">
            {loading ? 'A guardar...' : 'Adicionar'}
          </NeoButton>
        </div>
      </div>
      {clinics.length === 0 ? (
        <p className="text-gray-600">Ainda não tem clínicas definidas.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clinics.map(clinic => (
            <div key={clinic.id} className="p-4 border-2 border-black flex justify-between items-center">
              <div>
                <p className="font-bold">{clinic.clinic_name}</p>
                <p className="text-gray-600">{clinic.contract_percentage}%</p>
              </div>
              <button
                onClick={() => handleDelete(clinic.id)}
                className="text-red-600 hover:text-red-800 font-bold bg-transparent"
                title="Remover"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
