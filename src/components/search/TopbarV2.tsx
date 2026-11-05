import { Separator } from "../atoms";
import { AccountTrigger, DateTime, Logo, NotificationTrigger } from "../molecules";
import type { Entry } from "../../people";
import { GlobalSearch } from "./GlobalSearch";

/** Topbar v2: logo (start) · global search (true centre) · time, events, account (end). */
export function TopbarV2({ notificationCount, account, onPick, onSearchOpenChange }: { notificationCount: number; account: { name: string; initials: string; role: string }; onPick: (e: Entry) => void; onSearchOpenChange?: (open: boolean) => void }) {
  return (
    <header className="topbar-v2" role="banner">
      <div className="topbar-v2__start">
        <Logo />
      </div>
      <GlobalSearch onPick={onPick} onOpenChange={onSearchOpenChange} />
      <div className="topbar-v2__end">
        <DateTime time="09:56:45 AM" date="Jul 15, 2025 · UTC+05:30" />
        <Separator />
        <NotificationTrigger count={notificationCount} status="unread" />
        <Separator />
        <AccountTrigger name={account.name} initials={account.initials} role={account.role} />
      </div>
    </header>
  );
}
