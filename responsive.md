# Responsive Design — How It Works

A complete walkthrough of every responsive design technique used in this project, so you can apply the same system to any app and have it look great on phones, tablets, and desktops.

---

## The Core Philosophy: Mobile-First

Every style is written for **mobile first**. Larger screen overrides are added with breakpoint prefixes on top. This means the base CSS always works on the smallest screen, and you progressively enhance it upward.

```
Base style (mobile, 0px+)  →  md: override (tablet+, 768px+)  →  lg: override (desktop, 1024px+)
```

Tailwind's `md:` prefix applies at **768px and above**. This single breakpoint handles the most important layout shift in this project — from phone to tablet/desktop.

---

## 1. The Viewport Meta Tag

The first line of responsive defence. Set in `index.html`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
```

| Attribute | What it does |
|---|---|
| `width=device-width` | Makes the layout width equal the physical screen width (not a virtual 980px desktop width) |
| `initial-scale=1.0` | No zoom-in on first load |
| `maximum-scale=1` | Prevents iOS from auto-zooming on input focus (important for quiz inputs) |

Without this tag, mobile browsers render the page as if it were a desktop and then scale it down — everything becomes tiny.

---

## 2. The App Shell — Sidebar vs. Top Bar

This is the biggest layout switch in the whole project. Found in `layout.tsx`.

### The outer wrapper

```tsx
<div className="min-h-screen flex flex-col md:flex-row bg-background">
```

| Screen | `flex-col` vs `flex-row` | Result |
|---|---|---|
| Mobile | `flex-col` (default) | Header on top, content below |
| Tablet / Desktop | `md:flex-row` | Sidebar on left, content on right |

### Mobile — Top Header Bar

```tsx
<div className="md:hidden flex items-center justify-between p-4 border-b">
  <span>Hub</span>            {/* compact logo */}
  <ThemeToggle />
  <HamburgerButton />
</div>
```

`md:hidden` means this **only exists on screens below 768px**. On larger screens it is literally not rendered.

### Mobile — Fullscreen Menu Overlay

When the hamburger is tapped, a fullscreen overlay slides over the content:

```tsx
{isMobileMenuOpen && (
  <div className="md:hidden fixed inset-0 top-16 z-50 bg-background/95 backdrop-blur-sm p-4">
    <nav className="flex flex-col gap-2">
      {navItems.map(item => (
        <Link onClick={() => setIsMobileMenuOpen(false)} ... />
        // closes on tap so user returns to content immediately
      ))}
    </nav>
  </div>
)}
```

Key classes:
- `fixed inset-0` — covers the entire viewport
- `top-16` — starts below the 64px header bar, not behind it
- `z-50` — sits above all page content
- `bg-background/95 backdrop-blur-sm` — semi-transparent frosted glass effect

### Desktop — Sticky Sidebar

```tsx
<div className="hidden md:flex w-64 flex-col border-r sticky top-0 h-screen">
```

`hidden md:flex` means this **only exists on screens 768px and above**. On mobile it is not rendered at all.

- `w-64` — fixed 256px width
- `sticky top-0 h-screen` — stays visible as the main content scrolls
- `h-screen` — always fills the full viewport height

### The Main Content Area

```tsx
<main className="flex-1 overflow-auto">
  <div className="max-w-5xl mx-auto p-4 md:p-8">
    {children}
  </div>
</main>
```

- `flex-1` — takes all remaining horizontal space (after the sidebar on desktop, or full width on mobile)
- `overflow-auto` — main area scrolls independently; sidebar stays fixed
- `max-w-5xl mx-auto` — caps line length at 1024px and centres it on very wide screens
- `p-4 md:p-8` — 16px padding on mobile, 32px on desktop

---

## 3. Grid Layouts That Reflow

Every multi-column section uses CSS Grid with a responsive column count. The pattern is always the same:

```
grid-cols-{mobile}  md:grid-cols-{desktop}
```

### Home — Stats Cards (2 → 4 columns)

```tsx
<section className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <Card /> {/* Day Streak */}
  <Card /> {/* Total XP */}
  <Card /> {/* Words Seen */}
  <Card /> {/* Lessons */}
</section>
```

```
Mobile (< 768px)          Desktop (≥ 768px)
┌──────┐ ┌──────┐         ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│Streak│ │  XP  │         │Streak│ │  XP  │ │Words │ │Less. │
├──────┤ ├──────┤         └──────┘ └──────┘ └──────┘ └──────┘
│Words │ │Less. │
└──────┘ └──────┘
```

### Lessons — Lesson Cards (1 → 2 columns)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {lessons.map(lesson => <Card />)}
</div>
```

```
Mobile                    Desktop
┌──────────────────┐      ┌───────────┐ ┌───────────┐
│    Lesson 1      │      │  Lesson 1 │ │  Lesson 2 │
├──────────────────┤      ├───────────┤ ├───────────┤
│    Lesson 2      │      │  Lesson 3 │ │  Lesson 4 │
└──────────────────┘      └───────────┘ └───────────┘
```

### Challenge — Mode Cards (1 → 3 columns)

```tsx
<div className="grid md:grid-cols-3 gap-6">
  <Card /> {/* Quick 10 */}
  <Card /> {/* Time Attack */}
  <Card /> {/* Full Review */}
</div>
```

No `grid-cols-1` prefix needed — grid defaults to a single column when no column count is specified.

### Quiz — Answer Options (1 → 2 columns)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {options.map(option => <Button />)}
```

On mobile all 4 answer buttons stack vertically (easy tap targets). On desktop they form a 2×2 grid.

---

## 4. Flex Direction Switching

Used when a section has two parts — description text and a CTA button — that should stack on mobile and go side by side on desktop.

### Home — Progress Section

```tsx
<div className="flex flex-col md:flex-row justify-between items-center gap-6">
  <div className="flex-1 space-y-4">
    {/* text content — takes all available width */}
  </div>
  <div className="flex-shrink-0">
    <Button>Continue Learning</Button>
    {/* doesn't grow/shrink, stays its natural size */}
  </div>
</div>
```

```
Mobile                    Desktop
┌────────────────────┐    ┌────────────────┐ ┌──────────────┐
│ Your Progress      │    │ Your Progress  │ │  Continue →  │
│ 0/10 lessons       │    │ 0/10 lessons   │ └──────────────┘
│ [===========  0%]  │    │ [==========0%] │
│                    │    └────────────────┘
│  [ Continue →  ]   │
└────────────────────┘
```

---

## 5. Responsive Typography

Text sizes scale up on larger screens where there is more room.

```tsx
{/* Daily Word — Chinese character */}
<div className="text-7xl md:text-9xl font-black">
  {dailyWord.chinese}
</div>

{/* Daily Word — Pinyin */}
<div className="text-2xl md:text-3xl">
  {dailyWord.pinyin}
</div>

{/* Daily Word — English */}
<div className="text-xl md:text-2xl">
  {dailyWord.english}
</div>
```

| Class | Mobile size | Desktop size |
|---|---|---|
| `text-7xl md:text-9xl` | 72px | 128px |
| `text-2xl md:text-3xl` | 24px | 30px |
| `text-xl md:text-2xl` | 20px | 24px |

The large Chinese character hero is designed to fill the screen on mobile and become even more dramatic on desktop without any layout breaking.

---

## 6. Responsive Padding & Spacing

The same padding that feels comfortable on desktop would feel cramped or wasteful on mobile.

```tsx
{/* Card internal padding */}
<div className="p-8 md:p-12">

{/* Main layout wrapper */}
<div className="p-4 md:p-8">
```

The formula:
- `p-4` = 16px — comfortable touch target padding on mobile
- `p-8` = 32px — generous breathing room on desktop
- `p-12` = 48px — hero sections on desktop

---

## 7. Max-Width Containers — Preventing Over-Stretching

On very wide screens (1440px+), full-width content becomes hard to read. Every page uses a `max-w-*` container to cap the content width and centre it.

```tsx
{/* Global layout shell */}
<div className="max-w-5xl mx-auto p-4 md:p-8">

{/* Flashcard study view */}
<div className="max-w-3xl mx-auto">

{/* Quiz engine */}
<div className="max-w-2xl mx-auto">

{/* Challenge menu */}
<div className="max-w-4xl mx-auto">

{/* Search page */}
<div className="max-w-3xl mx-auto">
```

`mx-auto` centres the container horizontally. The `max-w-*` ensures content never stretches uncomfortably wide.

| Page | Max Width | Why |
|---|---|---|
| Layout shell | `max-w-5xl` (1024px) | Full dashboard, needs space |
| Lesson flashcard | `max-w-3xl` (768px) | Single card, centred focus |
| Quiz | `max-w-2xl` (672px) | Focused reading experience |
| Challenge | `max-w-4xl` (896px) | 3 cards side by side |
| Search | `max-w-3xl` (768px) | List view, not too wide |

---

## 8. The `useIsMobile` Hook

When CSS alone isn't enough (e.g. conditionally rendering a completely different component, not just changing classes), the app uses a JavaScript hook that reacts to the window size in real time.

```typescript
// src/hooks/use-mobile.tsx

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    mql.addEventListener("change", onChange)   // fires when window resizes
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)  // set immediately on mount
    
    return () => mql.removeEventListener("change", onChange)  // cleanup
  }, [])

  return !!isMobile
}
```

**How to use it:**

```tsx
const isMobile = useIsMobile();

return isMobile ? <MobileComponent /> : <DesktopComponent />;
```

This hook uses `window.matchMedia` (the same API browsers use for CSS `@media` queries) so the state updates the moment the window crosses 768px — no polling, no lag.

---

## 9. Fixed Viewport-Anchored Elements

Some UI must always be visible regardless of scroll position.

### Mobile hamburger menu overlay

```tsx
<div className="fixed inset-0 top-16 z-50">
```

`fixed` removes the element from document flow and pins it to the viewport. `inset-0` means all four edges (top/right/bottom/left) touch the viewport edges. `z-50` keeps it on top of everything else.

### Quiz feedback bar

After answering a quiz question, a feedback bar slides up from the bottom of the screen:

```tsx
<div className="fixed bottom-0 left-0 right-0 p-6 md:p-8 animate-in slide-in-from-bottom border-t-2">
  <div className="max-w-2xl mx-auto flex items-center justify-between">
    {/* Correct/Incorrect + Next button */}
  </div>
</div>
```

- `fixed bottom-0 left-0 right-0` — always pinned to the bottom of the viewport on every screen size
- `max-w-2xl mx-auto` — the content inside the bar is still constrained and centred so it doesn't stretch too wide on large screens
- `p-6 md:p-8` — responsive padding inside the bar

---

## 10. Preventing Text Overflow in Flex Containers

When text is inside a flex container alongside other elements, it can push siblings out of bounds. Two utility classes prevent this:

```tsx
{/* Lessons page — lesson card */}
<div className="flex-1 min-w-0 mr-4">
  <h3>{lesson.title}</h3>
  <p className="truncate">{lesson.topic}</p>
```

- `flex-1` — take up remaining space
- `min-w-0` — override the default `min-width: auto` that prevents flex items from shrinking below their content size (critical for truncation to work)
- `truncate` — clip overflowing text with an ellipsis (`…`) instead of wrapping or overflowing

Without `min-w-0`, long topic names would push the status icon off screen.

---

## 11. Fixed-Height Flashcard

The flashcard always has a fixed height regardless of device:

```tsx
<div className="perspective-1000 min-h-[400px]">
  <Card className="h-[400px] ...">
```

`h-[400px]` uses Tailwind's arbitrary value syntax to set an exact pixel height. The back side of the card has `overflow-y-auto` so if the example sentences are long, the card scrolls internally rather than growing and breaking the layout:

```tsx
<div className="absolute inset-0 ... overflow-y-auto">
```

---

## 12. Touch-Friendly Tap Targets

On mobile, tappable elements need to be large enough to hit reliably (minimum 44×44px recommended).

```tsx
{/* Navigation links in mobile menu */}
<Link className="flex items-center gap-3 p-4 rounded-xl text-lg font-medium">

{/* Icon buttons */}
<Button variant="ghost" size="icon">   {/* size="icon" = 40×40px */}

{/* Quiz answer buttons */}
<Button size="lg" className="h-16 text-lg">   {/* 64px tall */}
<Button size="lg" className="h-auto py-4">    {/* min 32px + 16px padding each side */}
```

Mobile menu items use `p-4` (16px padding all around) making each link a generous 48px+ tall touch target. Quiz buttons use `h-16` (64px) for very comfortable tapping.

---

## 13. `whitespace-normal` on Buttons

Long text inside quiz option buttons would get clipped by default. Fix it:

```tsx
<Button className="h-auto py-4 whitespace-normal">
  {option}   {/* may be a long English phrase */}
</Button>
```

- `whitespace-normal` — allows text to wrap onto multiple lines
- `h-auto` — button height grows to fit the wrapped text
- `py-4` — keeps vertical padding consistent regardless of height

---

## Full Breakpoint Map

This is every responsive class used across the project, summarised in one table:

| Class | Mobile | Desktop (`md:`, ≥768px) | Where used |
|---|---|---|---|
| `flex-col md:flex-row` | Stack vertically | Side by side | App shell, progress section |
| `hidden md:flex` | Hidden | Visible | Desktop sidebar |
| `md:hidden` | Visible | Hidden | Mobile header, mobile menu |
| `grid-cols-2 md:grid-cols-4` | 2 columns | 4 columns | Home stats |
| `grid-cols-1 md:grid-cols-2` | 1 column | 2 columns | Lessons, quiz options |
| `grid md:grid-cols-3` | 1 column | 3 columns | Challenge modes |
| `p-4 md:p-8` | 16px | 32px | Main content wrapper |
| `p-8 md:p-12` | 32px | 48px | Daily Word hero |
| `p-6 md:p-8` | 24px | 32px | Quiz feedback bar |
| `text-7xl md:text-9xl` | 72px | 128px | Daily word Chinese character |
| `text-2xl md:text-3xl` | 24px | 30px | Daily word pinyin |
| `text-xl md:text-2xl` | 20px | 24px | Daily word English |
| `fixed bottom-0 left-0 right-0` | Pinned to bottom | Pinned to bottom | Quiz feedback bar |
| `fixed inset-0 top-16 z-50` | Fullscreen overlay | Never shown | Mobile nav menu |
| `sticky top-0 h-screen` | Never shown | Sticky sidebar | Desktop sidebar |
| `max-w-5xl mx-auto` | Full-width | Capped+centred | Layout shell |
| `max-w-3xl mx-auto` | Full-width | Capped+centred | Flashcard, search |
| `max-w-2xl mx-auto` | Full-width | Capped+centred | Quiz engine |
| `flex-1 min-w-0` + `truncate` | Prevent overflow | Prevent overflow | Lesson card text |

---

## Copy-Paste Starter Template

Here is the minimal shell you need to replicate this responsive layout in your own project:

### `layout.tsx`

```tsx
import { useState } from "react";

export function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/quiz", label: "Quiz" },
    { href: "/stats", label: "Stats" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">

      {/* Mobile header — hidden on desktop */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        <span className="font-bold text-xl text-primary">MyApp</span>
        <button onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      </div>

      {/* Mobile menu overlay — hidden on desktop */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-background/95 backdrop-blur-sm p-4">
          <nav className="flex flex-col gap-2">
            {navItems.map(item => (
              <a key={item.href} href={item.href}
                onClick={() => setMenuOpen(false)}
                className="p-4 rounded-xl text-lg font-medium hover:bg-muted"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex w-64 flex-col border-r bg-card sticky top-0 h-screen">
        <div className="p-6">
          <span className="font-bold text-2xl text-primary">MyApp</span>
        </div>
        <nav className="flex-1 px-4 flex flex-col gap-2">
          {navItems.map(item => (
            <a key={item.href} href={item.href}
              className="px-4 py-3 rounded-xl font-medium hover:bg-muted"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}
```

### `use-mobile.tsx`

```tsx
import { useState, useEffect } from "react";

const BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(window.innerWidth < BREAKPOINT);
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
```

### Responsive grid page section

```tsx
{/* 2 columns mobile → 4 columns desktop */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <StatCard />
  <StatCard />
  <StatCard />
  <StatCard />
</div>

{/* 1 column mobile → 2 columns desktop */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>

{/* Stack mobile → side by side desktop */}
<div className="flex flex-col md:flex-row gap-6 items-center">
  <div className="flex-1">{/* main content */}</div>
  <div className="flex-shrink-0">{/* CTA button */}</div>
</div>
```
