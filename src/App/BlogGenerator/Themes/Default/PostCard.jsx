const React = require('react');
const classNames = require('classnames');
const styles = require('./PostCard.module.css');

function PostCard(props) {
    return (
        <div
            className={classNames(styles.container, props.className)}
            style={props.style}
        >
            <h2>
                {props.url ? (
                    <a href={props.url}>{props.title}</a>
                ) : (
                    props.title
                )}
            </h2>

            <p className={styles.metadata}>
                {props.customDescription ? (
                    <span>{props.customDescription}</span>
                ) : (
                    <>
                        <span>{props.date}</span>
                        <span> · ☕ {props.readTime} min. read</span>
                    </>
                )}
            </p>
            {props.tags && props.tags.length > 0 && (
                <div>
                    {props.tags.map((tag) => (
                        <a className={styles.tag} key={tag.url} href={tag.url}>
                            {tag.name}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

module.exports = PostCard;
