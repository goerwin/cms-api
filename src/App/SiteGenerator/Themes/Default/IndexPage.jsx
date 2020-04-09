const React = require('react');
const Header = require('./Header');
const Posts = require('./Posts');

module.exports = function IndexPage({ data }) {
    return (
        <main>
            <Header/>
            <Posts />
        </main>
    );
};
