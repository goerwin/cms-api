const React = require('react');
const classNames = require('classnames');
const styles = require('./Pagination.module.css');

function Pagination(props) {
    if (props.totalPages === 1) {
        return null;
    }

    return (
        <div className={styles.pagination}>
            {props.items.map((item) => (
                <a
                    key={item.id}
                    href={item.href}
                    className={classNames(
                        styles.paginationItem,
                        item.id === props.activePage
                            ? styles.paginationItemActive
                            : null
                    )}
                >
                    {item.id}
                </a>
            ))}
        </div>
    );
}

module.exports = Pagination;
