"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import HeaderThemeToggle from "@/components/header-theme-toggle";
import { useLanguage } from "@/components/language-provider";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChartLine,
  Clock3,
  Globe2,
  LayoutDashboard,
  MessageSquareQuote,
  PlayCircle,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Wand2,
} from "lucide-react";

const learningRoadmap = [
  {
    week: "Tuần 1",
    title: "Thiết lập nền tảng",
    desc: "Onboarding, chọn mục tiêu, và tạo 2 deck cốt lõi theo chủ đề bạn cần ưu tiên.",
    metric: "~120 thẻ",
  },
  {
    week: "Tuần 2",
    title: "Tăng tốc phản xạ",
    desc: "Luân phiên SRS + typing + multiple choice để giảm thời gian nhớ lại.",
    metric: "6s/thẻ",
  },
  {
    week: "Tuần 3",
    title: "Củng cố điểm yếu",
    desc: "Tự gom nhóm thẻ hay quên, ưu tiên ôn lại theo độ trễ và tần suất sai.",
    metric: "-35% số thẻ quên",
  },
  {
    week: "Tuần 4",
    title: "Ổn định thói quen",
    desc: "Theo dõi streak, tinh chỉnh số thẻ mới/ngày để giữ nhịp học bền vững.",
    metric: "20 phút/ngày",
  },
];

const communityVoices = [
  {
    name: "Linh Tran",
    role: "Sinh viên năm 2",
    quote:
      "Mình bỏ app cũ vì rối. TailFlash giữ đúng thứ mình cần: lật thẻ, quyết định nhanh, đi tiếp.",
  },
  {
    name: "Minh Hoang",
    role: "Developer",
    quote:
      "UI sạch, phím tắt ổn định. Sau 3 tuần, lượng từ nhớ chủ động tăng rõ rệt khi nói tiếng Anh.",
  },
  {
    name: "Ngoc Mai",
    role: "TOEIC learner",
    quote:
      "Mình thích heatmap và bộ lọc thẻ yếu. Dễ nhìn được hôm nào học thật sự hiệu quả.",
  },
];

const faqs = [
  {
    q: "TailFlash khác gì app flashcard thông thường?",
    a: "TailFlash gom SRS, mini games và dashboard vào một luồng liên tục, giảm chuyển màn hình và giảm thao tác thừa.",
  },
  {
    q: "Người mới bắt đầu có cần tự thiết lập phức tạp không?",
    a: "Không. Bạn có thể dùng ngay deck mẫu, sau đó tinh chỉnh dần số thẻ mới mỗi ngày theo nhịp học của mình.",
  },
  {
    q: "Mình có thể học ngắn trong 10-15 phút mỗi ngày không?",
    a: "Có. Hệ thống ưu tiên thẻ cần ôn gấp, giúp bạn tận dụng thời gian ngắn mà vẫn giữ hiệu quả ghi nhớ.",
  },
  {
    q: "Có mất dữ liệu khi đổi theme/ngôn ngữ/cài đặt không?",
    a: "Không. Cài đặt giao diện và thói quen học được giữ đồng bộ để bạn chuyển chế độ mà không bị gián đoạn.",
  },
];

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.08),transparent_30%),radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.08),transparent_35%)]" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary shadow-sm">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                flashcards.world style
              </p>
              <span className="text-xl font-semibold">TailFlash</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <HeaderThemeToggle />
            <Link href="/onboarding" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm">
                {t("landing.quickStart")}
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                {t("common.account")}
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="sm"
                className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                {t("common.startLearning")}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden py-14 sm:py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
              <Wand2 className="h-4 w-4" />
              Học nhanh kiểu flashcards.world
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                Flashcards cho người bận rộn
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl">
                Giao diện tối giản, thao tác cực nhanh, tập trung vào nội dung
                quan trọng. SRS, mini games, thống kê đều nằm trong một luồng
                học liền mạch.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground shadow-lg shadow-primary/30"
                >
                  Bắt đầu miễn phí
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/study">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Xem trải nghiệm học
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                {
                  label: "Học viên đang active",
                  value: "52k",
                },
                {
                  label: "Thẻ được ôn mỗi ngày",
                  value: "5.2M",
                },
                {
                  label: "Bộ từ vựng công khai",
                  value: "4.8k",
                },
                {
                  label: "Tỉ lệ quay lại",
                  value: "92%",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border bg-card/60 p-3 shadow-sm"
                >
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-10 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -right-6 bottom-12 h-20 w-20 rounded-full bg-accent/10 blur-3xl" />
            <div className="relative rounded-3xl border bg-card/70 p-6 shadow-2xl backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Đang học
                  </p>
                  <h3 className="text-xl font-semibold">TOEIC 600 - Day 3</h3>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  SRS
                </span>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Mặt trước
                  </p>
                  <p className="text-3xl font-bold">Accomplish</p>
                  <p className="text-primary">/əˈkɑːm.plɪʃ/</p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <PlayCircle className="h-4 w-4" />
                    Nhấn để nghe + lật thẻ
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  {["Quên", "Khó", "Tốt"].map((label) => (
                    <button
                      key={label}
                      className="rounded-xl border bg-background/60 px-3 py-2 text-left font-medium hover:border-primary"
                    >
                      {label}
                      <span className="block text-xs text-muted-foreground">
                        {label === "Quên"
                          ? "Ôn lại ngay"
                          : label === "Khó"
                            ? "Lặp sớm"
                            : "Giãn cách dài"}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="rounded-2xl border bg-muted/40 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Tiến độ phiên học</p>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                      3/12
                    </span>
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-border">
                    <div className="h-2 w-2/5 rounded-full bg-gradient-to-r from-primary to-accent" />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    6 thẻ mới · 6 thẻ ôn · chế độ Tự do
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* How it works */}
      <section className="border-t bg-card/50 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Luồng học 4 bước
              </p>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Tối giản thao tác, tối đa tập trung
              </h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Lấy cảm hứng từ flashcards.world: chỉ giữ lại các thao tác cần
                thiết, gộp SRS + mini games + ghi chú vào một luồng duy nhất.
              </p>
            </div>
            <Link href="/onboarding">
              <Button variant="outline" className="hidden sm:inline-flex">
                Dùng thử 2 phút
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <BookOpen className="h-5 w-5" />,
                title: "Chọn bộ thẻ",
                desc: "Từ thư viện công khai hoặc import CSV của bạn.",
              },
              {
                icon: <PlayCircle className="h-5 w-5" />,
                title: "Ôn cực nhanh",
                desc: "Phím tắt, lật thẻ, chọn mức nhớ, nghe phát âm tức thì.",
              },
              {
                icon: <Clock3 className="h-5 w-5" />,
                title: "Giãn cách thông minh",
                desc: "Tính SM-2 tự động – bạn chỉ cần chọn Quên/Khó/Tốt/Dễ.",
              },
              {
                icon: <LayoutDashboard className="h-5 w-5" />,
                title: "Theo dõi tức thời",
                desc: "Streak, accuracy, thẻ cần ôn hôm nay hiển thị ngay.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border bg-background/60 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {item.icon}
                </div>
                <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Decks */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Thư viện gợi ý
              </p>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Deck mẫu để bắt đầu ngay
              </h2>
            </div>
            <Link href="/decks">
              <Button variant="ghost" size="sm">
                Xem tất cả
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "IELTS Speaking Bands",
                words: 320,
                tag: "EN",
                color: "from-primary/15 via-primary/10 to-primary/5",
              },
              {
                title: "JLPT N3 Core",
                words: 450,
                tag: "JP",
                color: "from-secondary/15 via-secondary/10 to-secondary/5",
              },
              {
                title: "Business English",
                words: 280,
                tag: "EN",
                color: "from-accent/15 via-accent/10 to-accent/5",
              },
            ].map((deck) => (
              <div
                key={deck.title}
                className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${deck.color} p-5 shadow-sm`}
              >
                <div className="absolute right-4 top-4 rounded-full bg-background/80 px-2 py-1 text-xs font-semibold text-muted-foreground">
                  {deck.tag}
                </div>
                <h3 className="text-xl font-semibold">{deck.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {deck.words} thuật ngữ · SRS + games
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary">
                  Ôn ngay
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Study modes */}
      <section className="border-y bg-card/50 py-14 sm:py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Chế độ học
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Học linh hoạt nhưng không bị rối
            </h2>
            <p className="text-muted-foreground">
              Học nhanh kiểu flashcards.world, nhưng thêm mini games và
              dashboard gọn gàng. Mọi thứ gắn với SRS, không tách rời.
            </p>
            <div className="space-y-3">
              {[
                "Classic flashcards (phím tắt)",
                "Match & Multiple Choice",
                "Typing test",
                "Ôn lại thẻ lỡ quên",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border bg-background/70 p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium">{item}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Link href="/games">
                <Button variant="outline">Chơi thử mini games</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" className="gap-2">
                  Xem dashboard
                  <LayoutDashboard className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border bg-background/70 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-primary">
                Session preview
              </p>
              <span className="text-xs text-muted-foreground">Free mode</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border bg-card/70 p-4">
                <p className="text-xs text-muted-foreground">Độ khó</p>
                <p className="text-lg font-semibold">Adaptive</p>
                <p className="text-xs text-muted-foreground">
                  Tự cân bằng dễ/khó
                </p>
              </div>
              <div className="rounded-xl border bg-card/70 p-4">
                <p className="text-xs text-muted-foreground">Chế độ</p>
                <p className="text-lg font-semibold">SRS + Games</p>
                <p className="text-xs text-muted-foreground">
                  Xen kẽ mỗi 6 thẻ
                </p>
              </div>
              <div className="rounded-xl border bg-card/70 p-4">
                <p className="text-xs text-muted-foreground">Thẻ hôm nay</p>
                <p className="text-lg font-semibold">34</p>
                <p className="text-xs text-muted-foreground">12 mới · 22 ôn</p>
              </div>
              <div className="rounded-xl border bg-card/70 p-4">
                <p className="text-xs text-muted-foreground">Tốc độ</p>
                <p className="text-lg font-semibold">6s/thẻ</p>
                <p className="text-xs text-muted-foreground">
                  Nhịp khuyến nghị
                </p>
              </div>
            </div>
            <div className="rounded-2xl border bg-gradient-to-r from-primary/15 via-accent/15 to-secondary/15 p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">
                    Không rối mắt, không phân tán
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ẩn bớt nút phụ, giữ 1 quyết định duy nhất mỗi thẻ.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-primary">
                {t("common.demo")}
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reasons */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-4 w-4" />
            Lý do để ở lại
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <Globe2 className="h-5 w-5" />,
                title: "Đa ngôn ngữ",
                desc: "Học EN, JP, KR, hoặc deck tùy chỉnh CSV/TSV.",
              },
              {
                icon: <Clock3 className="h-5 w-5" />,
                title: "Nhắc ôn thông minh",
                desc: "Tự động gợi ý thẻ cần ôn hôm nay, không cần nhớ lịch.",
              },
              {
                icon: <ChartLine className="h-5 w-5" />,
                title: "Dashboard tức thì",
                desc: "Streak, accuracy, heatmap, tốc độ ôn cập nhật real-time.",
              },
              {
                icon: <ShieldCheck className="h-5 w-5" />,
                title: "Giữ cài đặt của bạn",
                desc: "Tất cả theme, ngôn ngữ, hotkey, chế độ học vẫn giữ nguyên.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border bg-background/70 p-4 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {item.icon}
                </div>
                <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="border-y bg-card/50 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Lộ trình 30 ngày
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Học theo tuần, thấy tiến bộ rõ ràng
            </h2>
            <p className="text-muted-foreground">
              Thay vì nhồi thẻ ngẫu nhiên, TailFlash gợi ý từng giai đoạn học để
              bạn bám mục tiêu mà không quá tải.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {learningRoadmap.map((item) => (
              <article
                key={item.week}
                className="group rounded-2xl border bg-background/80 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Rocket className="h-3.5 w-3.5" />
                  {item.week}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                <p className="mt-4 text-sm font-semibold text-primary">
                  Kỳ vọng: {item.metric}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Community Proof */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Community feedback
              </p>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Người học nói gì về TailFlash
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-sm">
              <Star className="h-4 w-4 text-primary" />
              4.9/5 từ 2.000+ đánh giá
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {communityVoices.map((voice) => (
              <article
                key={voice.name}
                className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border bg-gradient-to-br from-background to-card p-5 shadow-sm duration-500"
              >
                <div className="mb-3 flex items-center gap-2 text-primary">
                  <MessageSquareQuote className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Review verified
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  &ldquo;{voice.quote}&rdquo;
                </p>
                <div className="mt-4 border-t pt-3">
                  <p className="text-sm font-semibold">{voice.name}</p>
                  <p className="text-xs text-muted-foreground">{voice.role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-8">
        <div className="mx-auto max-w-4xl rounded-3xl border bg-card/60 p-6 sm:p-8">
          <div className="mb-5 space-y-2 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              FAQ
            </p>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Câu hỏi thường gặp trước khi bắt đầu
            </h2>
          </div>

          <Accordion type="single" collapsible>
            {faqs.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="text-base">{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16 pt-8">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border bg-gradient-to-r from-primary via-accent to-secondary p-8 text-primary-foreground shadow-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide">
                Sẵn sàng chưa?
              </p>
              <h2 className="text-3xl font-bold">
                Học theo phong cách flashcards.world, nhưng đầy đủ tính năng
              </h2>
              <p className="text-sm opacity-90">
                Giữ nguyên cài đặt hiện tại · Không mất dữ liệu · Có thể quay
                lại giao diện cũ bất cứ lúc nào.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:w-48">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="w-full bg-background text-foreground hover:bg-background/90"
                >
                  Bắt đầu ngay
                </Button>
              </Link>
              <Link href="/study">
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full text-primary-foreground hover:bg-white/10"
                >
                  Xem demo nhanh
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
