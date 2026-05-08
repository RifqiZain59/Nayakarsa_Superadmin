import InstitutionList from "@/components/InstitutionList";

export default function PerusahaanPage() {
  return (
    <InstitutionList 
      type="perusahaan" 
      title="Daftar Perusahaan" 
      colorClass="border-emerald-600" 
      bgGradient="bg-gradient-to-br from-emerald-600 to-emerald-800"
    />
  );
}
