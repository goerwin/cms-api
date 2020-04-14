const React = require('react');
const Header = require('./Header');
const Posts = require('./Posts');

module.exports = function IndexPage(props) {
    return (
        <main>
            <Header {...props.header} />
            <Posts posts={props.posts} />
        </main>
    );
};
