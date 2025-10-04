import { AddressNormalizeAndCompare } from "@/components/features/AddressNormalizeAndCompare";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";

export const metadata = {
  title: "Chuẩn hóa địa chỉ & báo giá nhanh | Addressify"
};

export default function Page() {
  return (
    <ProtectedLayout>
      <main className="space-y-10">
        <SectionHeader
          subtitle="Dán danh sách địa chỉ, chuẩn hóa tự động và xin báo giá nhanh từ nhiều đơn vị vận chuyển."
          title="Chuẩn hóa địa chỉ & báo giá nhanh"
        />
        <AddressNormalizeAndCompare />
      </main>
    </ProtectedLayout>
  );
}
