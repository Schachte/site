export default function AboutPage() {
  return (
    <>
      <div className="blog_post">
        <div className="post_header">
          <div className="post_title">About</div>
        </div>
        <div className="post_body">
          <p>
            👋, I&#39;m Ryan Schachte. I&#39;m a computer systems engineer at{" "}
            <u>
              <a href="https://cloudflare.com">Cloudflare</a>
            </u>{" "}
            working on video stuff. I love learning, teaching and programming.
            You can check out some of my past talks and videos over at{" "}
            <u>
              <a href="https://youtube.com/thesimpleengineer">Youtube.</a>
            </u>
          </p>

          <p>
            This is my blog where I post about random thoughts, code snippets,
            technology or low-level stuff. It&#39;s a journal for the public. It&#39;s meant to be simple, fast and no bullshit.
          </p>

          <p>
            I live in Santa Barbara, CA. If you ever want to grab a coffee, drop me a <u><a href="mailto:code@ryan-schachte.com">note!</a></u>
          </p>
        </div>
      </div>
    </>
  );
}
