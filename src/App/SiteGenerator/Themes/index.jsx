const React = require('react');
const ReactDom = require('react-dom');
const { BrowserRouter: Router, Switch, Route } = require('react-router-dom');
const Default = require('./Default');

const DefaultTheme = (
    <Router>
        <Switch>
            <Route exact path="/">
                <Default.IndexPage {...Default.sampleData} />
            </Route>
            <Route exact path="/:postUrl">
                <Default.PostPage
                    {...Default.sampleData}
                    {...Default.sampleData.posts[0]}
                />
            </Route>
        </Switch>
    </Router>
);

ReactDom.render(DefaultTheme, document.getElementById('app-root'));
