import { getReports } from "@/app/actions/report-actions";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NeoButton } from "@/components/ui/neo-button";
import { ClinicManager } from "@/components/dashboard/ClinicManager";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const reports = await getReports();

  return (
    <div className="flex flex-col items-center min-h-screen gap-8 p-4 pt-12">
      {/* Clinic Management Section */}
      <ClinicManager />

      {/* Reports Section */}
      <div className="w-full max-w-4xl p-8 border-2 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] bg-white">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Meus Relatórios</h1>
          <Link href="/">
            <NeoButton>Novo Relatório</NeoButton>
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl mb-4">Ainda não tens relatórios guardados.</p>
            <Link href="/">
              <NeoButton variant="secondary">Criar o primeiro relatório</NeoButton>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="p-4 border-2 border-black bg-secondary-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-xl">{report.clinic_name}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(report.created_at).toLocaleDateString('pt-PT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-600">
                      +{Number(report.net_earnings).toFixed(2)}€
                    </p>
                    <p className="text-sm text-gray-600">
                      {report.contract_percentage}% Contrato
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t-2 border-dashed border-gray-300 pt-4">
                  <div>
                    <h4 className="font-bold mb-2">Tratamentos</h4>
                    <ul className="text-sm space-y-1">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {report.treatments.map((t: any, i: number) => (
                        <li key={i} className="flex justify-between">
                          <span>{t.type}</span>
                          <span>{Number(t.value).toFixed(2)}€</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Custos</h4>
                    {report.costs.length > 0 ? (
                      <ul className="text-sm space-y-1">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {report.costs.map((c: any, i: number) => (
                          <li key={i} className="flex justify-between">
                            <span>{c.type}</span>
                            <span>{Number(c.value).toFixed(2)}€</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">Sem custos registados</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
