const React = require('react');
const classNames = require('classnames');
const { useState, useEffect } = require('react');
const styles = require('./Header.module.css');

function Header({ slogan, blogAuthor, blogUrl, website, tagsPageUrl }) {
    const [hideHeader, setHideHeader] = useState(false);

    useEffect(() => {
        const DELTA = 50;
        let lastScrollPosition = 0;

        const handleScroll = () => {
            const currentScrollY = window.scrollY >= 0 ? window.scrollY : 0;

            setHideHeader(
                currentScrollY > DELTA &&
                    currentScrollY - lastScrollPosition > 0
            );

            lastScrollPosition = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div
            className={classNames(
                styles.container,
                hideHeader ? styles.containerIsHidden : null
            )}
        >
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
