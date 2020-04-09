const React = require('react');
const ReactDomServer = require('react-dom/server');
const DefaultTheme = require('./Themes/Default');

module.exports = {
    indexPage: ReactDomServer.renderToString(<DefaultTheme.IndexPage/>),
};
