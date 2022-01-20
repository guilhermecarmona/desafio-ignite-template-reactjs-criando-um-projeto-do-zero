import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

import styles from './styles.module.scss';

interface PostLinkProps {
  post: {
    uid?: string;
    first_publication_date: string | null;
    data: {
      title: string;
      subtitle: string;
      author: string;
    };
  };
}

export function PostLink({ post }: PostLinkProps) {
  return (
    <Link href={`/post/${post.uid}`}>
      <a className={styles.post}>
        <h1>{post.data.title}</h1>
        <h3>{post.data.subtitle}</h3>
        <div className={styles.infoContainer}>
          <div className={styles.info}>
            <FiCalendar />
            <span>{format(new Date(post.first_publication_date), `d MMM y`, {locale: ptBR})}</span>
          </div>
          <div className={styles.info}>
            <FiUser />
            <span>{post.data.author}</span>
          </div>
        </div>
      </a>
    </Link>
  );
}
