import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, Scale, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Điều khoản dịch vụ | TailFlash",
  description: "Điều khoản sử dụng nền tảng học từ vựng TailFlash.",
};

export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_12%,rgba(99,102,241,0.07),transparent_35%),radial-gradient(circle_at_86%_10%,rgba(16,185,129,0.07),transparent_30%),radial-gradient(circle_at_70%_85%,rgba(14,165,233,0.07),transparent_34%)]" />

      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              TailFlash Legal
            </p>
            <h1 className="mt-1 text-3xl font-bold">Điều khoản dịch vụ</h1>
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
              <FileText className="h-4 w-4 text-primary" />
              Tài khoản
            </p>
            <p className="text-sm text-muted-foreground">
              Bạn chịu trách nhiệm về thông tin đăng ký và bảo mật mật khẩu.
            </p>
          </Card>
          <Card className="border-border/70 bg-card/80 p-4">
            <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold">
              <Scale className="h-4 w-4 text-primary" />
              Sử dụng dịch vụ
            </p>
            <p className="text-sm text-muted-foreground">
              Không sử dụng nền tảng cho mục đích vi phạm pháp luật hoặc gây hại.
            </p>
          </Card>
          <Card className="border-border/70 bg-card/80 p-4">
            <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Quyền nội dung
            </p>
            <p className="text-sm text-muted-foreground">
              Bạn giữ quyền với nội dung tự tạo, đồng thời cấp quyền hiển thị cần thiết.
            </p>
          </Card>
        </div>

        <Card className="mt-4 border-border/70 bg-card/80 p-6 sm:p-8">
          <div className="space-y-5 text-sm leading-7 text-muted-foreground">
            <section>
              <h2 className="mb-1 text-base font-semibold text-foreground">
                1. Chấp nhận điều khoản
              </h2>
              <p>
                Khi truy cập hoặc sử dụng TailFlash, bạn đồng ý tuân thủ các điều khoản tại trang này
                và các cập nhật sau này.
              </p>
            </section>

            <section>
              <h2 className="mb-1 text-base font-semibold text-foreground">
                2. Nghĩa vụ người dùng
              </h2>
              <p>
                Bạn cần cung cấp thông tin trung thực, không chia sẻ tài khoản trái phép, và không
                can thiệp trái phép vào hệ thống hoặc dữ liệu của người dùng khác.
              </p>
            </section>

            <section>
              <h2 className="mb-1 text-base font-semibold text-foreground">
                3. Quyền và giới hạn trách nhiệm
              </h2>
              <p>
                TailFlash có thể cập nhật, tạm ngừng hoặc thay đổi một phần dịch vụ để cải thiện chất
                lượng. Chúng tôi không cam kết dịch vụ luôn không gián đoạn trong mọi tình huống kỹ
                thuật.
              </p>
            </section>

            <section>
              <h2 className="mb-1 text-base font-semibold text-foreground">
                4. Liên hệ
              </h2>
              <p>
                Nếu bạn có câu hỏi liên quan đến điều khoản, vui lòng liên hệ đội ngũ hỗ trợ thông qua
                kênh chính thức của dự án.
              </p>
            </section>
          </div>
        </Card>
      </main>
    </div>
  );
}