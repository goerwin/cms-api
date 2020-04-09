const React = require('react');
const ReactDom = require('react-dom');
const { BrowserRouter: Router, Switch, Route } = require('react-router-dom');
const Default = require('./Default');

const DefaultTheme = (
    <Router>
        <Switch>
            <Route exact path="/">
                <Default.IndexPage data={Default.sampleData.indexPage} />
            </Route>
            <Route exact path="/postPage">
                <Default.PostPage data={Default.sampleData.postPage} />
            </Route>
        </Switch>
    </Router>
);

ReactDom.render(DefaultTheme, document.getElementById('app-root'));
