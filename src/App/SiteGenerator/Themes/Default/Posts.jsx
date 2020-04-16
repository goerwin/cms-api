const React = require('react');
require('./Posts.scss');

function Component({ posts }) {
    return (
        <div className="Posts">
            {posts.map((post) => (
                <div key={post.url} className="Posts__post">
                    <h2 className="global__title">
                        <a href={post.url}>{post.title}</a>
                    </h2>
                    <p className="Posts__metadata">
                        <span className="Posts__metadataTime">{post.date}</span>
                        <span className="Posts__metadataReadtime">
                            {' '}
                            · ☕ {post.readTime}
                        </span>
                    </p>
                    <p>{post.description}</p>
                </div>
            ))}
        </div>
    );
}

module.exports = Component;