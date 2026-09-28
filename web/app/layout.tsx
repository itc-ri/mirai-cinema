import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'みらいシネマ',description:'暮らしのお悩みから、少し先の未来を見てみよう。'};
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="ja"><body>{children}</body></html>}
