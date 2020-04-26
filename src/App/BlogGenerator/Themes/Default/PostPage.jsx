const React = require('react');
const Header = require('./Header');
const PostCard = require('./PostCard');
const styles = require('./PostPage.module.css');
const contentStyles = require('./PostPage.content.module.css');

module.exports = function PostPage(props) {
    return (
        <main>
            <Header {...props} />
            <div className={styles.container}>
                <PostCard
                    className={styles.postCard}
                    title={props.title}
                    tags={props.tags}
                    date={props.dateParsed}
                    readTime={props.readTime}
                    customDescription={props.customDescription}
                />
                <div
                    className={contentStyles.markdownBody}
                    dangerouslySetInnerHTML={{ __html: props.content }}
                />
                <div className={styles.otherposts}>
                    {props.previousPost && (
                        <a
                            className={styles.otherpostsPrev}
                            href={props.previousPost.url}
                        >
                            ← {props.previousPost.title}
                        </a>
                    )}
                    {props.nextPost && (
                        <a
                            className={styles.otherpostsNext}
                            href={props.nextPost.url}
                        >
                            {props.nextPost.title} →
                        </a>
                    )}
                </div>
            </div>
        </main>
    );
};
