"use client";

import Image from "next/image";

const images = {
  theatre:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Shea%E2%80%99s_Buffalo_Theater%2C_Main_Street%2C_Buffalo%2C_NY.jpg",
  downtown:
    "https://commons.wikimedia.org/wiki/Special:FilePath/American_Falls_from_Goat_Island_October_2019.jpg",
  skyline:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Skyline_of_the_City_of_Buffalo.jpg",
};

export function CityBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,201,131,0.24),transparent_22%),radial-gradient(circle_at_82%_22%,rgba(116,168,214,0.18),transparent_24%),linear-gradient(180deg,rgba(8,14,20,0.4),rgba(8,14,20,0.76))]" />

      <div
        className="bg-panel bg-panel-theatre absolute inset-y-[-5%] left-[-8%] w-[54%] overflow-hidden border-r border-white/8 shadow-[0_24px_80px_rgba(0,0,0,0.26)]"
        style={{ clipPath: "polygon(0 0, 88% 0, 66% 100%, 0 100%)" }}
      >
        <Image
          src={images.theatre}
          alt="Downtown Buffalo theatre district scene."
          fill
          priority
          sizes="50vw"
          className="bg-panel-image bg-panel-image-theatre"
        />
      </div>

      <div className="bg-panel bg-panel-downtown absolute left-[22%] top-[6%] h-[78%] w-[54%] overflow-hidden rounded-[2.8rem] border border-white/10 shadow-[0_26px_90px_rgba(0,0,0,0.3)]">
        <Image
          src={images.downtown}
          alt="Niagara Falls scene viewed from Goat Island."
          fill
          loading="eager"
          sizes="50vw"
          className="bg-panel-image bg-panel-image-downtown"
        />
      </div>

      <div
        className="bg-panel bg-panel-skyline absolute inset-y-[22%] right-[-10%] w-[52%] overflow-hidden border-l border-white/8 shadow-[0_24px_80px_rgba(0,0,0,0.26)]"
        style={{ clipPath: "polygon(24% 0, 100% 0, 100% 100%, 0 100%)" }}
      >
        <Image
          src={images.skyline}
          alt="Buffalo waterfront skyline scene."
          fill
          sizes="44vw"
          className="bg-panel-image bg-panel-image-skyline"
        />
      </div>

      <div className="bg-orb absolute left-[40%] top-[12%] h-[34rem] w-[34rem] rounded-full" />
      <div className="bg-light-sweep absolute inset-y-0 left-[-20%] w-[48%]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,11,16,0.1),rgba(8,11,16,0.78))]" />
    </div>
  );
}
