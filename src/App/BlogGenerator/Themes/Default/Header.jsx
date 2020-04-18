const React = require('react');
const styles = require('./Header.module.css');

function Header({ slogan, blogAuthor, blogUrl, website, tagsPageUrl }) {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.author}>
                    <img src="" alt="" className={styles.authorImg} />
                    <h2 className={styles.authorName}>
                        <a href={blogUrl}>Blog</a> by{' '}
                        <a
                            href={website}
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            {blogAuthor}
                        </a>
                    </h2>
                    <span className={styles.authorSlogan}>{slogan}</span>
                </div>

                <div className={styles.floatMenu}>
                    <a href={blogUrl}>Home</a>
                    <a href={tagsPageUrl}>Tags</a>
                </div>
            </div>
        </div>
    );
}

module.exports = Header;
