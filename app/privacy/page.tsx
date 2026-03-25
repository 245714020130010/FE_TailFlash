import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Database, Eye, LockKeyhole } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Chính sách bảo mật | TailFlash",
  description: "Chính sách bảo mật và cách TailFlash xử lý dữ liệu người dùng.",
};

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_14%_10%,rgba(20,184,166,0.07),transparent_35%),radial-gradient(circle_at_82%_10%,rgba(59,130,246,0.08),transparent_32%),radial-gradient(circle_at_60%_85%,rgba(14,165,233,0.07),transparent_35%)]" />

      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              TailFlash Legal
            </p>
            <h1 className="mt-1 text-3xl font-bold">Chính sách bảo mật</h1>
          </div>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại đăng ký
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border/70 bg-card/80 p-4">
            <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold">
              <Database className="h-4 w-4 text-primary" />
              Dữ liệu thu thập
            </p>
            <p className="text-sm text-muted-foreground">
              Email, hồ sơ cơ bản và tiến độ học để cá nhân hóa trải nghiệm.
            </p>
          </Card>
          <Card className="border-border/70 bg-card/80 p-4">
            <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold">
              <LockKeyhole className="h-4 w-4 text-primary" />
              Bảo vệ dữ liệu
            </p>
            <p className="text-sm text-muted-foreground">
              Dữ liệu được bảo vệ bằng cơ chế xác thực và kiểm soát truy cập.
            </p>
          </Card>
          <Card className="border-border/70 bg-card/80 p-4">
            <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold">
              <Eye className="h-4 w-4 text-primary" />
              Quyền của bạn
            </p>
            <p className="text-sm text-muted-foreground">
              Bạn có thể yêu cầu chỉnh sửa hoặc xóa dữ liệu theo quy định hiện hành.
            </p>
          </Card>
        </div>

        <Card className="mt-4 border-border/70 bg-card/80 p-6 sm:p-8">
          <div className="space-y-5 text-sm leading-7 text-muted-foreground">
            <section>
              <h2 className="mb-1 text-base font-semibold text-foreground">
                1. Phạm vi áp dụng
              </h2>
              <p>
                Chính sách này mô tả cách TailFlash thu thập, sử dụng và bảo vệ dữ liệu cá nhân khi
                bạn sử dụng sản phẩm.
              </p>
            </section>

            <section>
              <h2 className="mb-1 text-base font-semibold text-foreground">
                2. Mục đích sử dụng dữ liệu
              </h2>
              <p>
                Dữ liệu được sử dụng để vận hành tài khoản, đồng bộ tiến độ học, cải thiện tính năng và
                hỗ trợ người dùng khi cần.
              </p>
            </section>

            <section>
              <h2 className="mb-1 text-base font-semibold text-foreground">
                3. Chia sẻ dữ liệu
              </h2>
              <p>
                TailFlash không bán dữ liệu cá nhân. Việc chia sẻ chỉ xảy ra khi cần cho vận hành dịch
                vụ hoặc theo yêu cầu pháp lý hợp lệ.
              </p>
            </section>

            <section>
              <h2 className="mb-1 text-base font-semibold text-foreground">
                4. Lưu trữ và quyền kiểm soát
              </h2>
              <p>
                Bạn có thể liên hệ để yêu cầu truy cập, chỉnh sửa hoặc xóa dữ liệu. Chúng tôi sẽ phản hồi
                trong thời gian hợp lý theo quy định hiện hành.
              </p>
            </section>
          </div>
        </Card>
      </main>
    </div>
  );
}