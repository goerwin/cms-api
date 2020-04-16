const React = require('react');
const Header = require('./Header');
const PostCard = require('./PostCard');
const styles = require('./PostPage.module.css');

module.exports = function PostPage(props) {
    return (
        <main>
            <Header {...props.header} />
            <div className={styles.container}>
                <PostCard
                    className={styles.postCard}
                    title={props.title}
                    tags={props.tags}
                    date={props.date}
                    readTime={props.readTime}
                />
                <div
                    className={styles.content}
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
