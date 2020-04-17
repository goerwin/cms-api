const React = require('react');
const PostCard = require('./PostCard');
const Pagination = require('./Pagination');
const styles = require('./Posts.module.css');

function Posts({ posts, pagination }) {
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
            {pagination && (
                <Pagination
                    activePage={pagination.activePage}
                    totalPages={pagination.totalPages}
                    itemsPerPage={pagination.itemsPerPage}
                    items={pagination.items}
                />
            )}
        </div>
    );
}

module.exports = Posts;
