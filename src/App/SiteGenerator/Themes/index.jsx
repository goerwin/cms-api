const React = require('react');
const ReactDom = require('react-dom');
const { BrowserRouter: Router, Switch, Route } = require('react-router-dom');
const Default = require('./Default');
const helpers = require('../helpers');
const blogSample = require('./blogSample');

const parsedBlog = helpers.getParsedBlog(blogSample);
parsedBlog.metadata.baseUrl = '/';
parsedBlog.header.blogUrl = '/';

const DefaultTheme = (
    <Router>
        <Switch>
            <Route exact path="/">
                <Default.IndexPage {...parsedBlog} />
            </Route>
            <Route
                exact
                path="/:postUrl"
                render={(routerProps) => (
                    <Default.PostPage
                        {...parsedBlog.posts.find(
                            (post) =>
                                post.url === routerProps.match.params.postUrl
                        )}
                    />
                )}
            />
        </Switch>
    </Router>
);

ReactDom.render(DefaultTheme, document.getElementById('app-root'));
