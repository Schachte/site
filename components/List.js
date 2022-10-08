import Link from 'next/link'

export default function List({ posts }) {
    return (
        <section className="posts">
            {posts.map(({ meta: post, slug}) => {
                return (
                    <Link key={slug} href={`/files/${slug}`}>
                    <div className="post">
                        <span className="title">{post.title}</span>
                        <span className="date">{post.date}</span>
                    </div>
                    </Link>
                )
            })}
        </section>
    )
}