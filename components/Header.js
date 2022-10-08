import Link from "next/link";

export default function Header() {
  return (
    <header className="header">
      <Link href="/">
        <div className="logo">
          <h1>Ryan Schachte</h1>
          <h3 className="subtitle">{'echo "random thoughts" > /dev/null'} </h3>
        </div>
      </Link>
      <div className="navigation">
        <Link href="/">
          <div>Home</div>
        </Link>
        <Link href="/">
          <div>Posts</div>
        </Link>
        <Link href="/">
          <div>Videos</div>
        </Link>
        <Link href="/">
          <div>Contact</div>
        </Link>
      </div>
    </header>
  );
}