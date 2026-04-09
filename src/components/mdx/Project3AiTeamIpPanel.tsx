const IP_SRCS = [
  { src: "/projects/project-3/kimmy_ip.png", alt: "Kimmy IP", size: 64 },
  { src: "/projects/project-3/Timmy_ip.png", alt: "Timmy IP", size: 54 },
  { src: "/projects/project-3/Turi_ip.png", alt: "Turi IP", size: 64 },
] as const;

export default function Project3AiTeamIpPanel() {
  return (
    <div
      className="my-10 ml-6 flex min-h-36 w-full max-w-4xl items-center justify-center border border-[#e8e4dc] py-10 pl-4 pr-4 md:min-h-40 md:py-12"
      style={{ backgroundColor: "#f7f4ed" }}
    >
      <div className="flex flex-nowrap items-center justify-center gap-4 md:gap-6">
        {IP_SRCS.map((ip) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={ip.src}
            src={ip.src}
            alt={ip.alt}
            width={ip.size}
            height={ip.size}
            className="shrink-0 object-contain"
            style={{ width: ip.size, height: ip.size }}
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    </div>
  );
}
