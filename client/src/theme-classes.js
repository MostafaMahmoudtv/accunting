/* eslint-disable */
// Force Tailwind to include all our theme-aware utility classes by referencing
// them from a file the content scanner finds. Without this, a class that's
// only ever set via CSS variables can get tree-shaken out of the build.
const _ = [
  'bg-app',
  'bg-app-card',
  'bg-app-sidebar',
  'bg-app-topbar',
  'bg-app-muted',
  'bg-app-muted-surface',
  'text-app-heading',
  'text-app-body',
  'text-app-muted',
  'border-app-border',
  'ring-app-ring',
  'hover:bg-app-muted',
];
export default _;
