import type { Category } from '@/engine/types';
export function Icon({ name, ...props }: { name: string } & React.SVGProps<SVGSVGElement>) {
  const paths: Record<string, string> = {
    today: 'M4 4h16v16H4z M8 2v4 M16 2v4 M4 9h16 M8 13h3v3H8z',
    history: 'M3 12a9 9 0 1 0 3-7 M3 3v6h6 M12 7v6l4 2',
    rival: 'M6 3h12v4h3v10h-3v4H6v-4H3V7h3z M7 10h3 M14 10h3 M8 16h8',
    settings: 'M9 3h6v3h3v3h3v6h-3v3h-3v3H9v-3H6v-3H3V9h3V6h3z M9 9h6v6H9z',
    study: 'M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3z M12 6v15',
    fitness: 'M2 8h3v8H2z M5 5h3v14H5z M8 11h8v2H8z M16 5h3v14h-3z M19 8h3v8h-3z',
    health: 'M12 2 5 12v5l3 4h8l3-4v-5z',
    life: 'M3 10 12 3l9 7 M5 9v12h14V9 M10 21v-7h4v7',
    plus: 'M12 4v16 M4 12h16',
    check: 'M5 12l5 5L20 6',
    clock: 'M3 3h18v18H3z M12 6v7h5',
    arrow: 'M4 12h16 M14 6l6 6-6 6',
    shield: 'M4 3h16v12l-8 6-8-6z',
    flame: 'M12 2 5 10v8l4 4h7l4-4v-7l-5-4v6l-3-2z',
    close: 'M5 5l14 14 M19 5 5 19',
    edit: 'M4 16 16 4l4 4L8 20H4z',
    volume: 'M3 9h5l6-5v16l-6-5H3z M18 8v8 M21 5v14',
    star: 'M12 2l3 6h7l-5 5 2 8-7-4-7 4 2-8-5-5h7z',
    download: 'M12 3v12 M7 10l5 5 5-5 M3 17v4h18v-4',
  };
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="miter"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] ?? paths.life} />
    </svg>
  );
}
export function CategoryIcon({ category }: { category: Category }) {
  return (
    <span className={'category ' + category}>
      <Icon name={category} />
    </span>
  );
}
