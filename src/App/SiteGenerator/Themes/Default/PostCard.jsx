const React = require('react');
const classNames = require('classnames');
const styles = require('./PostCard.module.css');

function Component(props) {
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
                <span>{props.date}</span>
                <span> · ☕ {props.readTime}</span>
            </p>
            {props.tags && props.tags.length > 0 && (
                <div>
                    {props.tags.map((el) => (
                        <a className={styles.tag} key={el} href={el}>
                            {el}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

module.exports = Component;
