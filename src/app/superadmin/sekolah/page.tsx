import InstitutionList from "@/components/InstitutionList";

export default function SekolahPage() {
  return (
    <InstitutionList 
      type="sekolah" 
      title="Daftar Sekolah" 
      colorClass="border-blue-600" 
      bgGradient="bg-gradient-to-br from-blue-600 to-blue-800"
    />
  );
}
