import Image from "next/image";
import { HERO_COPY } from "./hero.copy";
import HeroMotion from "./HeroMotion.client";
import HeroVideo from "./HeroVideo.client";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <HeroMotion />

      <div className="mx-auto max-w-7xl grid lg:grid-cols-12 gap-16 px-6 py-24">
        <div className="lg:col-span-7 space-y-8">
          <h1 className="text-6xl font-bold">
            <span className="block">{HERO_COPY.headline.prefix}</span>
            <span className="gradient-text">{HERO_COPY.headline.main}</span>
          </h1>

          <ul className="grid sm:grid-cols-2 gap-4">
            {HERO_COPY.benefits.map((b:string) => (
              <li key={b} className="flex gap-2">
                <span className="text-green-500">✓</span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5">
          <Image
            src={HERO_COPY.slides[0].image}
            alt={HERO_COPY.slides[0].alt}
            priority
            fill
            className="object-cover rounded-3xl"
          />
        </div>
      </div>

      <HeroVideo />
    </section>
  );
}
