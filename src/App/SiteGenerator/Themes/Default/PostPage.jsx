const React = require('react');
const Header = require('./Header');
require('./PostPage.scss');

module.exports = function PostPage(props) {
    return (
        <main>
            <Header
                blogAuthor={props.blogAuthor}
                slogan={props.slogan}
                website={props.website}
            />
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
                <div className="PostPage__content">
                    <p>{props.content}</p>
                </div>

                <div className="PostPage__otherposts">
                    <a href={props.prevPost.url}>{props.prevPost.title}</a>
                    <a href={props.nextPost.url}>{props.prevPost.title}</a>
                </div>
            </div>
        </main>
    );
};
