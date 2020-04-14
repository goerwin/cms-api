const React = require('react');
const Header = require('./Header');
require('./PostPage.scss');

module.exports = function PostPage(props) {
    return (
        <main>
            <Header {...props.header} />
            <div className="PostPage">
                <h2>{props.title}</h2>
                <small>tags: {props.tags.join(', ')}</small>
                <p className="PostPage__metadata">
                    <span className="PostPage__metadataTime">{props.date}</span>
                    <span className="PostPage__metadataReadtime">
                        {' '}
                        · ☕ {props.readTime}
                    </span>
                </p>
                <div
                    className="PostPage__content"
                    dangerouslySetInnerHTML={{ __html: props.content }}
                />
                <div className="PostPage__otherposts">
                    {props.previousPost && (
                        <a
                            className="PostPage__otherposts__prev"
                            href={props.previousPost.url}
                        >
                            ← {props.previousPost.title}
                        </a>
                    )}
                    {props.nextPost && (
                        <a
                            className="PostPage__otherposts__next"
                            href={props.nextPost.url}
                        >
                            {props.nextPost.title} →
                        </a>
                    )}
                </div>
            </div>
        </main>
    );
};
