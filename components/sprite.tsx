/** Original 24×24 artwork; SVG coordinates remain integer-aligned. */
export function Sprite({
  kind = 'blaze',
  palette = 'ember',
  player = false,
  large = false,
  level = 1,
}: {
  kind?: string;
  palette?: string;
  player?: boolean;
  large?: boolean;
  level?: number;
}) {
  return (
    <svg
      className={`sprite ${large ? 'large' : ''} ${player ? 'player' : palette}`}
      viewBox="0 0 24 24"
      role="img"
      aria-label={player ? 'Your pixel adventurer' : `${kind}, rival adventurer`}
      shapeRendering="crispEdges"
    >
      <path className="sprite-shadow" d="M5 22h14v2H5z" />
      <path
        className="sprite-outline"
        d="M8 1h8v1h3v2h1v6h-1v2h-2v2h2v2h2v6h-6v-3h-6v3H3v-6h2v-2h2v-2H5v-2H4V4h1V2h3z"
      />
      <path
        className="sprite-accent"
        d={
          kind === 'byte'
            ? 'M6 3h12v6H6z M7 14h10v5H7z'
            : kind === 'moss'
              ? 'M7 2h10v2h3v3H4V4h3z M7 14h10v5H7z'
              : 'M7 2h10v1h2v3H5V4h2z M7 14h10v5H7z'
        }
      />
      <path className="sprite-skin" d="M6 7h12v4h-2v2H8v-2H6z M5 16h2v3H5z M17 16h2v3h-2z" />
      <path
        className="sprite-outline"
        d="M8 8h2v2H8z M14 8h2v2h-2z M10 11h4v1h-4z M7 19h4v3H7z M13 19h4v3h-4z"
      />
      <path className="sprite-highlight" d="M8 3h6v1H8z M8 15h2v3H8z" />
      {level >= 5 && (
        <path className="sprite-gold" d="M3 13h4v2H3z M17 13h4v2h-4z M10 15h4v2h-4z" />
      )}
      {level >= 10 && <path className="sprite-gold" d="M7 0h2v2h2V0h2v2h2V0h2v3H7z" />}
    </svg>
  );
}
