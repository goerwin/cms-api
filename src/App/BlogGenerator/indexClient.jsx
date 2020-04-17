const React = require('react');
const ReactDom = require('react-dom');
const DefaultTheme = require('./Themes/Default');

let component;

// TODO: This should be improved a lot so that we don't put no needed code
// in the pages. Probably need to do something like chunks and stuff
if (window.__PAGE__ === 'index') {
    component = <DefaultTheme.IndexPage {...window.__STATE__} />;
} else if (window.__PAGE__ === 'post') {
    component = <DefaultTheme.PostPage {...window.__STATE__} />;
}

ReactDom.hydrate(
    component,
    document.getElementById('app-root')
);
