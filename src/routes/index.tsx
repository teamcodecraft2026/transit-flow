import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Smartphone, UserRound } from "lucide-react";
import roleBg from "@/assets/role-select-bg.jpg";
import { useI18n } from "@/i18n/LanguageProvider";
import { Button } from "@/components/Button";
import { TiltCard } from "@/components/TiltCard";
import { ParallaxLayer } from "@/components/ParallaxLayer";
import { LanguageToggle } from "@/components/LanguageToggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Public Transit — Choose Passenger or Conductor" },
      {
        name: "description",
        content:
          "Enter Public Transit as a passenger to book bus tickets and apply for the Pink Card, or as a conductor to scan and verify boarding.",
      },
      { property: "og:title", content: "Public Transit — Choose Passenger or Conductor" },
      {
        property: "og:description",
        content:
          "Bilingual bus ticketing with instant Pink Card zero-fare verification for eligible women.",
      },
    ],
  }),
  component: RoleSelect,
});

function RoleSelect() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas">
      <ParallaxLayer distance={60} className="-inset-y-24">
        <img
          src={roleBg}
          alt=""
          width={1920}
          height={1088}
          className="size-full object-cover opacity-55"
        />
      </ParallaxLayer>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

      <div className="relative z-10 flex min-h-screen flex-col px-6 py-20">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="grid w-full max-w-[960px] gap-8 md:grid-cols-2">
            <RoleCard
              tone="rose"
              icon={<Smartphone className="size-8 text-rose-bright" strokeWidth={1.5} />}
              title={t("role.passenger")}
              description={t("role.passengerDesc")}
              cta={t("role.continue")}
              onClick={() => navigate({ to: "/home" })}
              delay={0}
            />
            <RoleCard
              tone="navy"
              icon={<UserRound className="size-8 text-navy-bright" strokeWidth={1.5} />}
              title={t("role.conductor")}
              description={t("role.conductorDesc")}
              cta={t("role.continue")}
              onClick={() => navigate({ to: "/conductor" })}
              delay={120}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleCard({
  tone,
  icon,
  title,
  description,
  cta,
  onClick,
  delay,
}: {
  tone: "rose" | "navy";
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
  delay: number;
}) {
  const ring =
    tone === "rose"
      ? "border-rose-bright/70 shadow-[0_0_60px_-20px_var(--color-rose-glow)]"
      : "border-navy-bright/70 shadow-[0_0_60px_-20px_var(--color-navy-bright)]";
  const halo = tone === "rose" ? "bg-rose-bright/15" : "bg-navy-bright/15";

  return (
    <TiltCard className="anim-fade-up">
      <div
        style={{ animationDelay: `${delay}ms` }}
        className={`flex flex-col items-center rounded-[20px] border bg-white/[0.04] px-8 py-12 text-center backdrop-blur-xl ${ring}`}
      >
        <div className={`flex size-[88px] items-center justify-center rounded-full ${halo}`}>
          {icon}
        </div>
        <h2 className="mt-6 font-display text-[30px] font-semibold text-ink">{title}</h2>
        <span
          className={`mt-4 h-px w-full max-w-[280px] ${
            tone === "rose" ? "bg-rose-bright/50" : "bg-navy-bright/50"
          }`}
        />
        <p className="mt-8 max-w-[260px] font-display text-[19px] leading-relaxed text-ink/90">
          {description}
        </p>
        <Button
          variant={tone === "rose" ? "pinkSolid" : "blue"}
          size="pill"
          className="mt-10 font-display text-[17px] font-medium"
          onClick={onClick}
        >
          {cta}
        </Button>
      </div>
    </TiltCard>
  );
}


// import { createFileRoute, useNavigate } from "@tanstack/react-router";
// import { Smartphone, UserRound } from "lucide-react";
// import roleBg from "@/assets/role-select-bg.jpg";
// import { useI18n } from "@/i18n/LanguageProvider";
// import { Button } from "@/components/Button";
// import { TiltCard } from "@/components/TiltCard";
// import { ParallaxLayer } from "@/components/ParallaxLayer";
// import { LanguageToggle } from "@/components/LanguageToggle";

// export const Route = createFileRoute("/")({
//   head: () => ({
//     meta: [
//       { title: "Public Transit — Choose Passenger or Conductor" },
//       {
//         name: "description",
//         content:
//           "Enter Public Transit as a passenger to book bus tickets and apply for the Pink Card, or as a conductor to scan and verify boarding.",
//       },
//       { property: "og:title", content: "Public Transit — Choose Passenger or Conductor" },
//       {
//         property: "og:description",
//         content:
//           "Bilingual bus ticketing with instant Pink Card zero-fare verification for eligible women.",
//       },
//     ],
//   }),
//   component: RoleSelect,
// });

// function RoleSelect() {
//   const { t } = useI18n();
//   const navigate = useNavigate();

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-canvas">
//       <ParallaxLayer distance={60} className="-inset-y-24">
//         <img
//           src={roleBg}
//           alt=""
//           width={1920}
//           height={1088}
//           className="size-full object-cover opacity-55"
//         />
//       </ParallaxLayer>
//       <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

//       <div className="absolute right-6 top-6 z-10">
//         <LanguageToggle />
//       </div>

//       <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-20">
//         <div className="grid w-full max-w-[960px] gap-8 md:grid-cols-2">
//           <RoleCard
//             tone="rose"
//             icon={<Smartphone className="size-8 text-rose-bright" strokeWidth={1.5} />}
//             title={t("role.passenger")}
//             description={t("role.passengerDesc")}
//             cta={t("role.continue")}
//             onClick={() => navigate({ to: "/home" })}
//             delay={0}
//           />
//           <RoleCard
//             tone="navy"
//             icon={<UserRound className="size-8 text-navy-bright" strokeWidth={1.5} />}
//             title={t("role.conductor")}
//             description={t("role.conductorDesc")}
//             cta={t("role.continue")}
//             onClick={() => navigate({ to: "/conductor" })}
//             delay={120}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// function RoleCard({
//   tone,
//   icon,
//   title,
//   description,
//   cta,
//   onClick,
//   delay,
// }: {
//   tone: "rose" | "navy";
//   icon: React.ReactNode;
//   title: string;
//   description: string;
//   cta: string;
//   onClick: () => void;
//   delay: number;
// }) {
//   const ring =
//     tone === "rose"
//       ? "border-rose-bright/70 shadow-[0_0_60px_-20px_var(--color-rose-glow)]"
//       : "border-navy-bright/70 shadow-[0_0_60px_-20px_var(--color-navy-bright)]";
//   const halo = tone === "rose" ? "bg-rose-bright/15" : "bg-navy-bright/15";

//   return (
//     <TiltCard className="anim-fade-up" >
//     <div
//       style={{ animationDelay: `${delay}ms` }}
//       className={`flex flex-col items-center rounded-[20px] border bg-white/[0.04] px-8 py-12 text-center backdrop-blur-xl ${ring}`}
//     >
//       <div className={`flex size-[88px] items-center justify-center rounded-full ${halo}`}>
//         {icon}
//       </div>
//       <h2 className="mt-6 font-display text-[30px] font-semibold text-ink">{title}</h2>
//       <span
//         className={`mt-4 h-px w-full max-w-[280px] ${
//           tone === "rose" ? "bg-rose-bright/50" : "bg-navy-bright/50"
//         }`}
//       />
//       <p className="mt-8 max-w-[260px] font-display text-[19px] leading-relaxed text-ink/90">
//         {description}
//       </p>
//       <Button
//         variant={tone === "rose" ? "pinkSolid" : "blue"}
//         size="pill"
//         className="mt-10 font-display text-[17px] font-medium"
//         onClick={onClick}
//       >
//         {cta}
//       </Button>
//     </div>
//     </TiltCard>
//   );
// }
