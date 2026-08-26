import { useDisclosure } from "@/hooks/use-disclosure";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  GithubIcon,
  GridViewIcon,
} from "@hugeicons/core-free-icons";
import { LINKS } from "./__root";
// import pfp from "@/assets/gitccino-pfp.png";
import pfp from "@/assets/gitccino.gif";
import LinkedinIcon from "@/assets/linkedin.png";
import { AnnArrow } from "@/components/self-ui/ann-arrow";
import StackIcon from "tech-stack-icons";
import { Marquee } from "@/components/ui/marquee";
import { useState } from "react";
import { Toggle } from "@/components/ui/toggle";
// import {
//   Combobox,
//   ComboboxChip,
//   ComboboxChips,
//   ComboboxChipsInput,
//   ComboboxContent,
//   ComboboxEmpty,
//   ComboboxItem,
//   ComboboxList,
//   ComboboxValue,
// } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  // SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  component: Index,
});

type FECollapsibleProps = {
  title: string;
  items: readonly { label: string; to: string }[];
};

function FECollapsible({ title, items }: FECollapsibleProps) {
  const { isOpen, getTriggerProps, getContentProps } = useDisclosure();
  const shouldReduce = useReducedMotion();

  return (
    <div className="w-full rounded-rm debug">
      <div>
        <button
          {...getTriggerProps()}
          type="button"
          className="w-full flex justify-start items-center gap-3"
        >
          <motion.span animate={{ rotate: isOpen ? 90 : 0 }}>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={12}
              color="currentColor"
              strokeWidth={2}
            />
          </motion.span>
          <p>{title}</p>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            {...getContentProps()}
            hidden={undefined}
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              shouldReduce
                ? { duration: 0 }
                : { type: "spring", stiffness: 300, damping: 30 }
            }
          >
            <div className="px-8 p-0 text-me-secondary-muted flex flex-col ">
              {items.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="w-fit whitespace-nowrap hover:text-me-secondary"
                >
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type Field = (typeof FIELDS)[number];
type Skill = { stackName: string; label: string; field: Field };

const FIELDS = [
  "Languages",
  "Frontend",
  "Backend & Data",
  "Infrastructure",
  "Other",
] as const;
const SKILLSROW: Skill[] = [
  { stackName: "js", label: "JavaScript", field: "Languages" },
  { stackName: "typescript", label: "TypeScript", field: "Languages" },
  { stackName: "python", label: "Python", field: "Languages" },
  { stackName: "react", label: "React", field: "Frontend" },
  { stackName: "nextjs2", label: "Next.js", field: "Frontend" },
  { stackName: "nodejs", label: "Node.js", field: "Backend & Data" },
  { stackName: "hono", label: "Hono", field: "Backend & Data" },
  { stackName: "expressjs", label: "Express.js", field: "Backend & Data" },
  { stackName: "tailwindcss", label: "Tailwind CSS", field: "Frontend" },
  { stackName: "shadcnui", label: "Shadcn UI", field: "Frontend" },
] as const;
const SKILLSROW2: Skill[] = [
  { stackName: "convex", label: "Convex", field: "Backend & Data" },
  { stackName: "tanstack", label: "Tanstack", field: "Frontend" },
  { stackName: "motion", label: "Motion", field: "Frontend" },
  { stackName: "postgresql", label: "PostgreSQL", field: "Backend & Data" },
  { stackName: "firebase", label: "Firebase", field: "Backend & Data" },
  { stackName: "supabase", label: "Supabase", field: "Backend & Data" },
  { stackName: "mongodb", label: "MongoDB", field: "Backend & Data" },
  { stackName: "drizzle", label: "Drizzle", field: "Backend & Data" },
  { stackName: "prisma", label: "Prisma", field: "Backend & Data" },
  { stackName: "zustand", label: "Zustand", field: "Frontend" },
  { stackName: "redis", label: "Redis", field: "Backend & Data" },
  { stackName: "aws", label: "AWS", field: "Infrastructure" },
  { stackName: "cloudflare", label: "Cloudflare", field: "Infrastructure" },
  { stackName: "stripe", label: "Stripe", field: "Other" },
  { stackName: "zod", label: "Zod", field: "Backend & Data" },
] as const;

export function Index() {
  const [enableMarquee, setEnableMarquee] = useState(true);
  const [selectedField, setSelectedField] = useState<string | null>(null);

  return (
    <div className="p-2 space-y-10 debug">
      <div className="debug w-full h-fit pb-20 flex flex-col items-center">
        <img
          src={pfp}
          alt={`gitccino profile picture`}
          className="size-16 shrink-0 object-cover"
        />
        <div className="flex flex-col items-center">
          <p>
            hi. I'm{" "}
            <span className="highlighter-pen [--hl-color:var(--color-me-gray)]">
              Supitcha.
              <span className="absolute -top-6 left-full flex items-center text-me-secondary-muted/70">
                <AnnArrow
                  className="w-10 rotate-60 -rotate-y-180 mt-3"
                  strokeWidth={1.5}
                />
                <a
                  href="https://www.linkedin.com/in/supitcha-klanpradit/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 whitespace-nowrap font-architect"
                >
                  {/*<HugeiconsIcon
                    icon={Linkedin02Icon}
                    size={16}
                    strokeWidth={2.5}
                  />*/}
                  <img
                    src={LinkedinIcon}
                    alt={`LinkedIn logo`}
                    className="size-5 grayscale opacity-30"
                  />
                  linkedin/supitcha
                </a>
              </span>
            </span>
          </p>
          <p>
            I{" "}
            <span className="relative highlighter-pen [--hl-color:var(--color-me-yellow)]">
              build things
              <span className="absolute top-full left-1/2 -translate-x-1/2 flex flex-col items-center pt-1 text-me-secondary-muted/70">
                <AnnArrow
                  className="w-10 rotate-3 -scale-x-100"
                  strokeWidth={1.5}
                />
                {/*<span className="whitespace-nowrap font-architect rotate-2">*/}
                <a
                  href="https://github.com/gitccino"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 whitespace-nowrap font-architect rotate-2"
                >
                  <HugeiconsIcon
                    icon={GithubIcon}
                    size={16}
                    strokeWidth={2.5}
                  />
                  github/gitccino
                </a>
                {/*</span>*/}
              </span>
            </span>{" "}
            and trying new{" "}
            <span className="text-me-secondary-muted line-through">shit</span>
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <p className="text-xs text-me-secondary-muted">
          Just put this together a couple of days ago. It's still rough and
          there's a lot left to do. Come back soon.
        </p>
        <p className="text-xs text-me-secondary-muted">
          This is from the chore/nothing
        </p>
        <div className="space-y-2">
          <p className="text-me-primary font-medium">About me</p>

          <div className="debug px-4 flex flex-col gap-1 text-sm">
            {/*Self-taught full-stack engineer with ML engineering foundation*/}
            <p className="indent-8">
              I once read a CVPR2020 paper more than ten times. Go through every
              line of the paper, every line of its code, until{" "}
              <a
                href="https://github.com/DreamtaleCore/USI3D/commit/b2a08094d6ccf12e1ba53d3f53d8618e34806a1a"
                target="_blank"
                rel="noreferrer"
              >
                <span className="relative underline underline-offset-1 indent-0 highlighter-pen [--hl-color:var(--color-me-yellow)]">
                  I found and fixed a bugs
                </span>{" "}
              </a>
              in the official code of a CVPR2020 paper. That's pretty much who I
              am as a Deveoper.
            </p>
            <p className="indent-8">
              I think Im a fast learner but I prefer slowly and thoroughly. That
              instinct led me to find a bug in the code behind a CVPR 2020 paper
              and in many situations led me to a better decisions.
            </p>
            <p className="indent-8">
              Learning new stuffs, trying new shit that's all I have done for
              the past five years and it's just the beginning.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-me-primary font-medium">Experience</p>

          <div className="debug px-4 flex flex-col gap-1 text-sm">
            <span>Internship Osaka University</span>
            <span>Prev. Machine Learning Engineer @AIGEN</span>
            <span>Web3 Founder & Full-Stack Engineer</span>
            <div>
              Independent Full-Stack Engineer{" "}
              <Badge
                variant="outline"
                className="rounded-md bg-me-green border-0"
              >
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#21A559] opacity-75"></span>
                  <span className="relative inline-flex size-1.5 rounded-full bg-[#21A559]"></span>
                </span>
                Active
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between debug">
            <p className="text-me-primary font-medium">Skills</p>
            <div className="flex gap-1">
              {/*<Combobox
                items={GROUPS}
                multiple
                autoHighlight
                value={skillFilters}
                onValueChange={setSkillFilters}
              >
                <ComboboxChips className="bg-transparent">
                  <ComboboxValue>
                    {skillFilters.map((value) => (
                      <ComboboxChip key={value}>{value}</ComboboxChip>
                    ))}
                  </ComboboxValue>
                  <ComboboxChipsInput placeholder="Filter by Category" />
                </ComboboxChips>
                <ComboboxContent>
                  <ComboboxEmpty>No items found.</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item} value={item}>
                        {item}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>*/}
              {!enableMarquee && (
                <Select value={selectedField} onValueChange={setSelectedField}>
                  <SelectTrigger className="w-full max-w-48 bg-transparent shrink">
                    <SelectValue placeholder="Highlight specific fields" />
                  </SelectTrigger>
                  <SelectContent align="end" alignItemWithTrigger={false}>
                    <SelectGroup>
                      {/*<SelectLabel>Fruits</SelectLabel>*/}
                      {[null, ...FIELDS].map((value) => (
                        <SelectItem value={value}>{value ?? "All"}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}

              <Toggle
                aria-label="Toggle skills display layout"
                size="icon"
                variant="outline"
                className="data-[state=on]:bg-me-green aria-pressed:bg-me-green shrink-0"
                pressed={!enableMarquee}
                onPressedChange={(p) => setEnableMarquee(!p)}
              >
                <HugeiconsIcon
                  icon={GridViewIcon}
                  size={14}
                  color="currentColor"
                  strokeWidth={2}
                />
              </Toggle>
            </div>
          </div>
          {enableMarquee ? (
            <div className="relative">
              <Marquee pauseOnHover className="[--duration:20s]">
                {SKILLSROW.map((row) => (
                  <div
                    key={row.stackName}
                    className="debug flex items-center gap-1"
                  >
                    <StackIcon name={row.stackName} className="h-5 w-5" />
                    <p className="text-xs">{row.label}</p>
                  </div>
                ))}
              </Marquee>
              <Marquee reverse pauseOnHover className="[--duration:20s]">
                {SKILLSROW2.map((row) => (
                  <div
                    key={row.stackName}
                    className="debug flex items-center gap-1"
                  >
                    <StackIcon name={row.stackName} className="h-5 w-5" />
                    <p className="text-xs">{row.label}</p>
                  </div>
                ))}
              </Marquee>
              <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/10 bg-linear-to-r"></div>
              <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/10 bg-linear-to-l"></div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              {[...SKILLSROW, ...SKILLSROW2].map((row) => {
                const dim =
                  selectedField !== null && row.field !== selectedField;
                return (
                  <div
                    key={row.stackName}
                    className={`px-2 py-1 flex items-center gap-1 rounded`}
                  >
                    <StackIcon
                      name={row.stackName}
                      className={`h-5 w-5 shrink-0 ${dim ? "grayscale opacity-5" : ""}`}
                    />
                    <span
                      className={`text-xs truncate ${dim ? "text-me-secondary-muted/10" : ""}`}
                    >
                      {row.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-me-primary font-medium">
            Below is me that keep exploring...
          </p>
          <FECollapsible title={"Frontend & Design patterns"} items={LINKS} />
        </div>
      </div>
    </div>
  );
}
