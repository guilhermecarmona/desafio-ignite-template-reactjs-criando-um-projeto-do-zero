import Link from 'next/link';

import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header(): JSX.Element {
  return (
    <div className={commonStyles.container}>
      <header className={commonStyles.content}>
        <nav className={styles.headerContent}>
          <Link href="/">
            <a>
              <img src="/images/logo.svg" alt="logo" />
            </a>
          </Link>
        </nav>
      </header>
    </div>
  );
}