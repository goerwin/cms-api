const React = require('react');
const Header = require('./Header');
const Posts = require('./Posts');

module.exports = function IndexPage(props) {
    return (
        <main>
            <Header
                blogAuthor={props.blogAuthor}
                slogan={props.slogan}
                website={props.website}
            />
            <Posts posts={props.posts} />
        </main>
    );
};
