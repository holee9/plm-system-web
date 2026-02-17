import { redirect } from "next/navigation";

import { ManufacturerList } from "@/components/plm/ManufacturerList";

export default function ManufacturersPage() {
  // TODO: Add authentication check

  return (
    <div className="container mx-auto py-6">
      <ManufacturerList />
    </div>
  );
}
