import styles from "./NotificationsPanel.module.css";

const formatNotificationTime = (value) => {
  if (!value) {
    return "Just now";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Just now";
  }

  return parsedDate.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

function NotificationsPanel({
  title,
  description,
  notifications = [],
  emptyTitle,
  emptyDescription,
  limit = 3,
  showViewAll = true,
  showMarkAll = false,
  onMarkAll,
  onMarkRead,
  isBusy = false,
  cardClassName = "",
}) {
  const visibleNotifications = Array.isArray(notifications)
    ? notifications.slice(0, limit)
    : [];

  return (
    <article className={`${styles.panel} ${cardClassName}`.trim()}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Notifications</p>
          <h3>{title}</h3>
        </div>
        <div className={styles.headerActions}>
          {showMarkAll && visibleNotifications.length > 0 && (
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={onMarkAll}
              disabled={isBusy}
            >
              Mark all read
            </button>
          )}
          {showViewAll && (
            <a href="/notifications" className={styles.viewAllLink}>
              View all
            </a>
          )}
        </div>
      </div>
      {description && <p className={styles.description}>{description}</p>}
      {visibleNotifications.length === 0 ? (
        <div className={styles.emptyState}>
          <strong>{emptyTitle}</strong>
          <p>{emptyDescription}</p>
        </div>
      ) : (
        <div className={styles.list}>
          {visibleNotifications.map((notification) => (
            <div key={notification.id} className={styles.item}>
              <div className={styles.itemHeader}>
                <div>
                  <h4>{notification.title}</h4>
                  <p className={styles.time}>{formatNotificationTime(notification.createdAt)}</p>
                </div>
                {notification.priority === "high" && (
                  <span className={styles.priorityBadge}>Priority</span>
                )}
              </div>
              <p className={styles.body}>{notification.body}</p>
              <div className={styles.itemActions}>
                <a href={notification.ctaPath || "/"} className={styles.primaryAction}>
                  Open
                </a>
                {typeof onMarkRead === "function" && (
                  <button
                    type="button"
                    className={styles.secondaryAction}
                    onClick={() => onMarkRead(notification.id)}
                    disabled={isBusy}
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export default NotificationsPanel;
