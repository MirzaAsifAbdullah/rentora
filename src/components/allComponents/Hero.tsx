
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <Image
        src="/homa-appliances-SaX8ZBFkLTc-unsplash.jpg"
        alt="Equipment rental"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-black/60" />

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 pt-24 text-center text-white">
        <h1 className="mx-auto max-w-4xl font-serif text-5xl font-medium leading-[1.1] tracking-tight sm:text-6xl md:text-7xl lg:text-[88px]">
          Rent Better.
          <br />
          Work Smarter.
          <br />
          Live Easier.
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg md:text-xl">
          Find the right equipment for every project. Explore quality rentals,
          enjoy flexible solutions, and get everything you need in one place.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            
            variant="outline"
            className="h-14 w-full rounded-none border-2 border-white bg-transparent px-10 text-base font-semibold text-white transition-all hover:bg-white hover:text-black sm:w-auto"
          >
            <Link href="/about">Explore Our Services</Link>
          </Button>

          <Button
            
            className="h-14 w-full rounded-none bg-[#80bd50] px-10 text-base font-semibold text-white transition-all hover:bg-[#6da640] sm:w-auto"
          >
            <Link href="/equipment">Browse Equipment</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
