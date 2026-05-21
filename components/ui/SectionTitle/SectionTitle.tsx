import styles from './SectionTitle.module.css';

interface Props {
  subtitle: string;
  title: string;
  centered?: boolean;
}

export const SectionTitle = ({
  subtitle,
  title,
  centered = false,
}: Props) => {
  return (
    <div
      className={`${styles.wrapper} ${
        centered ? styles.centered : ''
      }`}
    >
      <p className={styles.subtitle}>
        {subtitle}
      </p>

      <h2 className={styles.title}>
        {title}
      </h2>
    </div>
  );
};