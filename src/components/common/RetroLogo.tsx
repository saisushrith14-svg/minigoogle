interface RetroLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export function RetroLogo({ size = 'xl', showTagline = false }: RetroLogoProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
    xl: 'text-[54px]',
  }[size];

  return (
    <div className="select-none text-center">
      <span
        className={`font-serif font-bold tracking-tight inline-block leading-none ${sizeClasses}`}
        style={{ textShadow: '2px 2px 0px #C6C5D9' }}
      >
        <span style={{ color: '#0000CC' }}>M</span>
        <span style={{ color: '#CC0000' }}>i</span>
        <span style={{ color: '#D0A600' }}>n</span>
        <span style={{ color: '#0000CC' }}>i</span>
        <span style={{ color: '#002200' }}>G</span>
        <span style={{ color: '#CC0000' }}>o</span>
        <span style={{ color: '#D0A600' }}>o</span>
        <span style={{ color: '#0000CC' }}>g</span>
        <span style={{ color: '#008000' }}>l</span>
        <span style={{ color: '#CC0000' }}>e</span>
        <span style={{ color: '#CC0000', fontWeight: '900' }}>!</span>
      </span>
      {showTagline && (
        <div className="font-serif italic text-base text-black mt-1 mb-3">
          Search the web using MiniGoogle!
        </div>
      )}
    </div>
  );
}

