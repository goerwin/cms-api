const React = require('react');
const classNames = require('classnames');
const { useState, useEffect } = require('react');
const styles = require('./Header.module.css');

function Header({
    slogan,
    author,
    baseUrl,
    authorWebsite,
    tagsPageUrl,
    authorImg,
}) {
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
                    <div
                        style={{ backgroundImage: `url(${authorImg})` }}
                        className={styles.authorImg}
                    />
                    <h2 className={styles.authorName}>
                        <a href={baseUrl}>Blog</a> by{' '}
                        <a
                            href={authorWebsite}
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            {author}
                        </a>
                    </h2>
                    <span className={styles.authorSlogan}>{slogan}</span>
                </div>

                <div className={styles.floatMenu}>
                    <a href={baseUrl}>Home</a>
                    <a href={tagsPageUrl}>Tags</a>
                </div>
            </div>
        </div>
    );
}

module.exports = Header;
