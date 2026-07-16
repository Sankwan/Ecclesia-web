import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { heroPhoto, skillPhoto } from "@/lib/images";

const SKILLS = [
  { slug: "drummer", name: "Drummer" },
  { slug: "keyboardist", name: "Keyboardist" },
  { slug: "sound-engineer", name: "Sound Engineer" },
  { slug: "vocalist", name: "Vocalist" },
  { slug: "lead-guitarist", name: "Lead Guitarist" },
  { slug: "livestream-operator", name: "Livestream Operator" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper/80 px-6 py-4 backdrop-blur md:px-10">
        <span className="font-display text-xl font-semibold tracking-tight">ChurchConnect</span>
        <nav className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="secondary" className="px-4 py-2 text-sm">
              Log in
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero — photograph-led, Airbnb warmth + Thumbtack intent */}
      <section className="px-6 pt-12 md:px-10 md:pt-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <span className="eyebrow">Accra pilot · verified worship talent</span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] md:text-6xl">
              Find a drummer for Sunday when yours cancels on Saturday night.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-soft">
              Post the need once. Verified musicians and technicians nearby get notified in minutes,
              apply with their price, and you pick — no group-chat scramble.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login?role=church">
                <Button className="px-6 py-3 text-base">Find someone for my church</Button>
              </Link>
              <Link href="/login?role=provider">
                <Button variant="secondary" className="px-6 py-3 text-base">
                  Offer my skills
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroPhoto}
              alt="A worship band performing on stage"
              className="aspect-[4/3] w-full rounded-[var(--radius-xl)] object-cover shadow-[var(--shadow-lift)]"
              loading="eager"
            />
            <div className="absolute -bottom-5 -left-5 hidden rounded-[var(--radius-lg)] border border-line bg-surface p-4 shadow-[var(--shadow-card)] sm:block">
              <p className="eyebrow">Emergency request</p>
              <p className="mt-1 font-display text-lg font-semibold">Drummer · East Legon</p>
              <p className="text-sm text-verified">3 verified nearby · notified</p>
            </div>
          </div>
        </div>
      </section>

      {/* Skill discovery — image tiles, marketplace feel */}
      <section className="px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">Roles churches book most</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            {SKILLS.map((s) => (
              <div key={s.slug} className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={skillPhoto(s.slug, 600)}
                  alt={s.name}
                  className="aspect-[3/2] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-3 left-4 font-display text-lg font-semibold text-white">
                  {s.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-line bg-surface px-6 py-16 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
          <Step
            n="1"
            title="Post the need"
            body="Skill, date, budget, how urgent. Emergency requests fire off immediately — no waiting for someone to open the app."
          />
          <Step
            n="2"
            title="Nearby talent is notified"
            body="Push and SMS go out in waves, closest and most reliable first, widening automatically until someone answers."
          />
          <Step
            n="3"
            title="Pick, then meet with a code"
            body="Accept an offer and the booking locks in. Phone numbers and the exact address unlock only between the two of you."
          />
        </div>
      </section>

      <footer className="mt-auto border-t border-line px-6 py-8 text-sm text-ink-faint md:px-10">
        ChurchConnect — built for the Accra pilot. Money moves church-to-provider by MoMo directly.
      </footer>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-clay-tint font-display text-lg font-semibold text-clay">
        {n}
      </span>
      <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-ink-soft">{body}</p>
    </div>
  );
}
