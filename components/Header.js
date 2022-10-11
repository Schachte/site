import Link from "next/link";

export default function Header() {
  return (
    <header className="header">
      <Link href="/">
        <div className="logo">
          <h1>ryan.schachte</h1>
          <h3 className="subtitle">{'echo "random thoughts" > /dev/null'} </h3>
        </div>
      </Link>
      <div className="navigation">
        <Link href="/">
          <div>Home</div>
        </Link>
        <Link href="/about">
          <div>About</div>
        </Link>
        <div>
          <a href="https://youtube.com/thesimpleengineer">Videos</a>
        </div>
        <div>
          <a href="mailto:code@ryan-schachte.com">Contact</a>
        </div>
      </div>
    </header>
  );
}
