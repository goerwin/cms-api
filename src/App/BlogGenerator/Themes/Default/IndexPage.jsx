const React = require('react');
const Header = require('./Header');
const Posts = require('./Posts');

function IndexPage(props) {
    return (
        <main>
            <Header {...props.header} />
            <Posts
                posts={props.posts}
                pagination={props.pagination}
            />
        </main>
    );
};

module.exports = IndexPage;