import InstitutionList from "@/components/InstitutionList";

export default function UniversitasPage() {
  return (
    <InstitutionList 
      type="universitas" 
      title="Daftar Universitas" 
      colorClass="border-indigo-600" 
      bgGradient="bg-gradient-to-br from-indigo-600 to-indigo-800"
    />
  );
}
