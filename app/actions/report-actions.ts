'use server'

import { createClient } from "@/utils/supabase/server";
import { FormData } from "@/lib/schemas";

export async function saveReport(data: FormData, userId: string) {
  const supabase = await createClient();

  const totalTreatments = data.treatments.reduce((acc, item) => acc + parseFloat(item.value || "0"), 0);
  const totalCosts = data.costs.reduce((acc, item) => acc + parseFloat(item.value || "0"), 0);
  const percentage = parseFloat(data.contractPercentage || "0");
  const netEarnings = (totalTreatments * (percentage / 100)) - totalCosts;

  const { error } = await supabase.from('reports').insert({
    user_id: userId,
    clinic_name: data.companyName === "Outro" ? data.customClinicName : data.companyName,
    contract_percentage: percentage,
    treatments: data.treatments,
    costs: data.costs,
    net_earnings: netEarnings,
    report_email: data.reportEmail
  });

  if (error) {
    console.error('Error saving report:', error);
    return { success: false, error: error.message };
  }

  // Also save/update the clinic setting
  await saveClinicSetting(
    userId, 
    data.companyName === "Outro" ? data.customClinicName! : data.companyName, 
    percentage
  );

  return { success: true };
}

export async function getReports() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reports:', error);
    return [];
  }

  return data;
}

export async function saveClinicSetting(userId: string, clinicName: string, percentage: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('clinic_settings')
    .upsert({
      user_id: userId,
      clinic_name: clinicName,
      contract_percentage: percentage,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,clinic_name'
    });

  if (error) {
    console.error('Error saving clinic setting:', error);
    return { success: false, error };
  }

  return { success: true };
}

export async function getClinicSettings(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clinic_settings')
    .select('*')
    .eq('user_id', userId)
    .order('clinic_name', { ascending: true });

  if (error) {
    console.error('Error fetching clinic settings:', error);
    return [];
  }

  return data;
}

export async function deleteClinicSetting(userId: string, clinicId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('clinic_settings')
    .delete()
    .eq('id', clinicId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting clinic setting:', error);
    return { success: false, error };
  }

  return { success: true };
}
