/** Two balanced strokes with a quiet, conventional close state. */
export function MenuIcon({open}:{open:boolean}) {
  return <span className={`menu-mark${open?' is-open':''}`} aria-hidden="true"><span/><span/></span>;
}
