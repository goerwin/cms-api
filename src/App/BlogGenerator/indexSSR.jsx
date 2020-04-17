const React = require('react');
const ReactDomServer = require('react-dom/server');
const DefaultTheme = require('./Themes/Default');

function getIndexPage(props) {
    return ReactDomServer.renderToString(<DefaultTheme.IndexPage {...props} />);
}

function getPostPage(props) {
    return ReactDomServer.renderToString(<DefaultTheme.PostPage {...props} />);
}

module.exports = {
    getIndexPage,
    getPostPage,
};
