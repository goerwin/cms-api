const React = require('react');
require('./Posts.scss');

module.exports = function Header() {
    return (
        <div className="Posts">
            {Array(20)
                .fill()
                .map((el, idx) => (
                    <div key={idx} className="Posts__post">
                        <h2 className="global__title">
                            <a href="noice">This is the title of the Post</a>
                        </h2>
                        <p className="Posts__metadata">
                            <span className="Posts__metadataTime">
                                July 30, 2019
                            </span>
                            <span className="Posts__metadataReadtime">
                                {' '}
                                · ☕ 10 min. read
                            </span>
                        </p>
                        <p>
                            An in-depth description of the React programming
                            model.
                        </p>
                    </div>
                ))}
        </div>
    );
};
