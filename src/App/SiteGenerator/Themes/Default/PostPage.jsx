const React = require('react');
const Header = require('./Header');
require('./PostPage.scss');

module.exports = function PostPage() {
    return (
        <main>
            <Header />
            <div className="PostPage">
                <h2>This is the title of the Post</h2>
                <p className="PostPage__metadata">
                    <span className="PostPage__metadataTime">
                        July 30, 2019
                    </span>
                    <span className="PostPage__metadataReadtime">
                        {' '}
                        · ☕ 10 min. read
                    </span>
                </p>
                <div className="PostPage__content">
                    <p>
                        This is the content of the post, This is the content of
                        the postThis is the content of the postThis is the
                        content of the postThis is the content of the postThis
                        is the content of the postThis is the content of the
                        postThis is the content of the postThis is the content
                        of the postThis is the content of the postThis is the
                        content of the postThis is the content of the postThis
                        is the content of the postThis is the content of the
                        postThis is the content of the postThis is the content
                        of the postThis is the content of the postThis is the
                        content of the postThis is the content of the postThis
                        is the content of the postThis is the content of the
                        postThis is the content of the postThis is the content
                        of the postThis is the content of the postThis is the
                        content of the post
                    </p>
                </div>
            </div>
        </main>
    );
};
