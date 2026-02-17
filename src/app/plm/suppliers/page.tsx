import { redirect } from "next/navigation";

import { SupplierList } from "@/components/plm/SupplierList";

export default function SuppliersPage() {
  // TODO: Add authentication check

  return (
    <div className="container mx-auto py-6">
      <SupplierList />
    </div>
  );
}
