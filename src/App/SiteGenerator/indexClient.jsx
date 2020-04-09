const React = require('react');
const ReactDom = require('react-dom');
const DefaultTheme = require('./Themes/Default');

module.exports = {
    indexPage: ReactDom.hydrate(
        <DefaultTheme.IndexPage />,
        document.getElementById('app-root')
    ),
};
