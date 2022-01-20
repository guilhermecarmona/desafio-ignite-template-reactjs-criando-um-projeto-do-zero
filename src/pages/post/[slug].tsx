import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import Head from 'next/head';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post}: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const getEstimatedReadingTime = (value: Post): number => {
    const wordsPerMinute = 200;
    const totalWordsInBody = RichText.asText(
      value.data.content.reduce((acc, { body }) => [...acc, ...body], [])
    ).split(' ').length;

    const totalWordsInHeading = RichText.asText(
      value.data.content.reduce((acc, { heading }) => {
        if (heading) {
          return [...acc, ...heading.split('')];
        }
        return [...acc];
      }, [])
    ).split(' ').length;

    return Math.ceil((totalWordsInBody + totalWordsInHeading) / wordsPerMinute);
  };

  const estimatedReadingTime = getEstimatedReadingTime(post);
  
  return (
    <>
      <Head>
        <title>{post.data.title} | spacetravelling.</title>
      </Head>
      <main>
        <header className={styles.banner}>
          <img src={post.data.banner.url} alt="banner" />
        </header>
        <article className={commonStyles.content}>
          <header className={styles.header}>
            <h1>{post.data.title}</h1>
            <div>
              <div>
                {post.first_publication_date && (
                  <span>
                    <FiCalendar />
                    {format(
                      new Date(post.first_publication_date),
                      'd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </span>
                )}
                <span>
                  <FiUser />
                  {post.data.author}
                </span>  
                <span>
                  <FiClock />
                  {estimatedReadingTime} min
                </span>              
              </div>              
            </div>
          </header>
          <div className={styles.body}>
            {post.data.content.map(content => (
              <div key={content.heading}>
                <h2>{content.heading}</h2>
                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </div>
            ))}
          </div>          
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts')
  );

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({params}) => {
  const { slug } = params;
  const prismic = getPrismicClient();

  try {
    const response = await prismic.getByUID('posts', String(slug), {});

    const post = {
      uid: response?.uid ?? null,
      first_publication_date: response?.first_publication_date ?? null,
      data: {
        title: response?.data.title ?? null,
        subtitle: response?.data.subtitle ?? null,
        author: response?.data.author ?? null,
        banner: {
          url: response?.data.banner.url ?? null,
        },
        content:
          response?.data.content.map(content => {
            return {
              heading: content.heading,
              body: content.body,
            };
          }) ?? [],
      },
    };

    return {
      props: {
        post,
      },
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error.message);
  } 
  
};
