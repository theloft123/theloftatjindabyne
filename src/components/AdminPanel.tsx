"use client";

import { useEffect, useState } from "react";
import { useAccess } from "@/context/AccessContext";
import { useSiteContent } from "@/context/SiteContentContext";
import type { SiteContent } from "@/lib/siteContent";

const SECTION_CLASS = "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm";

export function AdminPanel() {
  const { role, token, clearAccess } = useAccess();
  const { content, updateContent, refresh } = useSiteContent();
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<
    { type: "guest" | "admin"; text: string } | null
  >(null);
  const [draft, setDraft] = useState<SiteContent | null>(content);
  const [passwords, setPasswords] = useState({
    guest: "",
    admin: "",
    adminConfirm: "",
    currentAdmin: "",
  });

  useEffect(() => {
    if (content) {
      setDraft(content);
    }
  }, [content]);

  if (role !== "admin" || !token) {
    return null;
  }

  const handleContentChange = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => {
    if (!draft) return;
    setDraft({ ...draft, [key]: value });
  };

  const handleSaveContent = async () => {
    if (!draft) return;
    try {
      setSaving(true);
      setMessage(null);
      await updateContent(draft);
      setMessage("Content updated successfully.");
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error ? error.message : "Failed to update content."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (roleToUpdate: "guest" | "admin") => {
    try {
      setPasswordSaving(true);
      setPasswordMessage(null);

      if (roleToUpdate === "admin" && passwords.admin !== passwords.adminConfirm) {
        setPasswordMessage({ type: "admin", text: "Admin passwords do not match." });
        return;
      }

      const newPassword = roleToUpdate === "guest" ? passwords.guest : passwords.admin;
      if (!newPassword) {
        setPasswordMessage({ type: roleToUpdate, text: "New password cannot be empty." });
        return;
      }

      const response = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: roleToUpdate,
          newPassword,
          currentAdminPassword: passwords.currentAdmin || undefined,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        if (response.status === 401) {
          clearAccess();
          throw new Error("Admin session expired. Log in again to continue.");
        }
        throw new Error(body.error ?? "Unable to update password.");
      }

      setPasswordMessage(
        roleToUpdate === "guest"
          ? {
              type: "guest",
              text: "Guest password updated. Share the new password with guests.",
            }
          : {
              type: "admin",
              text: "Admin password updated. Log in again with the new password next time.",
            }
      );
      setPasswords({ guest: "", admin: "", adminConfirm: "", currentAdmin: "" });
    } catch (error) {
      console.error(error);
      setPasswordMessage({
        type: roleToUpdate,
        text: error instanceof Error ? error.message : "Unable to update password.",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <aside className="space-y-6">
      <div className={`${SECTION_CLASS} border-slate-900 bg-slate-900 text-white`}>
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Admin control room</h2>
          <p className="text-sm text-slate-200">
            You are viewing the site in admin mode. Updates are saved to Supabase and visible to guests immediately.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900"
              onClick={() => fullRefresh()}
            >
              Refresh data
            </button>
            <button
              type="button"
              className="rounded-full border border-white/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-white/10"
              onClick={clearAccess}
            >
              Exit admin mode
            </button>
          </div>
        </div>
      </div>

      {draft && (
        <section className={SECTION_CLASS}>
          <h3 className="text-base font-semibold text-slate-900">Headline & intro</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Eyebrow
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                value={draft.hero.eyebrow}
                onChange={(event) =>
                  handleContentChange("hero", { ...draft.hero, eyebrow: event.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Headline
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                value={draft.hero.headline}
                onChange={(event) =>
                  handleContentChange("hero", { ...draft.hero, headline: event.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Hero description
              </label>
              <textarea
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                rows={4}
                value={draft.hero.description}
                onChange={(event) =>
                  handleContentChange("hero", { ...draft.hero, description: event.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Property intro heading
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                value={draft.details.introHeading}
                onChange={(event) =>
                  handleContentChange("details", {
                    ...draft.details,
                    introHeading: event.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Property intro copy
              </label>
              <textarea
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                rows={4}
                value={draft.details.introCopy}
                onChange={(event) =>
                  handleContentChange("details", {
                    ...draft.details,
                    introCopy: event.target.value,
                  })
                }
              />
            </div>
          </div>
        </section>
      )}

      {draft && (
        <section className={SECTION_CLASS}>
          <h3 className="text-base font-semibold text-slate-900">Highlights</h3>
          <div className="mt-4 space-y-6">
            {draft.details.highlights.map((highlight, index) => (
              <div key={highlight.title} className="space-y-3 rounded-2xl bg-slate-50 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                      Title
                    </label>
                    <input
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2"
                      value={highlight.title}
                      onChange={(event) => {
                        const next = [...draft.details.highlights];
                        next[index] = { ...highlight, title: event.target.value };
                        handleContentChange("details", { ...draft.details, highlights: next });
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                      Highlight
                    </label>
                    <input
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2"
                      value={highlight.highlight}
                      onChange={(event) => {
                        const next = [...draft.details.highlights];
                        next[index] = { ...highlight, highlight: event.target.value };
                        handleContentChange("details", { ...draft.details, highlights: next });
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Description
                  </label>
                  <textarea
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2"
                    rows={3}
                    value={highlight.description}
                    onChange={(event) => {
                      const next = [...draft.details.highlights];
                      next[index] = { ...highlight, description: event.target.value };
                      handleContentChange("details", { ...draft.details, highlights: next });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {draft && (
        <section className={SECTION_CLASS}>
          <h3 className="text-base font-semibold text-slate-900">Amenities</h3>
          <p className="mt-1 text-sm text-slate-500">
            Enter one amenity per line. These’re displayed as a two-column list for guests.
          </p>
          <textarea
            className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3"
            rows={6}
            value={draft.details.amenities.join("\n")}
            onChange={(event) =>
              handleContentChange("details", {
                ...draft.details,
                amenities: event.target.value
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean),
              })
            }
          />
        </section>
      )}

      {draft && (
        <section className={SECTION_CLASS}>
          <h3 className="text-base font-semibold text-slate-900">Gallery</h3>
          <p className="mt-1 text-sm text-slate-500">
            Provide full image URLs (ideally hosted on an S3 bucket or CDN). The first four images are featured in the mosaic.
          </p>
          <div className="mt-4 space-y-3">
            {draft.gallery.map((image, index) => (
              <div key={image.src} className="space-y-2 rounded-2xl bg-slate-50 p-4">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Image URL #{index + 1}
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-2"
                  value={image.src}
                  onChange={(event) => {
                    const next = [...draft.gallery];
                    next[index] = { ...image, src: event.target.value };
                    setDraft({ ...draft, gallery: next });
                  }}
                />
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Alt text
                </label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 px-4 py-2"
                  rows={2}
                  value={image.alt}
                  onChange={(event) => {
                    const next = [...draft.gallery];
                    next[index] = { ...image, alt: event.target.value };
                    setDraft({ ...draft, gallery: next });
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {draft && (
        <section className={SECTION_CLASS}>
          <h3 className="text-base font-semibold text-slate-900">Rates & blocked dates</h3>
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <NumberField
                label="Weeknight rate"
                suffix="AUD/night"
                value={draft.bookings.weekdayRate}
                onChange={(value) =>
                  handleContentChange("bookings", { ...draft.bookings, weekdayRate: value })
                }
              />
              <NumberField
                label="Weekend rate"
                suffix="AUD/night"
                value={draft.bookings.weekendRate}
                onChange={(value) =>
                  handleContentChange("bookings", { ...draft.bookings, weekendRate: value })
                }
              />
              <NumberField
                label="Cleaning fee"
                suffix="AUD"
                value={draft.bookings.cleaningFee}
                onChange={(value) =>
                  handleContentChange("bookings", { ...draft.bookings, cleaningFee: value })
                }
              />
              <NumberField
                label="Minimum nights"
                value={draft.bookings.minimumNights}
                onChange={(value) =>
                  handleContentChange("bookings", { ...draft.bookings, minimumNights: value })
                }
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Blocked date ranges
              </label>
              <p className="mt-2 text-xs text-slate-500">
                Enter one range per line in YYYY-MM-DD to YYYY-MM-DD format. Guests can’t select blocked nights.
              </p>
              <textarea
                className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3"
                rows={6}
                value={formatBlockedDates(draft.bookings.blockedDates)}
                onChange={(event) =>
                  handleContentChange("bookings", {
                    ...draft.bookings,
                    blockedDates: parseBlockedDates(event.target.value),
                  })
                }
              />
            </div>
          </div>
        </section>
      )}

      <div className={SECTION_CLASS}>
        <div className="flex flex-col gap-3">
          <h3 className="text-base font-semibold text-slate-900">Guest password</h3>
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="New guest password"
            type="password"
            value={passwords.guest}
            onChange={(event) => setPasswords({ ...passwords, guest: event.target.value })}
          />
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="Confirm admin password"
            type="password"
            value={passwords.currentAdmin}
            onChange={(event) => setPasswords({ ...passwords, currentAdmin: event.target.value })}
          />
          <button
            type="button"
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white"
            onClick={() => handlePasswordUpdate("guest")}
            disabled={passwordSaving}
          >
            {passwordSaving ? "Updating..." : "Update guest password"}
          </button>
          {passwordMessage?.type === "guest" && (
            <p className="text-sm text-slate-500">{passwordMessage.text}</p>
          )}
        </div>
      </div>

      <div className={SECTION_CLASS}>
        <div className="flex flex-col gap-3">
          <h3 className="text-base font-semibold text-slate-900">Admin password</h3>
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="New admin password"
            type="password"
            value={passwords.admin}
            onChange={(event) => setPasswords({ ...passwords, admin: event.target.value })}
          />
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="Confirm new admin password"
            type="password"
            value={passwords.adminConfirm}
            onChange={(event) => setPasswords({ ...passwords, adminConfirm: event.target.value })}
          />
          <button
            type="button"
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white"
            onClick={() => handlePasswordUpdate("admin")}
            disabled={passwordSaving}
          >
            {passwordSaving ? "Updating..." : "Update admin password"}
          </button>
          {passwordMessage?.type === "admin" && (
            <p className="text-sm text-slate-500">{passwordMessage.text}</p>
          )}
        </div>
      </div>

      <div className={SECTION_CLASS}>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="rounded-full bg-sky-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-950 hover:bg-sky-300"
            onClick={handleSaveContent}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save all content"}
          </button>
          {message && <p className="text-sm text-slate-500">{message}</p>}
        </div>
      </div>
    </aside>
  );

  function fullRefresh() {
    void refresh();
  }
}

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
};

function NumberField({ label, value, onChange, suffix }: NumberFieldProps) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
        {label}
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3">
        <input
          type="number"
          className="w-full bg-transparent text-sm"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        {suffix && <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{suffix}</span>}
      </div>
    </div>
  );
}

function formatBlockedDates(blockedDates: SiteContent["bookings"]["blockedDates"]) {
  return blockedDates
    .map((range) =>
      range.end
        ? `${range.start} to ${range.end}${range.note ? ` | ${range.note}` : ""}`
        : range.start
    )
    .join("\n");
}

function parseBlockedDates(value: string): SiteContent["bookings"]["blockedDates"] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [range, note] = line.split("|").map((part) => part.trim());
      const [start, end] = range
        .split(/to|-/i)
        .map((part) => part.trim())
        .filter(Boolean);

      if (!start) {
        return null;
      }

      return {
        start,
        end: end ?? start,
        note: note ?? undefined,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}
