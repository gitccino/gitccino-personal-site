import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useDisclosure } from "@/hooks/use-disclosure";
import { createFileRoute } from "@tanstack/react-router";
import { codeToHtml } from "shiki";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import pfp from "@/assets/gitccino-pfp.png";

const fagItem = `function FaqItem({ question, answer }) {
  const [isOpen, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen}>
        {question}
      </button>
      <section hidden={!isOpen}>{answer}</section>
    </div>
  );
}`;
const userMenu = `function UserMenu({ user }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <div role="button" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen}>
        <Avatar src={user.avatar} />
      </div>
      <ul hidden={!isOpen} className="floating-popover">
        <li><a href="/settings">Settings</a></li>
      </ul>
    </div>
  )
}`;

const htmlFagItem = await codeToHtml(fagItem, {
  lang: "tsx",
  theme: "one-light",
});
const htmlUseMenu = await codeToHtml(userMenu, {
  lang: "tsx",
  theme: "one-light",
});

export const Route = createFileRoute("/headless-hook-prop-getters")({
  component: RouteComponent,
});

const FAQ = [
  {
    question: "What's headless hook?",
    answer: "A hook that holds the behavior but returns no JSX",
  },
  {
    question: "What's prop getters?",
    answer: "A function the hook gives you that returns a ready-made bundle of props to spread",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const { isOpen, getTriggerProps, getContentProps } = useDisclosure();
  const shouldReduce = useReducedMotion();

  return (
    <div className="w-full rounded-sm bg-me-cream text-sm">
      <div>
        <button
          {...getTriggerProps()}
          type="button"
          className="flex w-full items-center justify-between px-3 py-2 text-left"
        >
          <p>{question}</p>
          {/*<span className="text-me-muted" aria-hidden>
            {isOpen ? "−" : "+"}
          </span>*/}
          <motion.span
            className="text-me-muted"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={
              shouldReduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }
            }
          >
            <HugeiconsIcon icon={ArrowDown01Icon} size={12} color="currentColor" strokeWidth={2} />
          </motion.span>
        </button>
      </div>
      {/*<section
        {...getContentProps()}
        className="px-4 pb-2 text-me-secondary-muted"
      >
        {answer}
      </section>*/}

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            {...getContentProps()}
            // Motion owns presence now; `hidden` would kill the exit animation.
            hidden={undefined}
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              shouldReduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }
            }
          >
            <div className="px-4 pb-2 text-me-secondary-muted">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UserMenu({
  user,
  // onOpenTracked,
}: {
  user: { name: string; avatar: string };
  // onOpenTracked: () => void;
}) {
  const { isOpen, getTriggerProps, getContentProps } = useDisclosure();
  const shouldReduce = useReducedMotion();

  return (
    <div className="relative flex flex-col items-center justify-center gap-1">
      <button
        // role="button"
        {...getTriggerProps()}
        className="flex cursor-pointer items-center gap-2"
      >
        <img
          src={user.avatar}
          alt={`${user.name} profile picture`}
          className="size-14 shrink-0 rounded-sm object-cover"
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.ul
            {...getContentProps()}
            role="menu"
            className="absolute top-15 w-30 overflow-hidden rounded-sm border border-border p-1 text-xs"

            hidden={undefined}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              shouldReduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }
            }
          >
            <li
              role="menuitem"
              className="cursor-pointer rounded p-0.5 px-1 text-me-secondary-muted hover:text-me-secondary"
            >
              Settings
            </li>
            <li
              role="menuitem"
              className="cursor-pointer rounded p-0.5 px-1 text-me-secondary-muted hover:text-me-secondary"
            >
              Sign Out
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export function RouteComponent() {
  return (
    <div className="space-y-4 p-2 pb-100">
      <p className="font-medium text-me-primary">Implementing Behavior-only headless hook</p>
      {/* ponytail: input is a literal, and Shiki escapes the code it wraps. */}
      <div className="space-y-3 text-me-secondary">
        <div className="my-10 space-y-2">
          <p>Monday you build the FAQ.</p>
          <div
            className="[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:text-xs"
            dangerouslySetInnerHTML={{ __html: htmlFagItem }}
          />
        </div>

        <div className="my-10 space-y-2">
          <p>Wednesday you build the user menu and so on the third one on Friday.</p>
          <div
            className="[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:text-xs"
            dangerouslySetInnerHTML={{ __html: htmlUseMenu }}
          />
        </div>

        <blockquote>Escape key should close these</blockquote>
        <p>
          Now you edit both file. Add the same <code className="highlighter">onKeyDown</code> twice.
          Miss a third one someone built in another folder. Instead you create a headless hook to
          hold the logic in one place. Add prop-getter on top that hands you the wiring
          pre-assembled, as an object to spread.
        </p>
        <p>
          With the behavior-only headless hook, behavior is extracted from presentation, exposed via
          prop getters. Below is the <code className="highlighter">FaqItem</code> component built
          with <code className="highlighter">useDisclosure</code>
        </p>

        <div className="flex flex-col gap-1 px-4 py-10">
          {FAQ.map(({ question, answer }) => (
            <FaqItem key={question} question={question} answer={answer} />
          ))}
        </div>

        <p>
          Now let's try build the <code className="highlighter">UserMenu</code> using our headless
          hook
        </p>

        <div className="flex items-center justify-center p-10">
          <UserMenu
            user={{ name: "gitccino", avatar: pfp }}
            // onOpenTracked={() => console.log("tracking...")}
          />
        </div>
      </div>
    </div>
  );
}
