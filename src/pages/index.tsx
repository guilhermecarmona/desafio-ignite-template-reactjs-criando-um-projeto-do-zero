import { GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { useState } from 'react';

import { getPrismicClient } from '../services/prismic';
import { PostLink } from '../components/PostLink';

import styles from './home.module.scss';
import commonStyles from '../styles/common.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [nextLink, setNextLink] = useState(postsPagination.next_page);
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);

  const loadMorePosts = async (nextPage: string): Promise<void> => {
    const result = await fetch(nextPage);
    const data = await result.json();
    const newPostPagination = {
      nextPage: data.next_page,
      results: data.results.map(post => {
        return {
          uid: post.uid,
          first_publication_date: post.first_publication_date,
          data: post.data,
        };
      }),
    };
    setNextLink(newPostPagination.nextPage);

    setPosts(prevState => [...prevState, ...newPostPagination.results]);
  };

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <div className={commonStyles.container}>
        <main className={styles.content}>
          <div className={styles.postsContainer}>
            {!posts ? (
              <p>Carregando...</p>
            ) : (
              posts.map((post: Post) => (
                <PostLink key={post.uid} post={post} />
              ))
            )}
          </div>
          {nextLink && (
            <button
              type="button"
              className={styles.loadButton}
              onClick={() => loadMorePosts(nextLink)}
            >
              Carregar mais posts
            </button>
          )}
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
    }
  );

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: post.data,
      };
    }),
  };

  return {
    props: { postsPagination },
  };
};
