const React = require('react');
const PostCard = require('./PostCard');
const styles = require('./Posts.module.css');

function Component({ posts }) {
    return (
        <div className={styles.container}>
            {posts.map((post) => (
                <div key={post.url} className={styles.post}>
                    <PostCard
                        title={post.title}
                        url={post.url}
                        tags={post.tags}
                        date={post.date}
                        readTime={post.readTime}
                    />
                    <p>{post.description}</p>
                </div>
            ))}
        </div>
    );
}

module.exports = Component;
