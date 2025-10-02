import { AddressNormalizeAndCompare } from "@/components/features/AddressNormalizeAndCompare";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata = {
  title: "Chuẩn hóa địa chỉ & báo giá nhanh | Addressify"
};

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
      <SectionHeader
        subtitle="Dán danh sách địa chỉ, chuẩn hóa tự động và xin báo giá nhanh từ aggregator (GHTK)."
        title="Chuẩn hóa địa chỉ & báo giá nhanh"
      />
      <AddressNormalizeAndCompare />
    </main>
  );
}
