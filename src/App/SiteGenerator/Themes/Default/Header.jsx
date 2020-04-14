const React = require('react');
require('./Header.scss');

module.exports = function Header({ slogan, blogAuthor, blogUrl, website }) {
    return (
        <div className="Header">
            <div className="Header__author">
                <img src="" alt="" className="Header__authorImg" />
                <h2 className="Header__authorName">
                    <a href={blogUrl}>Blog</a> by{' '}
                    <a href={website}>{blogAuthor}</a>
                </h2>
                <span className="Header__authorSlogan">{slogan}</span>
            </div>
        </div>
    );
};
